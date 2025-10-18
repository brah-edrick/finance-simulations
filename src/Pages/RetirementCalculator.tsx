import { Transition } from "@headlessui/react";
import {
  CurrencyDollarIcon,
  PercentBadgeIcon,
} from "@heroicons/react/24/outline";
import { Card, Switch, Divider, AreaChart } from "@tremor/react";
import React from "react";
import { Controller } from "react-hook-form";
import { CustomNumberInput } from "../Components/CustomNumberInput";
import {
  calculateRequiredPresentValue,
  calculateRequiredContributions,
  calculateFutureValueInterestWithContributions,
  formatNumberToUSD,
  getLargestBalance,
} from "../Utils";
import { OtherToolsCard } from "../Components/OtherToolsCard";
import { useCalculatorForm } from "../hooks/useCalculatorForm";
import {
  RetirementFormValues,
  RetirementChartData,
  CHART_COLORS,
} from "../types";
import { DEFAULT_RETIREMENT_VALUES } from "../constants";
import { castStringsToNumbers } from "../Utils/dataTransformation";
import {
  validateRetirementScenario,
  validateAmount,
  validatePercentage,
} from "../Utils/validation";

// we have to go between strings and numbers because the form values are strings and the calculations are done in numbers
type FormValuesAsNumbers = RetirementFormValues<number> & {
  monthlyBudgetInRetirement: number;
};
type FormValuesAsStrings = RetirementFormValues<string> & {
  monthlyBudgetInRetirement: string;
};

/**
 * Creates chart data for the accumulation phase (from current age to retirement age).
 *
 * This function calculates the growth of retirement savings during working years,
 * showing both the user's actual contributions and the optimal contributions needed
 * to meet their retirement goals. It accounts for inflation-adjusted returns.
 *
 * The calculation involves:
 * 1. Determining the "perfect" retirement amount needed to fund retirement
 * 2. Calculating the required annual contributions to reach that amount
 * 3. Projecting both optimal and actual balance growth year by year
 *
 * @param params - Retirement scenario parameters
 * @returns Array of chart data points for the accumulation phase
 */
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
}: FormValuesAsNumbers): RetirementChartData[] => {
  // Calculate the "perfect" retirement amount needed to fund retirement expenses
  // This is the amount needed at retirement to support the desired lifestyle
  const perfectRetirementAmount = calculateRequiredPresentValue({
    period: lifeExpectancy - retirementAge + 1, // Years in retirement
    rateOfReturn: (postRetirementRateOfReturn - inflationRate) / 100, // Real return rate
    annualContributionAmount: -(monthlyBudgetInRetirement * 12) + otherIncome, // Net annual withdrawal
    targetBalance: 0, // End with $0 (or desired legacy amount)
  });

  // Calculate the required annual contributions to reach the perfect retirement amount
  const requiredContributions = calculateRequiredContributions({
    presentValue: currentSavings,
    rateOfReturn: (preRetirementRateOfReturn - inflationRate) / 100, // Real return rate
    period: retirementAge - currentAge - 1, // Years until retirement
    targetBalance: perfectRetirementAmount,
  });

  // Generate year-by-year data for the accumulation phase
  return new Array(retirementAge - currentAge).fill(0).map((_, i) => {
    return {
      years: i,
      year: new Date().getFullYear() + i,
      // Optimal balance: what the balance would be with required contributions
      "Optimal Balance": calculateFutureValueInterestWithContributions({
        presentValue: currentSavings,
        periods: i,
        contributionAmount: requiredContributions,
        rateOfReturn: (preRetirementRateOfReturn - inflationRate) / 100,
      }),
      // Your balance: what the balance will be with your actual contributions
      "Your Balance": calculateFutureValueInterestWithContributions({
        presentValue: currentSavings,
        periods: i,
        contributionAmount: monthlyContributions * 12, // Convert monthly to annual
        rateOfReturn: (preRetirementRateOfReturn - inflationRate) / 100,
      }),
    };
  });
};

/**
 * Creates chart data for the retirement phase (to life expectancy).
 *
 * This function calculates the depletion of retirement savings during retirement years,
 * showing how the balance decreases as money is withdrawn to fund living expenses.
 * It compares the user's actual retirement balance against the optimal balance needed.
 *
 * The calculation involves:
 * 1. Determining the optimal retirement amount (same as accumulation phase)
 * 2. Projecting year-by-year balance depletion with withdrawals
 * 3. Handling cases where savings run out (negative balances become null)
 *
 * @param params - Retirement scenario parameters
 * @returns Array of chart data points for the retirement phase
 */
const createDataFromRetirementToDeath = ({
  retirementAge,
  lifeExpectancy,
  monthlyBudgetInRetirement,
  postRetirementRateOfReturn,
  otherIncome,
  currentSavings,
  currentAge,
  inflationRate,
}: FormValuesAsNumbers): RetirementChartData[] => {
  // Calculate the optimal retirement amount (same calculation as accumulation phase)
  const perfectRetirementAmount = calculateRequiredPresentValue({
    period: lifeExpectancy - retirementAge + 1, // Years in retirement
    rateOfReturn: (postRetirementRateOfReturn - inflationRate) / 100, // Real return rate
    annualContributionAmount: -(monthlyBudgetInRetirement * 12) + otherIncome, // Net annual withdrawal
    targetBalance: 0, // End with $0
  });

  // Generate year-by-year data for the retirement phase
  return new Array(lifeExpectancy - retirementAge + 1).fill(0).map((_, i) => {
    // Calculate user's actual balance during retirement (withdrawals are negative contributions)
    const Balance = calculateFutureValueInterestWithContributions({
      presentValue: currentSavings, // Starting balance at retirement
      periods: i + 1, // Years into retirement
      contributionAmount: -(monthlyBudgetInRetirement * 12) + otherIncome, // Net annual withdrawal
      rateOfReturn: (postRetirementRateOfReturn - inflationRate) / 100,
    });

    // Calculate optimal balance during retirement
    const Optimal = calculateFutureValueInterestWithContributions({
      presentValue: perfectRetirementAmount, // Optimal starting balance
      periods: i + 1, // Years into retirement
      contributionAmount: -(monthlyBudgetInRetirement * 12) + otherIncome, // Net annual withdrawal
      rateOfReturn: (postRetirementRateOfReturn - inflationRate) / 100,
    });

    return {
      years: i + retirementAge - currentAge, // Total years from start
      year: new Date().getFullYear() + i + retirementAge - currentAge, // Calendar year
      // Set to null if balance goes negative (savings exhausted)
      "Your Balance": Balance < 0 ? null : Balance,
      "Optimal Balance": Optimal,
    };
  });
};

/**
 * Combines accumulation and retirement data into a complete retirement timeline.
 *
 * This function creates a seamless dataset that spans from current age to life expectancy,
 * connecting the accumulation phase (savings growth) with the retirement phase
 * (savings depletion). The retirement balance from the accumulation phase becomes
 * the starting balance for the retirement phase.
 *
 * @param data - Retirement scenario parameters
 * @returns Complete chart data spanning the entire retirement timeline
 */
const createFullDataSet = (
  data: FormValuesAsNumbers
): RetirementChartData[] => {
  // Generate accumulation phase data (current age to retirement)
  const preRetirement = createDataFromNowToRetirement(data);

  // Generate retirement phase data (retirement to death)
  // Use the final balance from accumulation as the starting balance for retirement
  const postRetirement = createDataFromRetirementToDeath({
    ...data,
    currentSavings:
      preRetirement[preRetirement.length - 1]["Your Balance"] || 0,
    monthlyContributions: 0, // No more contributions during retirement
  });

  // Combine both phases into a single timeline
  return [...preRetirement, ...postRetirement];
};

/**
 * Finds the first data point where savings are exhausted (balance becomes null).
 *
 * This is used to determine when retirement savings run out and display
 * the year when this occurs to the user.
 *
 * @param data - Array of chart data points
 * @returns The first data point with null balance, or undefined if savings never run out
 */
const getFirstNegativeBalance = (
  data: RetirementChartData[]
): RetirementChartData | undefined => {
  return data.find((d) => d["Your Balance"] === null);
};

const defaultValues: FormValuesAsStrings = DEFAULT_RETIREMENT_VALUES;

export const RetirementCalculator = () => {
  const [advanced, setAdvanced] = React.useState(false);
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
    const retirementValidation = validateRetirementScenario({
      currentAge: valuesAsNumbers.currentAge,
      retirementAge: valuesAsNumbers.retirementAge,
      lifeExpectancy: valuesAsNumbers.lifeExpectancy,
    });

    const currentSavingsValidation = validateAmount(
      valuesAsNumbers.currentSavings,
      "Current Savings"
    );
    const monthlyContributionsValidation = validateAmount(
      valuesAsNumbers.monthlyContributions,
      "Monthly Contributions"
    );
    const monthlyBudgetValidation = validateAmount(
      valuesAsNumbers.monthlyBudgetInRetirement,
      "Monthly Budget in Retirement"
    );
    const otherIncomeValidation = validateAmount(
      valuesAsNumbers.otherIncome,
      "Other Income"
    );
    const preRetirementRateValidation = validatePercentage(
      valuesAsNumbers.preRetirementRateOfReturn,
      "Pre Retirement Rate of Return"
    );
    const postRetirementRateValidation = validatePercentage(
      valuesAsNumbers.postRetirementRateOfReturn,
      "Post Retirement Rate of Return"
    );
    const inflationRateValidation = validatePercentage(
      valuesAsNumbers.inflationRate,
      "Inflation Rate"
    );

    if (
      !retirementValidation.isValid ||
      !currentSavingsValidation.isValid ||
      !monthlyContributionsValidation.isValid ||
      !monthlyBudgetValidation.isValid ||
      !otherIncomeValidation.isValid ||
      !preRetirementRateValidation.isValid ||
      !postRetirementRateValidation.isValid ||
      !inflationRateValidation.isValid
    ) {
      console.error("Validation errors:", [
        ...retirementValidation.errors,
        ...currentSavingsValidation.errors,
        ...monthlyContributionsValidation.errors,
        ...monthlyBudgetValidation.errors,
        ...otherIncomeValidation.errors,
        ...preRetirementRateValidation.errors,
        ...postRetirementRateValidation.errors,
        ...inflationRateValidation.errors,
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
    getLargestBalance(data, (d) => d["Your Balance"] || 0).toString().length *
    5.5;

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
                  {`At age ${lastSubmitted.lifeExpectancy}, you may have...`}
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
          yAxisWidth={yAxisWidth}
          categories={["Your Balance", "Optimal Balance"]}
          colors={CHART_COLORS.slice(0, 2)}
          valueFormatter={formatNumberToUSD}
          rotateLabelX={{ angle: -45, verticalShift: 15, xAxisHeight: 40 }}
          animationDuration={320}
        />
      </Card>
    </div>
  );
};

export default RetirementCalculator;
