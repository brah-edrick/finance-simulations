import React from "react";
import { Controller } from "react-hook-form";
import {
  calculateFutureValueInterestWithContributions,
  calculatePrincipalTotal,
  formatNumberToUSD,
  getLargestBalance,
} from "../Utils";
import {
  CurrencyDollarIcon,
  PercentBadgeIcon,
} from "@heroicons/react/24/outline";
import { Card, AreaChart } from "@tremor/react";
import { CustomNumberInput } from "../Components/CustomNumberInput";
import { OtherToolsCard } from "../Components/OtherToolsCard";
import { useCalculatorForm } from "../hooks/useCalculatorForm";
import {
  CompoundInterestFormValues,
  CompoundInterestChartData,
  CHART_COLORS,
} from "../types";
import { DEFAULT_COMPOUND_INTEREST_VALUES } from "../constants";
import { castStringsToNumbers } from "../Utils/dataTransformation";
import { validateAmount, validatePercentage } from "../Utils/validation";

type FormValuesAsNumbers = CompoundInterestFormValues<number>;
type FormValuesAsStrings = CompoundInterestFormValues<string>;

const defaultValues: FormValuesAsStrings = DEFAULT_COMPOUND_INTEREST_VALUES;

/**
 * Creates chart data for compound interest calculations with monthly granularity.
 *
 * This function generates month-by-month data showing the growth of an investment
 * with regular monthly contributions. It calculates both the total balance (including
 * interest) and the principal amount (contributions only) for each month.
 *
 * The calculation uses monthly compounding, converting the annual interest rate
 * to a monthly rate by dividing by 12.
 *
 * @param params - Investment parameters
 * @returns Array of monthly chart data points
 */
const createFullDataSet = ({
  currentAmount,
  monthlyContributions,
  years,
  interestRate,
}: FormValuesAsNumbers): CompoundInterestChartData[] => {
  // Calculate total number of months (including month 0)
  const months = years * 12 + 1;

  // Generate month-by-month data
  return new Array(months).fill(0).map((_, i) => {
    // Calculate total balance including compound interest
    const Balance = calculateFutureValueInterestWithContributions({
      presentValue: currentAmount,
      periods: i, // Number of months
      contributionAmount: monthlyContributions,
      rateOfReturn: interestRate / 100 / 12, // Convert annual rate to monthly rate
    });

    return {
      month: i,
      Balance, // Total value (principal + interest)
      Principal: calculatePrincipalTotal({
        presentValue: currentAmount,
        periods: i,
        contributionAmount: monthlyContributions,
      }), // Total contributions made
    };
  });
};

export const CompoundInterestCalculator: React.FC = () => {
  const [data, setData] = React.useState(
    createFullDataSet(
      castStringsToNumbers(defaultValues) as FormValuesAsNumbers
    )
  );
  const [lastSubmitted, setLastSubmitted] = React.useState<FormValuesAsNumbers>(
    castStringsToNumbers(defaultValues) as FormValuesAsNumbers
  );

  const onSubmit = (formData: FormValuesAsStrings) => {
    const valuesAsNumbers = castStringsToNumbers(
      formData
    ) as FormValuesAsNumbers;

    // Validate inputs
    const currentAmountValidation = validateAmount(
      valuesAsNumbers.currentAmount,
      "Current Amount"
    );
    const monthlyContributionsValidation = validateAmount(
      valuesAsNumbers.monthlyContributions,
      "Monthly Contributions"
    );
    const yearsValidation = validateAmount(valuesAsNumbers.years, "Years");
    const interestRateValidation = validatePercentage(
      valuesAsNumbers.interestRate,
      "Interest Rate"
    );

    if (
      !currentAmountValidation.isValid ||
      !monthlyContributionsValidation.isValid ||
      !yearsValidation.isValid ||
      !interestRateValidation.isValid
    ) {
      console.error("Validation errors:", [
        ...currentAmountValidation.errors,
        ...monthlyContributionsValidation.errors,
        ...yearsValidation.errors,
        ...interestRateValidation.errors,
      ]);
      return;
    }

    setData(createFullDataSet(valuesAsNumbers));
    setLastSubmitted(valuesAsNumbers);
  };

  const { control } = useCalculatorForm({
    defaultValues,
    onSubmit,
    debounceMs: 300,
  });

  // Calculate Y-axis width for chart display
  const yAxisWidth =
    getLargestBalance(data, (d) => d.Balance).toString().length * 5.5;

  return (
    <div className="w-full flex gap-8 content-start items-start">
      <div className="w-256 flex gap-8 flex-col">
        <Card className="w-full">
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
        <OtherToolsCard />
      </div>
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
          yAxisWidth={yAxisWidth}
          categories={["Balance", "Principal"]}
          colors={CHART_COLORS.slice(0, 2)}
          valueFormatter={formatNumberToUSD}
          rotateLabelX={{ angle: -45, verticalShift: 15, xAxisHeight: 40 }}
          animationDuration={320}
          xAxisLabel="Months"
        />
      </Card>
    </div>
  );
};
