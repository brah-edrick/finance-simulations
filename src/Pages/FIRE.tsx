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
} from "@tremor/react";
import React from "react";
import { Controller } from "react-hook-form";
import { CustomNumberInput } from "../Components/CustomNumberInput";
import {
  calculateFutureValueInterestWithContributions,
  formatNumberToUSD,
  getLargestBalance,
} from "../Utils";
import { OtherToolsCard } from "../Components/OtherToolsCard";
import { useCalculatorForm } from "../hooks/useCalculatorForm";
import {
  FIREFormValues,
  FIREChartData,
  WITHDRAW_RATES,
  WITHDRAW_RATE_COLORS,
} from "../types";
import { DEFAULT_FIRE_VALUES } from "../constants";
import { castStringsToNumbers } from "../Utils/dataTransformation";
import {
  validateRetirementScenario,
  validateAmount,
  validatePercentage,
} from "../Utils/validation";

type FormValuesAsNumbers = FIREFormValues<number>;
type FormValuesAsStrings = FIREFormValues<string>;

/**
 * Creates chart data for the accumulation phase in FIRE calculations.
 *
 * This function calculates the growth of savings during the working years,
 * showing the balance that would support different withdrawal rates (2%, 3%, 4%)
 * during retirement. All withdrawal rate lines start at the same balance since
 * we're in the accumulation phase.
 *
 * @param params - FIRE scenario parameters
 * @returns Array of chart data points for the accumulation phase
 */
const createDataFromNowToRetirement = ({
  currentAge,
  retirementAge,
  currentSavings,
  preRetirementRateOfReturn,
  inflationRate,
  monthlyContributions,
}: FormValuesAsNumbers): FIREChartData[] => {
  return new Array(retirementAge - currentAge).fill(0).map((_, i) => {
    // Calculate balance growth during accumulation phase
    const balance = calculateFutureValueInterestWithContributions({
      presentValue: currentSavings,
      periods: i, // Years from start
      contributionAmount: monthlyContributions * 12, // Convert monthly to annual
      rateOfReturn: (preRetirementRateOfReturn - inflationRate) / 100, // Real return rate
    });

    return {
      years: i,
      year: new Date().getFullYear() + i,
      // During accumulation, all withdrawal rates show the same balance
      "2%": balance > 0 ? balance : null,
      "3%": balance > 0 ? balance : null,
      "4%": balance > 0 ? balance : null,
    };
  });
};

/**
 * Creates chart data for the retirement phase in FIRE calculations.
 *
 * This function calculates the depletion of retirement savings during retirement years,
 * showing how different withdrawal rates (2%, 3%, 4%) affect the longevity of savings.
 * Each withdrawal rate represents a different annual spending level as a percentage
 * of the initial retirement balance.
 *
 * @param params - FIRE scenario parameters
 * @returns Array of chart data points for the retirement phase
 */
const createDataFromRetirementToDeath = ({
  retirementAge,
  lifeExpectancy,
  postRetirementRateOfReturn,
  otherIncome,
  currentAge,
  inflationRate,
  currentSavings,
}: FormValuesAsNumbers): FIREChartData[] => {
  return new Array(lifeExpectancy - retirementAge + 1).fill(0).map((_, i) => {
    // Calculate balance with 4% withdrawal rate (traditional "safe" withdrawal rate)
    const Four = calculateFutureValueInterestWithContributions({
      presentValue: currentSavings,
      periods: i + 1, // Years into retirement
      contributionAmount: -(currentSavings * 0.04) + otherIncome, // 4% annual withdrawal + other income
      rateOfReturn: (postRetirementRateOfReturn - inflationRate) / 100,
    });

    // Calculate balance with 3% withdrawal rate (more conservative)
    const Three = calculateFutureValueInterestWithContributions({
      presentValue: currentSavings,
      periods: i + 1,
      contributionAmount: -(currentSavings * 0.03) + otherIncome, // 3% annual withdrawal + other income
      rateOfReturn: (postRetirementRateOfReturn - inflationRate) / 100,
    });

    // Calculate balance with 2% withdrawal rate (very conservative)
    const Two = calculateFutureValueInterestWithContributions({
      presentValue: currentSavings,
      periods: i + 1,
      contributionAmount: -(currentSavings * 0.02) + otherIncome, // 2% annual withdrawal + other income
      rateOfReturn: (postRetirementRateOfReturn - inflationRate) / 100,
    });

    return {
      years: i + retirementAge - currentAge, // Total years from start
      year: new Date().getFullYear() + i + retirementAge - currentAge, // Calendar year
      // Set to null if balance goes negative (savings exhausted)
      "2%": Two > 0 ? Two : null,
      "3%": Three > 0 ? Three : null,
      "4%": Four > 0 ? Four : null,
    };
  });
};

/**
 * Combines accumulation and retirement data into a complete FIRE timeline.
 *
 * This function creates a seamless dataset that spans from current age to life expectancy,
 * connecting the accumulation phase (savings growth) with the retirement phase
 * (savings depletion with different withdrawal rates). The retirement balance from
 * the accumulation phase becomes the starting balance for the retirement phase.
 *
 * @param data - FIRE scenario parameters
 * @returns Complete chart data spanning the entire FIRE timeline
 */
const createFullDataSet = (data: FormValuesAsNumbers): FIREChartData[] => {
  // Generate accumulation phase data (current age to retirement)
  const preRetirement: FIREChartData[] = createDataFromNowToRetirement(data);

  // Generate retirement phase data (retirement to death)
  // Use the final balance from accumulation as the starting balance for retirement
  const postRetirement: FIREChartData[] = createDataFromRetirementToDeath({
    ...data,
    currentSavings: preRetirement[preRetirement.length - 1]["2%"] || 0,
  });

  // Combine both phases into a single timeline
  return [...preRetirement, ...postRetirement];
};

const defaultValues: FormValuesAsStrings = DEFAULT_FIRE_VALUES;

export const FIRECalculator = () => {
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
      !otherIncomeValidation.isValid ||
      !preRetirementRateValidation.isValid ||
      !postRetirementRateValidation.isValid ||
      !inflationRateValidation.isValid
    ) {
      console.error("Validation errors:", [
        ...retirementValidation.errors,
        ...currentSavingsValidation.errors,
        ...monthlyContributionsValidation.errors,
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
    getLargestBalance(data, (d) => d["2%"] || 0).toString().length * 5.5;

  const retirementYearIndex =
    lastSubmitted.retirementAge - lastSubmitted.currentAge - 1;
  const allWithdrawRates: Array<keyof FIREChartData> = WITHDRAW_RATES as Array<
    keyof FIREChartData
  >;
  const withdrawRateColors = WITHDRAW_RATE_COLORS;
  const viableWithdrawRates = allWithdrawRates.filter(
    (rate) => data[data.length - 1][rate]! > 0
  );

  return (
    <div className="w-full flex gap-8 content-start items-start">
      <div className="w-256 flex gap-8 flex-col">
        <Card className="w-full">
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
            yAxisWidth={yAxisWidth}
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
                      {data &&
                      data[data.length - 1] &&
                      data[data.length - 1][rate] ? (
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
