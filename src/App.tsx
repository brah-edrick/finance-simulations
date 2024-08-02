import "./App.css";
import { AreaChart, Card, Divider, NumberInput, Switch } from "@tremor/react";
import {
  RemixiconComponentType,
  RiMoneyDollarBoxLine,
  RiPercentLine,
} from "@remixicon/react";
import React from "react";
import { Transition } from "@headlessui/react";

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
      <p className="text-tremor-metric text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">
        $34,567
      </p>
      <AreaChart
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

interface CustomNumberInputProps {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  enableStepper?: boolean;
  icon?: RemixiconComponentType;
  step?: number;
}

const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
  name,
  label,
  placeholder,
  required = false,
  enableStepper = true,
  icon,
  step = 1,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
      >
        {label}
      </label>
      <NumberInput
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
  return (
    <div className="w-full flex gap-8 content-start items-start">
      <Card className="w-256">
        <form>
          <div className="flex gap-4 flex-col">
            <CustomNumberInput
              name="current-age"
              label="Current Age"
              placeholder="30"
              required={true}
            />
            <CustomNumberInput
              name="retirement-age"
              label="Retirement Age"
              placeholder="67"
            />
            <CustomNumberInput
              name="annual-pre-tax-income"
              label="Annual Pre Tax income"
              placeholder="54000"
              required={true}
              icon={RiMoneyDollarBoxLine}
              step={1000}
            />
            <CustomNumberInput
              name="current-savings"
              label="Current Savings"
              placeholder="35000"
              required={true}
              icon={RiMoneyDollarBoxLine}
              step={1000}
            />
            <CustomNumberInput
              name="monthly-contributions"
              label="Monthly Contributions"
              placeholder="1000"
              required={true}
              icon={RiMoneyDollarBoxLine}
              step={100}
            />
            <CustomNumberInput
              name="monthly-budget-in-retirement"
              label="Monthly Budget in Retirement"
              placeholder="5000"
              required={true}
              icon={RiMoneyDollarBoxLine}
              step={100}
            />
          </div>
          <div className="flex my-4 items-center">
            <label
              htmlFor="advanced"
              className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong mr-1"
            >
              Show Advanced
            </label>
            <Switch id="advanced" name="advanced" onChange={setAdvanced} />
          </div>
          <Transition show={advanced} appear={true}>
            <div className=" transition duration-300 ease-in data-[closed]:opacity-0 data-[closed]:height-0">
              <Divider />
              <div className="flex gap-4 flex-col">
                <CustomNumberInput
                  name="life-expectancy"
                  label="Life Expectancy"
                  placeholder="0"
                />
                <CustomNumberInput
                  name="other-income"
                  label="Other Retirement Income"
                  placeholder="0"
                  icon={RiMoneyDollarBoxLine}
                  step={100}
                />
                <CustomNumberInput
                  name="pre-retirement--rate-of-return"
                  label="Pre Retirement Rate of Return"
                  placeholder="8"
                  icon={RiPercentLine}
                  step={0.05}
                />
                <CustomNumberInput
                  name="post-retirement--rate-of-return"
                  label="Post Retirement Rate of Return"
                  placeholder="5"
                  icon={RiPercentLine}
                  step={0.05}
                />
              </div>
            </div>
          </Transition>
        </form>
      </Card>
      <Card className="flex-gow">
        <AreaChartUsageExample />
      </Card>
    </div>
  );
}

export default App;
