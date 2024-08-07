import { Transition } from "@headlessui/react";
import {
  CurrencyDollarIcon,
  PercentBadgeIcon,
} from "@heroicons/react/24/outline";
import { Card, Switch, Divider, AreaChart } from "@tremor/react";
import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { CustomNumberInput } from "../Components/CustomNumberInput";
import {
  calculateRequiredPresentValue,
  calculateRequiredContributions,
  calculateFutureValueInterestWithContributions,
  formatNumberToUSD,
} from "../Utils";
import { OtherToolsCard } from "../Components/OtherToolsCard";

type FormValues<T> = {
  currentAge: T;
  retirementAge: T;
  currentSavings: T;
  monthlyContributions: T;
  monthlyBudgetInRetirement: T;
  lifeExpectancy: T;
  otherIncome: T;
  preRetirementRateOfReturn: T;
  postRetirementRateOfReturn: T;
  inflationRate: T;
};

type FormValuesAsNumbers = FormValues<number>;
type FormValuesAsStrings = FormValues<string>;

type RetirementCalculatorChartData = {
  years: number;
  year: number;
  Principal?: number;
  "Your Balance": number | null;
  "Optimal Balance": number | null;
};

const castStringsToNumbers = function (
  data: FormValuesAsStrings
): FormValuesAsNumbers {
  return {
    currentAge: parseInt(data.currentAge),
    retirementAge: parseInt(data.retirementAge),
    currentSavings: parseInt(data.currentSavings),
    monthlyContributions: parseInt(data.monthlyContributions),
    monthlyBudgetInRetirement: parseInt(data.monthlyBudgetInRetirement),
    lifeExpectancy: parseInt(data.lifeExpectancy),
    otherIncome: parseInt(data.otherIncome),
    preRetirementRateOfReturn: parseFloat(data.preRetirementRateOfReturn) / 100,
    postRetirementRateOfReturn:
      parseFloat(data.postRetirementRateOfReturn) / 100,
    inflationRate: parseFloat(data.inflationRate) / 100,
  };
};

const createDataFromNowToRetirement = ({
  currentAge,
  retirementAge,
  currentSavings,
  monthlyContributions,
  preRetirementRateOfReturn,
  inflationRate,
  monthlyBudgetInRetirement,
  postRetirementRateOfReturn,
  otherIncome,
  lifeExpectancy,
}: FormValuesAsNumbers) => {
  const perfectRetirementAmount = calculateRequiredPresentValue({
    period: lifeExpectancy - retirementAge + 1,
    rateOfReturn: postRetirementRateOfReturn - inflationRate,
    annualContributionAmount: -(monthlyBudgetInRetirement * 12) + otherIncome,
    targetBalance: 0,
  });
  const requiredContributions = calculateRequiredContributions({
    presentValue: currentSavings,
    rateOfReturn: preRetirementRateOfReturn - inflationRate,
    period: retirementAge - currentAge - 1,
    targetBalance: perfectRetirementAmount,
  });
  return new Array(retirementAge - currentAge).fill(0).map((_, i) => {
    return {
      years: i,
      year: new Date().getFullYear() + i,
      "Optimal Balance": calculateFutureValueInterestWithContributions({
        presentValue: currentSavings,
        periods: i,
        contributionAmount: requiredContributions,
        rateOfReturn: preRetirementRateOfReturn - inflationRate,
      }),
      "Your Balance": calculateFutureValueInterestWithContributions({
        presentValue: currentSavings,
        periods: i,
        contributionAmount: monthlyContributions * 12,
        rateOfReturn: preRetirementRateOfReturn - inflationRate,
      }),
    };
  });
};

const createDataFromRetirementToDeath = ({
  retirementAge,
  lifeExpectancy,
  monthlyBudgetInRetirement,
  postRetirementRateOfReturn,
  otherIncome,
  currentSavings,
  currentAge,
  inflationRate,
}: FormValuesAsNumbers) => {
  const perfectRetirementAmount = calculateRequiredPresentValue({
    period: lifeExpectancy - retirementAge + 1,
    rateOfReturn: postRetirementRateOfReturn - inflationRate,
    annualContributionAmount: -(monthlyBudgetInRetirement * 12) + otherIncome,
    targetBalance: 0,
  });

  return new Array(lifeExpectancy - retirementAge + 1).fill(0).map((_, i) => {
    const Balance = calculateFutureValueInterestWithContributions({
      presentValue: currentSavings,
      periods: i + 1,
      contributionAmount: -(monthlyBudgetInRetirement * 12) + otherIncome,
      rateOfReturn: postRetirementRateOfReturn - inflationRate,
    });
    const Optimal = calculateFutureValueInterestWithContributions({
      presentValue: perfectRetirementAmount,
      periods: i + 1,
      contributionAmount: -(monthlyBudgetInRetirement * 12) + otherIncome,
      rateOfReturn: postRetirementRateOfReturn - inflationRate,
    });
    return {
      years: i + retirementAge - currentAge,
      year: new Date().getFullYear() + i + retirementAge - currentAge,
      "Your Balance": Balance < 0 ? null : Balance,
      "Optimal Balance": Optimal,
    };
  });
};

const createFullDataSet = (data: FormValuesAsNumbers) => {
  const preRetirement = createDataFromNowToRetirement(data);
  const postRetirement = createDataFromRetirementToDeath({
    ...data,
    currentSavings: preRetirement[preRetirement.length - 1]["Your Balance"],
    monthlyContributions: 0,
  });
  return [...preRetirement, ...postRetirement];
};

const getLargestBalance = (data: RetirementCalculatorChartData[]) => {
  return Math.max(...data.map((d) => d["Your Balance"] || 0));
};

const getFirstNegativeBalance = (data: RetirementCalculatorChartData[]) => {
  return data.find((d) => d["Your Balance"] === null);
};

const defaultValues: FormValuesAsStrings = {
  currentAge: "30",
  retirementAge: "67",
  currentSavings: "35000",
  monthlyContributions: "1250",
  monthlyBudgetInRetirement: "5000",
  lifeExpectancy: "95",
  otherIncome: "0",
  preRetirementRateOfReturn: "8",
  postRetirementRateOfReturn: "5",
  inflationRate: "3",
};

export const RetirementCalculator = () => {
  const [advanced, setAdvanced] = React.useState(false);
  const [data, setData] = React.useState(
    createFullDataSet(castStringsToNumbers(defaultValues))
  );
  const [lastSubmitted, setLastSubmitted] = React.useState<FormValuesAsNumbers>(
    castStringsToNumbers(defaultValues)
  );

  const { control, watch } = useForm<FormValuesAsStrings>({
    defaultValues,
  });

  const onSubmit: SubmitHandler<any> = (data: FormValuesAsStrings) => {
    try {
      const valuesAsNumbers = castStringsToNumbers(data);
      setData(createFullDataSet(valuesAsNumbers));
      setLastSubmitted(valuesAsNumbers);
    } catch {
      console.log("uh oh :(");
    }
  };

  React.useEffect(() => {
    const subscription = watch((value) => onSubmit(value));
    return () => subscription.unsubscribe();
  }, [watch]);

  const retirementYearIndex =
    lastSubmitted.retirementAge - lastSubmitted.currentAge - 1;
  return (
    <div className="w-full flex gap-8 content-start items-start">
      <div className="w-256 flex gap-8 flex-col">
        <Card className="w-full">
          <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong mb-4">
            Retirement Scenario
          </h3>
          <form>
            <div className="flex gap-4 flex-col">
              <Controller
                name="currentAge"
                control={control}
                render={({ field }) => (
                  <CustomNumberInput
                    {...field}
                    label="Current Age"
                    placeholder="30"
                    required={true}
                  />
                )}
              />
              <Controller
                name="retirementAge"
                control={control}
                render={({ field }) => (
                  <CustomNumberInput
                    {...field}
                    label="Retirement Age"
                    placeholder="67"
                  />
                )}
              />

              <Controller
                name="currentSavings"
                control={control}
                render={({ field }) => (
                  <CustomNumberInput
                    {...field}
                    label="Current Savings"
                    placeholder="35000"
                    required={true}
                    icon={CurrencyDollarIcon}
                    step={1000}
                  />
                )}
              />
              <Controller
                name="monthlyContributions"
                control={control}
                render={({ field }) => (
                  <CustomNumberInput
                    {...field}
                    label="Monthly Contributions"
                    placeholder="1000"
                    required={true}
                    icon={CurrencyDollarIcon}
                    step={100}
                  />
                )}
              />
              <Controller
                name="monthlyBudgetInRetirement"
                control={control}
                render={({ field }) => (
                  <CustomNumberInput
                    {...field}
                    label="Monthly Budget in Retirement"
                    placeholder="5000"
                    required={true}
                    icon={CurrencyDollarIcon}
                    step={100}
                  />
                )}
              />
            </div>
            <div className="flex mt-4 items-center">
              <label
                htmlFor="advanced"
                className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content mr-1"
              >
                Show Advanced
              </label>
              <Switch id="advanced" name="advanced" onChange={setAdvanced} />
            </div>
            <Transition show={advanced} appear={true} unmount={false}>
              <div className=" transition duration-300 ease-in data-[closed]:opacity-0 data-[closed]:height-0">
                <Divider />
                <div className="flex gap-4 flex-col">
                  <Controller
                    name="lifeExpectancy"
                    control={control}
                    render={({ field }) => (
                      <CustomNumberInput
                        {...field}
                        label="Life Expectancy"
                        placeholder="0"
                      />
                    )}
                  />
                  <Controller
                    name="otherIncome"
                    control={control}
                    render={({ field }) => (
                      <CustomNumberInput
                        {...field}
                        label="Other Retirement Income"
                        placeholder="0"
                        icon={CurrencyDollarIcon}
                        step={100}
                      />
                    )}
                  />
                  <Controller
                    name="preRetirementRateOfReturn"
                    control={control}
                    render={({ field }) => (
                      <CustomNumberInput
                        {...field}
                        label="Pre Retirement Rate of Return"
                        placeholder="8"
                        icon={PercentBadgeIcon}
                        step={0.05}
                      />
                    )}
                  />
                  <Controller
                    name="postRetirementRateOfReturn"
                    control={control}
                    render={({ field }) => (
                      <CustomNumberInput
                        {...field}
                        label="Post Retirement Rate of Return"
                        placeholder="5"
                        icon={PercentBadgeIcon}
                        step={0.05}
                      />
                    )}
                  />
                  <Controller
                    name="inflationRate"
                    control={control}
                    render={({ field }) => (
                      <CustomNumberInput
                        {...field}
                        label="Inflation Rate"
                        placeholder="3"
                        icon={PercentBadgeIcon}
                        step={0.05}
                      />
                    )}
                  />
                </div>
              </div>
            </Transition>
          </form>
        </Card>
        <OtherToolsCard />
      </div>
      <Card className="flex-grow-1">
        <div className="flex">
          <div>
            <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              You will retire at age {lastSubmitted.retirementAge} with...
            </h3>
            <p className="text-tremor-metric text-tremor-content dark:text-dark-tremor-content-strong font-semibold">
              {Number.isSafeInteger(retirementYearIndex) &&
              retirementYearIndex < data.length - 1 &&
              data[retirementYearIndex]["Your Balance"]
                ? formatNumberToUSD(data[retirementYearIndex]["Your Balance"])
                : "Error"}
            </p>
          </div>
          <div className="ml-auto flex flex-col items-end">
            {!getFirstNegativeBalance(data) ? (
              <>
                <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                  {`At age ${lastSubmitted.lifeExpectancy}, you will have...`}
                </h3>
                <p className="text-tremor-metric text-tremor-content dark:text-dark-tremor-content-strong font-semibold">
                  {formatNumberToUSD(data[data.length - 1]["Your Balance"])}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                  Retirement savings deplete in...
                </h3>
                <p className="text-tremor-metric text-tremor-content dark:text-dark-tremor-content-strong font-semibold">
                  {getFirstNegativeBalance(data)?.year}
                </p>
              </>
            )}
          </div>
        </div>

        <AreaChart
          showAnimation={true}
          curveType="linear"
          className="mt-4 h-72"
          data={data}
          index="year"
          yAxisWidth={getLargestBalance(data).toString().length * 5.5}
          categories={["Your Balance", "Optimal Balance"]}
          colors={["indigo", "pink"]}
          valueFormatter={formatNumberToUSD}
          rotateLabelX={{ angle: -45, verticalShift: 15, xAxisHeight: 40 }}
          animationDuration={320}
        />
      </Card>
    </div>
  );
};

export default RetirementCalculator;
