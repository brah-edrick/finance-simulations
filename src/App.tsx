import "./App.css";
import {
  AreaChart,
  Button,
  Card,
  Divider,
  NumberInput,
  NumberInputProps,
  Switch,
} from "@tremor/react";

import React from "react";
import { Transition } from "@headlessui/react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { PercentBadgeIcon } from "@heroicons/react/24/outline";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

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
  };
};

type InterestWithContributionsParameters = {
  presentValue: number;
  rateOfReturn: number;
  years: number;
  annualContributionAmount: number;
};

const calculateFutureValueInterestWithContributions = ({
  presentValue,
  rateOfReturn,
  years,
  annualContributionAmount,
}: InterestWithContributionsParameters): number => {
  const futureValueOfPresent = presentValue * Math.pow(1 + rateOfReturn, years);
  const futureValueOfContributions =
    annualContributionAmount *
    ((Math.pow(1 + rateOfReturn, years) - 1) / rateOfReturn);
  return futureValueOfPresent + futureValueOfContributions;
};

type PrincipalTotalParameters = {
  presentValue: number;
  years: number;
  annualContributionAmount: number;
};

const calculatePrincipalTotal = ({
  presentValue,
  years,
  annualContributionAmount,
}: PrincipalTotalParameters) => {
  return presentValue + years * annualContributionAmount;
};

type SimpleChartData = {
  years: number;
  year: number;
  Principal?: number;
  Balance: number;
};

const createDataFromNowToRetirement = ({
  currentAge,
  retirementAge,
  currentSavings,
  monthlyContributions,
  preRetirementRateOfReturn,
}: FormValuesAsNumbers) => {
  return new Array(retirementAge - currentAge).fill(0).map((_, i) => {
    return {
      years: i,
      year: new Date().getFullYear() + i,
      Principal: calculatePrincipalTotal({
        presentValue: currentSavings,
        years: i,
        annualContributionAmount: monthlyContributions * 12,
      }),
      Balance: calculateFutureValueInterestWithContributions({
        presentValue: currentSavings,
        years: i,
        annualContributionAmount: monthlyContributions * 12,
        rateOfReturn: preRetirementRateOfReturn,
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
}: FormValuesAsNumbers) => {
  return new Array(lifeExpectancy - retirementAge + 1).fill(0).map((_, i) => {
    return {
      years: i + retirementAge - currentAge,
      year: new Date().getFullYear() + i + retirementAge - currentAge,
      Balance: calculateFutureValueInterestWithContributions({
        presentValue: currentSavings,
        years: i + 1,
        annualContributionAmount: -monthlyBudgetInRetirement * 12 + otherIncome,
        rateOfReturn: postRetirementRateOfReturn,
      }),
    };
  });
};

const createFullDataSet = (data: FormValuesAsNumbers) => {
  const preRetirement = createDataFromNowToRetirement(data);
  const postRetirement = createDataFromRetirementToDeath({
    ...data,
    currentSavings: preRetirement[preRetirement.length - 1].Balance,
    monthlyContributions: 0,
  });
  return [...preRetirement, ...postRetirement];
};

const valueFormatter = function (number: number) {
  const truncated = Math.trunc(number * 100) / 100;
  if (Number.isNaN(truncated)) {
    return "Error";
  }
  return (
    "$ " +
    new Intl.NumberFormat("us")
      .format(Math.trunc(number * 100) / 100)
      .toString()
  );
};

type CustomNumberInputProps = {
  label: string;
  placeholder: string;
  required?: boolean;
  enableStepper?: boolean;
  icon?: React.JSXElementConstructor<any>;
  step?: number;
} & NumberInputProps &
  React.RefAttributes<HTMLInputElement>;

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
};

type FormValuesAsNumbers = FormValues<number>;
type FormValuesAsStrings = FormValues<string>;

const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
  name,
  label,
  placeholder,
  required = false,
  enableStepper = true,
  icon,
  step = 1,
  ...rest
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content"
      >
        {label}
      </label>
      <NumberInput
        {...rest}
        id={name}
        icon={icon}
        name={name}
        autoComplete={name}
        placeholder={placeholder}
        className="mt-2"
        required={required}
        enableStepper={enableStepper}
        step={step}
      />
    </div>
  );
};

const defaultValues: FormValuesAsStrings = {
  currentAge: "30",
  retirementAge: "67",
  currentSavings: "35000",
  monthlyContributions: "1000",
  monthlyBudgetInRetirement: "5000",
  lifeExpectancy: "95",
  otherIncome: "0",
  preRetirementRateOfReturn: "8",
  postRetirementRateOfReturn: "5",
};

function App() {
  const [advanced, setAdvanced] = React.useState(false);
  const [data, setData] = React.useState(
    createFullDataSet(castStringsToNumbers(defaultValues))
  );
  const [lastSubmitted, setLastSubmitted] = React.useState<FormValuesAsNumbers>(
    castStringsToNumbers(defaultValues)
  );

  const { control, handleSubmit } = useForm<FormValuesAsStrings>({
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
  const retirementYearIndex =
    lastSubmitted.retirementAge - lastSubmitted.currentAge - 1;
  return (
    <div className="w-full flex gap-8 content-start items-start">
      <Card className="w-256">
        <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong mb-4">
          Retirement Scenario
        </h3>
        <form onSubmit={handleSubmit(onSubmit)}>
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
              </div>
            </div>
          </Transition>
          <div className="mt-8">
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </div>
        </form>
      </Card>
      <Card className="flex-grow-1">
        <div className="flex">
          <div>
            <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              You will retire with...
            </h3>
            <p className="text-tremor-metric text-tremor-content dark:text-dark-tremor-content-strong font-semibold">
              {Number.isSafeInteger(retirementYearIndex) &&
              retirementYearIndex < data.length - 1
                ? valueFormatter(data[retirementYearIndex].Balance)
                : "Error"}
            </p>
          </div>
          <div className="ml-auto flex flex-col items-end">
            <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              {`At age ${lastSubmitted.lifeExpectancy}, you will have...`}
            </h3>
            <p className="text-tremor-metric text-tremor-content dark:text-dark-tremor-content-strong font-semibold">
              {valueFormatter(data[data.length - 1].Balance)}
            </p>
          </div>
        </div>

        <AreaChart
          showAnimation={true}
          curveType="monotone"
          className="mt-4 h-72"
          data={data}
          index="year"
          yAxisWidth={getLargestBalance(data).toString().length * 5.5}
          categories={["Balance", "Principal"]}
          colors={["indigo", "cyan"]}
          valueFormatter={valueFormatter}
        />
      </Card>
    </div>
  );
}

const getLargestBalance = (data: SimpleChartData[]) => {
  return Math.max(...data.map((d) => d.Balance));
};

export default App;
