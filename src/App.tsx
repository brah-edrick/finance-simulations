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

const chartdata = [
  {
    date: "Jan 22",
    SolarPanels: 2890,
    Inverters: 2338,
  },
  {
    date: "Feb 22",
    SolarPanels: 2756,
    Inverters: 2103,
  },
  {
    date: "Mar 22",
    SolarPanels: 3322,
    Inverters: 2194,
  },
  {
    date: "Apr 22",
    SolarPanels: 3470,
    Inverters: 2108,
  },
  {
    date: "May 22",
    SolarPanels: 3475,
    Inverters: 1812,
  },
  {
    date: "Jun 22",
    SolarPanels: 3129,
    Inverters: 1726,
  },
  {
    date: "Jul 22",
    SolarPanels: 3490,
    Inverters: 1982,
  },
  {
    date: "Aug 22",
    SolarPanels: 2903,
    Inverters: 2012,
  },
  {
    date: "Sep 22",
    SolarPanels: 2643,
    Inverters: 2342,
  },
  {
    date: "Oct 22",
    SolarPanels: 2837,
    Inverters: 2473,
  },
  {
    date: "Nov 22",
    SolarPanels: 2954,
    Inverters: 3848,
  },
  {
    date: "Dec 22",
    SolarPanels: 3239,
    Inverters: 3736,
  },
];

const valueFormatter = function (number: number) {
  return "$ " + new Intl.NumberFormat("us").format(number).toString();
};

export function AreaChartUsageExample() {
  return (
    <>
      <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        Newsletter Revenue
      </h3>
      <p className="text-tremor-metric text-tremor-content dark:text-dark-tremor-content-strong font-semibold">
        $34,567
      </p>
      <AreaChart
        curveType="natural"
        className="mt-4 h-72"
        data={chartdata}
        index="date"
        yAxisWidth={65}
        categories={["SolarPanels", "Inverters"]}
        colors={["indigo", "cyan"]}
        valueFormatter={valueFormatter}
      />
    </>
  );
}

type CustomNumberInputProps = {
  label: string;
  placeholder: string;
  required?: boolean;
  enableStepper?: boolean;
  icon?: React.JSXElementConstructor<any>;
  step?: number;
} & NumberInputProps &
  React.RefAttributes<HTMLInputElement>;

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

function App() {
  const [advanced, setAdvanced] = React.useState(false);
  const { control, handleSubmit } = useForm({
    defaultValues: {
      currentAge: "30",
      retirementAge: "67",
      annualPreTaxIncome: "54000",
      currentSavings: "35000",
      monthlyContributions: "1000",
      monthlyBudgetInRetirement: "5000",
      lifeExpectancy: "95",
      otherIncome: "0",
      preRetirementRateOfReturn: "8",
      postRetirementRateOfReturn: "5",
    },
  });

  const onSubmit: SubmitHandler<any> = (data) => {
    console.log(data);
  };

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
              name="annualPreTaxIncome"
              control={control}
              render={({ field }) => (
                <CustomNumberInput
                  {...field}
                  label="Annual Pre Tax income"
                  placeholder="54000"
                  required={true}
                  icon={CurrencyDollarIcon}
                  step={1000}
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
          <div className="flex my-4 items-center">
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
          <Button type="submit" className="mt-4">
            Submit
          </Button>
        </form>
      </Card>
      <Card className="flex-gow">
        <AreaChartUsageExample />
      </Card>
    </div>
  );
}

export default App;
