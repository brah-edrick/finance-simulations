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
import {
  Card,
  AreaChart,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import { CustomNumberInput } from "../Components/CustomNumberInput";
import { OtherToolsCard } from "../Components/OtherToolsCard";
import { useCalculatorForm } from "../hooks/useCalculatorForm";
import {
  RoadToMillionaireFormValues,
  CompoundInterestChartData,
  MILESTONE_AMOUNTS,
  CHART_COLORS,
  MAX_CALCULATION_ITERATIONS,
  MILLIONAIRE_TARGET,
} from "../types";
import { DEFAULT_ROAD_TO_MILLIONAIRE_VALUES } from "../constants";
import { castStringsToNumbers } from "../Utils/dataTransformation";
import { validateAmount, validatePercentage } from "../Utils/validation";

type FormValuesAsNumbers = RoadToMillionaireFormValues<number>;
type FormValuesAsStrings = RoadToMillionaireFormValues<string>;

const defaultValues: FormValuesAsStrings = DEFAULT_ROAD_TO_MILLIONAIRE_VALUES;

/**
 * Converts a number of months into a human-readable string format.
 *
 * @param months - Number of months to convert
 * @returns Formatted string like "2 years and 3 months" or "1 year" or "5 months"
 *
 * @example
 * convertMonthsToYearsAndMonths(27) // Returns "2 years and 3 months"
 * convertMonthsToYearsAndMonths(12) // Returns "1 year"
 * convertMonthsToYearsAndMonths(5)  // Returns "5 months"
 */
const convertMonthsToYearsAndMonths = (months: number): string => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return `${years > 1 ? `${years} years` : years === 1 ? `1 year` : ""} ${
    years > 0 && remainingMonths > 0 ? "and " : ""
  }${remainingMonths > 0 ? `${remainingMonths} months` : ""}`;
};

/**
 * Creates chart data for the "Road to Millionaire" calculator.
 *
 * This function calculates month-by-month data until the investment reaches
 * the millionaire target ($1,000,000). It shows the growth of balance, principal,
 * and interest over time, stopping when the target is reached or after a maximum
 * number of iterations to prevent infinite loops.
 *
 * The calculation uses monthly compounding and includes both the initial investment
 * and regular monthly contributions.
 *
 * @param params - Investment parameters
 * @returns Array of monthly chart data points until millionaire target is reached
 */
const createFullDataSet = ({
  currentAmount,
  monthlyContributions,
  interestRate,
}: FormValuesAsNumbers): CompoundInterestChartData[] => {
  // Initialize with month 0 (starting point)
  const initialData: CompoundInterestChartData[] = [
    {
      month: 0,
      Balance: currentAmount,
      Principal: currentAmount,
      Interest: 0,
    },
  ];

  let i = 1; // Start from month 1
  let data = [...initialData];

  // Continue calculating until we reach the millionaire target
  while (data[data.length - 1].Balance < MILLIONAIRE_TARGET) {
    // Safety check to prevent infinite loops
    if (i > MAX_CALCULATION_ITERATIONS) {
      break;
    }

    // Calculate total balance including compound interest
    const Balance = calculateFutureValueInterestWithContributions({
      presentValue: currentAmount,
      periods: i, // Number of months
      contributionAmount: monthlyContributions,
      rateOfReturn: interestRate / 100 / 12, // Convert annual rate to monthly rate
    });

    // Calculate total principal (contributions only)
    const Principal = calculatePrincipalTotal({
      presentValue: currentAmount,
      periods: i,
      contributionAmount: monthlyContributions,
    });

    // Add this month's data point
    data.push({
      month: i,
      Balance, // Total value
      Principal, // Total contributions
      Interest: Balance - Principal, // Interest earned
    });

    i++;
  }

  return data;
};

export const RoadToMillionaireCalculator: React.FC = () => {
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
    const interestRateValidation = validatePercentage(
      valuesAsNumbers.interestRate,
      "Interest Rate"
    );

    if (
      !currentAmountValidation.isValid ||
      !monthlyContributionsValidation.isValid ||
      !interestRateValidation.isValid
    ) {
      console.error("Validation errors:", [
        ...currentAmountValidation.errors,
        ...monthlyContributionsValidation.errors,
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
            Road to Millionaire Calculator
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
                    placeholder="0"
                    required={true}
                    icon={CurrencyDollarIcon}
                    step={100}
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
                name="interestRate"
                control={control}
                render={({ field }) => (
                  <CustomNumberInput
                    {...field}
                    label="Interest Rate"
                    placeholder="10"
                    required={true}
                    icon={PercentBadgeIcon}
                    step={0.1}
                  />
                )}
              />
            </div>
          </form>
        </Card>
        <OtherToolsCard />
      </div>
      <div className="flex flex-grow-1 w-full flex-col gap-8">
        <Card>
          <div className="flex">
            <div>
              <h3 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                You could become a millionaire in...
              </h3>
              <p className="text-tremor-metric text-tremor-content dark:text-dark-tremor-content-strong font-semibold">
                {convertMonthsToYearsAndMonths(data[data.length - 1].month)}
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
            categories={["Balance", "Principal", "Interest"]}
            colors={CHART_COLORS}
            valueFormatter={formatNumberToUSD}
            rotateLabelX={{ angle: -45, verticalShift: 15, xAxisHeight: 40 }}
            animationDuration={320}
            xAxisLabel="Months"
          />
        </Card>
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Milestone</TableHeaderCell>
                <TableHeaderCell>Time</TableHeaderCell>
                <TableHeaderCell>
                  <span className="inline-flex items-center">
                    <span
                      className={`flex w-2 h-2 me-2 bg-${CHART_COLORS[0]}-500 rounded-full`}
                    ></span>
                  </span>
                  Balance
                </TableHeaderCell>
                <TableHeaderCell>
                  <span className="inline-flex items-center">
                    <span
                      className={`flex w-2 h-2 me-2 bg-${CHART_COLORS[1]}-500 rounded-full`}
                    ></span>
                  </span>
                  Principal
                </TableHeaderCell>
                <TableHeaderCell>
                  <span className="inline-flex items-center">
                    <span
                      className={`flex w-2 h-2 me-2 bg-${CHART_COLORS[2]}-500 rounded-full`}
                    ></span>
                  </span>
                  Interest
                </TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {MILESTONE_AMOUNTS.map((ms, i) => {
                const previousMilestone = MILESTONE_AMOUNTS[i - 1] || 0;
                const milestone = data.find((entry) => entry.Balance >= ms);
                const previousMilestoneEntry = data.find(
                  (entry) => entry.Balance >= previousMilestone
                );
                if (!milestone || lastSubmitted.currentAmount >= ms) {
                  return null;
                }
                return (
                  <TableRow key={i}>
                    <TableCell>{formatNumberToUSD(ms)}</TableCell>
                    <TableCell>
                      {convertMonthsToYearsAndMonths(
                        milestone.month - (previousMilestoneEntry?.month || 0)
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          milestone.Balance > MILLIONAIRE_TARGET
                            ? "text-yellow-600 dark:text-yellow-400"
                            : ""
                        }
                      >
                        {formatNumberToUSD(milestone.Balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatNumberToUSD(milestone.Principal)}
                    </TableCell>
                    <TableCell>
                      {formatNumberToUSD(milestone.Interest || 0)}
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
