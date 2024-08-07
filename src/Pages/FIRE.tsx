import { Transition } from "@headlessui/react";
import {
  CurrencyDollarIcon,
  PercentBadgeIcon,
  CheckBadgeIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  Switch,
  Divider,
  AreaChart,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Badge,
  BadgeDelta,
} from "@tremor/react";
import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { CustomNumberInput } from "../Components/CustomNumberInput";
import {
  calculateFutureValueInterestWithContributions,
  formatNumberToUSD,
} from "../Utils";

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

type FIRECalculatorChartData = {
  year: number;
  "3%": number | null;
  "4%": number | null;
  "2%": number | null;
};

const castStringsToNumbers = function (
  data: FormValuesAsStrings
): FormValuesAsNumbers {
  return {
    currentAge: parseInt(data.currentAge),
    retirementAge: parseInt(data.retirementAge),
    currentSavings: parseInt(data.currentSavings),
    lifeExpectancy: parseInt(data.lifeExpectancy),
    monthlyContributions: parseInt(data.monthlyContributions),
    monthlyBudgetInRetirement: parseInt(data.monthlyBudgetInRetirement),
    otherIncome: parseInt(data.otherIncome),
    preRetirementRateOfReturn: parseFloat(data.preRetirementRateOfReturn) / 100,
    postRetirementRateOfReturn:
      parseFloat(data.postRetirementRateOfReturn || "0") / 100,
    inflationRate: parseFloat(data.inflationRate || "0") / 100,
  };
};

const createDataFromNowToRetirement = ({
  currentAge,
  retirementAge,
  currentSavings,
  preRetirementRateOfReturn,
  inflationRate,
  monthlyContributions,
}: FormValuesAsNumbers) => {
  return new Array(retirementAge - currentAge).fill(0).map((_, i) => {
    const balance = calculateFutureValueInterestWithContributions({
      presentValue: currentSavings,
      periods: i,
      contributionAmount: monthlyContributions * 12,
      rateOfReturn: preRetirementRateOfReturn - inflationRate,
    });
    return {
      years: i,
      year: new Date().getFullYear() + i,
      "2%": balance > 0 ? balance : null,
      "3%": balance > 0 ? balance : null,
      "4%": balance > 0 ? balance : null,
    };
  });
};

const createDataFromRetirementToDeath = ({
  retirementAge,
  lifeExpectancy,
  postRetirementRateOfReturn,
  otherIncome,
  currentAge,
  inflationRate,
  currentSavings,
}: FormValuesAsNumbers) => {
  return new Array(lifeExpectancy - retirementAge + 1).fill(0).map((_, i) => {
    const Four = calculateFutureValueInterestWithContributions({
      presentValue: currentSavings,
      periods: i + 1,
      contributionAmount: -(currentSavings * 0.04) + otherIncome,
      rateOfReturn: postRetirementRateOfReturn - inflationRate,
    });
    const Three = calculateFutureValueInterestWithContributions({
      presentValue: currentSavings,
      periods: i + 1,
      contributionAmount: -(currentSavings * 0.03) + otherIncome,
      rateOfReturn: postRetirementRateOfReturn - inflationRate,
    });
    const Two = calculateFutureValueInterestWithContributions({
      presentValue: currentSavings,
      periods: i + 1,
      contributionAmount: -(currentSavings * 0.02) + otherIncome,
      rateOfReturn: postRetirementRateOfReturn - inflationRate,
    });
    return {
      years: i + retirementAge - currentAge,
      year: new Date().getFullYear() + i + retirementAge - currentAge,
      "2%": Two > 0 ? Two : null,
      "3%": Three > 0 ? Three : null,
      "4%": Four > 0 ? Four : null,
    };
  });
};

const createFullDataSet = (data: FormValuesAsNumbers) => {
  const preRetirement: FIRECalculatorChartData[] =
    createDataFromNowToRetirement(data);
  const postRetirement: FIRECalculatorChartData[] =
    createDataFromRetirementToDeath({
      ...data,
      currentSavings: preRetirement[preRetirement.length - 1]["2%"] || 0,
    });
  return [...preRetirement, ...postRetirement];
};

const getLargestBalance = (data: FIRECalculatorChartData[]) => {
  return Math.max(...data.map((d) => d["2%"] || 0));
};

const defaultValues: FormValuesAsStrings = {
  currentAge: "30",
  retirementAge: "45",
  currentSavings: "120000",
  monthlyContributions: "3500",
  monthlyBudgetInRetirement: "4000",
  lifeExpectancy: "95",
  otherIncome: "0",
  preRetirementRateOfReturn: "10",
  postRetirementRateOfReturn: "5.25",
  inflationRate: "2",
};

export const FIRECalculator = () => {
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
  const allWithdrawRates: Array<keyof FIRECalculatorChartData> = [
    "4%",
    "3%",
    "2%",
  ];
  const withdrawRateColors = ["pink", "indigo", "lime"];
  const viableWithdrawRates = allWithdrawRates.filter(
    (rate) => data[data.length - 1][rate]! > 0
  );

  return (
    <div className="w-full flex gap-8 content-start items-start">
      <Card className="w-256">
        <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong mb-4">
          FIRE Calculator
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
                  placeholder="500"
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
                  placeholder="4000"
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
      <div className="flex-grow-1 w-full flex flex-col gap-8">
        <Card>
          <div className="flex">
            <div>
              <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                You will retire at age {lastSubmitted.retirementAge} with...
              </h3>
              <p className="text-tremor-metric text-tremor-content dark:text-dark-tremor-content-strong font-semibold">
                {formatNumberToUSD(data[retirementYearIndex]["2%"])}
              </p>
            </div>
            {viableWithdrawRates.length > 0 && (
              <div className="ml-auto flex flex-col items-end">
                <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                  Monthly budget using a {viableWithdrawRates[0]} withdraw rate
                </h3>
                <p className="text-tremor-metric text-tremor-content dark:text-dark-tremor-content-strong font-semibold">
                  {formatNumberToUSD(
                    ((+viableWithdrawRates[0][0] / 100) *
                      data[retirementYearIndex]["2%"]!) /
                      12
                  )}
                </p>
              </div>
            )}
          </div>

          <AreaChart
            showAnimation={true}
            curveType="linear"
            className="mt-4 h-72"
            data={data}
            index="year"
            yAxisWidth={getLargestBalance(data).toString().length * 5.5}
            categories={allWithdrawRates}
            colors={withdrawRateColors}
            valueFormatter={formatNumberToUSD}
            rotateLabelX={{ angle: -45, verticalShift: 15, xAxisHeight: 40 }}
            animationDuration={320}
          />
        </Card>
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Withdraw Rate</TableHeaderCell>
                <TableHeaderCell>
                  Balance at {lastSubmitted.retirementAge}
                </TableHeaderCell>
                <TableHeaderCell>
                  Balance at {lastSubmitted.lifeExpectancy}
                </TableHeaderCell>
                <TableHeaderCell>Monthly Budget</TableHeaderCell>
                <TableHeaderCell>∆ Desired Budget</TableHeaderCell>
                <TableHeaderCell>Viability</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {allWithdrawRates.map((rate, i) => {
                const withdrawRateColor = withdrawRateColors[i];
                const lastBalance = data[data.length - 1][rate]!;
                const retirementBalance = data[retirementYearIndex][rate]!;
                const monthlyBudgetInRetirement =
                  ((+rate[0] / 100) * retirementBalance) / 12;
                const difference =
                  monthlyBudgetInRetirement -
                  lastSubmitted.monthlyBudgetInRetirement;
                return (
                  <TableRow key={rate}>
                    <TableCell className="flex items-center">
                      <span
                        className={`flex w-2 h-2 me-2 bg-${withdrawRateColor}-500 rounded-full`}
                      ></span>
                      {rate}
                    </TableCell>
                    <TableCell>
                      {formatNumberToUSD(retirementBalance)}
                    </TableCell>
                    <TableCell>{formatNumberToUSD(lastBalance)}</TableCell>
                    <TableCell>
                      {formatNumberToUSD(monthlyBudgetInRetirement)}
                    </TableCell>

                    <TableCell>
                      <BadgeDelta
                        deltaType={
                          Math.abs(difference) /
                            lastSubmitted.monthlyBudgetInRetirement <
                          0.05
                            ? "unchanged"
                            : difference >= 0
                            ? "moderateIncrease"
                            : "moderateDecrease"
                        }
                      >
                        {formatNumberToUSD(difference)}
                      </BadgeDelta>
                    </TableCell>

                    <TableCell>
                      {data &&
                      data[data.length - 1] &&
                      data[data.length - 1][rate] &&
                      difference >= 0 ? (
                        <Badge icon={CheckBadgeIcon} color="lime">
                          Viable
                        </Badge>
                      ) : (
                        <Badge icon={XCircleIcon} color="pink">
                          Not Viable
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};
