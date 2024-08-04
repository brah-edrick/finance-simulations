import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  calculateFutureValueInterestWithContributions,
  calculatePrincipalTotal,
  formatNumberToUSD,
} from "../Utils";
import {
  CurrencyDollarIcon,
  PercentBadgeIcon,
} from "@heroicons/react/24/outline";
import { Card, AreaChart } from "@tremor/react";
import { CustomNumberInput } from "../Components/CustomNumberInput";

type FormValues<T> = {
  currentAmount: T;
  monthlyContributions: T;
  years: T;
  interestRate: T;
};

type FormValuesAsNumbers = FormValues<number>;
type FormValuesAsStrings = FormValues<string>;

type CompoundInterestChartData = {
  month: number;
  Balance: number;
  Principal: number;
};

const defaultValues: FormValuesAsStrings = {
  currentAmount: "3000",
  monthlyContributions: "100",
  years: "15",
  interestRate: "5",
};

const castStringsToNumbers = (
  defaultFormValues: FormValuesAsStrings
): FormValuesAsNumbers => {
  return Object.fromEntries(
    Object.entries(defaultFormValues).map(([key, value]) => [
      key,
      parseFloat(value),
    ])
  ) as FormValuesAsNumbers;
};

const createFullDataSet = ({
  currentAmount,
  monthlyContributions,
  years,
  interestRate,
}: FormValuesAsNumbers): CompoundInterestChartData[] => {
  const months = years * 12 + 1;
  return new Array(months).fill(0).map((_, i) => {
    const Balance = calculateFutureValueInterestWithContributions({
      presentValue: currentAmount,
      periods: i,
      contributionAmount: monthlyContributions,
      rateOfReturn: interestRate / 100 / 12,
    });
    return {
      month: i,
      Balance,
      Principal: calculatePrincipalTotal({
        presentValue: currentAmount,
        periods: i,
        contributionAmount: monthlyContributions,
      }),
    };
  });
};

export const CompoundInterestCalculator: React.FC = () => {
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

  function getLargestBalance(data: CompoundInterestChartData[]) {
    return Math.max(...data.map((entry) => entry.Balance));
  }

  return (
    <div className="w-full flex gap-8 content-start items-start">
      <Card className="w-256">
        <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong mb-4">
          Compound Interest
        </h3>
        <form>
          <div className="flex gap-4 flex-col">
            <Controller
              name="currentAmount"
              control={control}
              render={({ field }) => (
                <CustomNumberInput
                  {...field}
                  label="Current Amount"
                  placeholder="1000"
                  required={true}
                  icon={CurrencyDollarIcon}
                  step={10}
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
                  placeholder="100"
                  required={true}
                  icon={CurrencyDollarIcon}
                  step={10}
                />
              )}
            />
            <Controller
              name="years"
              control={control}
              render={({ field }) => (
                <CustomNumberInput
                  {...field}
                  label="Years"
                  placeholder="10"
                  required={true}
                  step={1}
                />
              )}
            />
            <Controller
              name="interestRate"
              control={control}
              render={({ field }) => (
                <CustomNumberInput
                  {...field}
                  label="Interest Rate"
                  placeholder="5"
                  required={true}
                  icon={PercentBadgeIcon}
                  step={0.01}
                />
              )}
            />
          </div>
        </form>
      </Card>
      <Card className="flex-grow-1">
        <div className="flex">
          <div>
            <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              Your balance in {lastSubmitted.years} years will be...
            </h3>
            <p className="text-tremor-metric text-tremor-content dark:text-dark-tremor-content-strong font-semibold">
              {formatNumberToUSD(data[data.length - 1]["Balance"])}
            </p>
          </div>
          <div className="ml-auto flex flex-col items-end">
            <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              {lastSubmitted.interestRate}% interest will yield...
            </h3>
            <p className="text-tremor-metric text-tremor-content dark:text-dark-tremor-content-strong font-semibold">
              {formatNumberToUSD(
                data[data.length - 1]["Balance"] -
                  data[data.length - 1]["Principal"]
              )}
            </p>
          </div>
        </div>

        <AreaChart
          showAnimation={true}
          curveType="linear"
          className="mt-4 h-72"
          data={data}
          index="month"
          yAxisWidth={getLargestBalance(data).toString().length * 5.5}
          categories={["Balance", "Principal"]}
          colors={["indigo", "pink"]}
          valueFormatter={formatNumberToUSD}
          rotateLabelX={{ angle: -45, verticalShift: 15, xAxisHeight: 40 }}
          animationDuration={320}
          xAxisLabel="Month"
        />
      </Card>
    </div>
  );
};
