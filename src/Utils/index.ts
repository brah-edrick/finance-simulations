import { CHART_CHARACTER_WIDTH_PX } from "../constants";
/**
 * Parameters for calculating future value with regular contributions
 */
export type InterestWithContributionsParameters = {
  /** Initial amount invested (present value) */
  presentValue: number;
  /** Annual rate of return as a decimal (e.g., 0.08 for 8%) */
  rateOfReturn: number;
  /** Number of periods (years or months) */
  periods: number;
  /** Regular contribution amount per period */
  contributionAmount: number;
};

/**
 * Calculates the future value of an investment with regular contributions and compound interest.
 * 
 * This function implements the future value of an annuity formula:
 * FV = PV(1+r)^n + PMT[((1+r)^n - 1)/r]
 * 
 * Where:
 * - FV = Future Value
 * - PV = Present Value (initial investment)
 * - r = Rate of return per period
 * - n = Number of periods
 * - PMT = Payment/contribution per period
 * 
 * @param params - The calculation parameters
 * @returns The total future value including initial investment and all contributions with interest
 * 
 * @example
 * // Calculate future value of $10,000 initial investment with $500 monthly contributions
 * // at 8% annual return for 20 years
 * const result = calculateFutureValueInterestWithContributions({
 *   presentValue: 10000,
 *   rateOfReturn: 0.08 / 12, // Monthly rate
 *   periods: 20 * 12, // 240 months
 *   contributionAmount: 500
 * });
 */
export const calculateFutureValueInterestWithContributions = ({
  presentValue,
  rateOfReturn,
  periods,
  contributionAmount,
}: InterestWithContributionsParameters): number => {
  // Calculate future value of the initial present value investment
  // Formula: PV * (1 + r)^n
  const futureValueOfPresent = presentValue * Math.pow(1 + rateOfReturn, periods);
  
  // Calculate future value of all regular contributions (annuity)
  // Formula: PMT * [((1 + r)^n - 1) / r]
  const futureValueOfContributions =
    contributionAmount *
    ((Math.pow(1 + rateOfReturn, periods) - 1) / rateOfReturn);
  
  // Total future value = present value growth + contributions growth
  return futureValueOfPresent + futureValueOfContributions;
};

/**
 * Parameters for calculating required present value to reach a target balance
 */
export type RequiredPresentValueParameters = {
  /** Annual rate of return as a decimal (e.g., 0.08 for 8%) */
  rateOfReturn: number;
  /** Number of periods (years or months) */
  period: number;
  /** Annual contribution amount (can be negative for withdrawals) */
  annualContributionAmount: number;
  /** Target balance to achieve at the end of the period */
  targetBalance: number;
};

/**
 * Calculates the required present value (initial investment) needed to reach a target balance
 * given regular contributions and a specific rate of return.
 * 
 * This function works backwards from a target future value to determine how much
 * initial investment is needed, accounting for the future value of contributions.
 * 
 * Formula: PV = (FV - FV_contributions) / (1 + r)^n
 * 
 * Where:
 * - PV = Present Value (what we're solving for)
 * - FV = Target Future Value
 * - FV_contributions = Future value of all contributions
 * - r = Rate of return per period
 * - n = Number of periods
 * 
 * @param params - The calculation parameters
 * @returns The required present value (initial investment amount)
 * 
 * @example
 * // Calculate how much to invest today to have $1M in 30 years
 * // with $10,000 annual contributions at 7% return
 * const requiredPV = calculateRequiredPresentValue({
 *   rateOfReturn: 0.07,
 *   period: 30,
 *   annualContributionAmount: 10000,
 *   targetBalance: 1000000
 * });
 */
export const calculateRequiredPresentValue = ({
  rateOfReturn,
  period,
  annualContributionAmount,
  targetBalance = 0,
}: RequiredPresentValueParameters): number => {
  // Calculate the future value of all contributions
  // Formula: PMT * [((1 + r)^n - 1) / r]
  const futureValueOfContributions =
    annualContributionAmount *
    ((Math.pow(1 + rateOfReturn, period) - 1) / rateOfReturn);
  
  // Calculate required present value by working backwards
  // Formula: (Target - FV_contributions) / (1 + r)^n
  const requiredPresentValue =
    (targetBalance - futureValueOfContributions) /
    Math.pow(1 + rateOfReturn, period);
  
  return requiredPresentValue;
};

/**
 * Parameters for calculating required contributions to reach a target balance
 */
export type RequiredContributionsParameters = {
  /** Initial amount invested (present value) */
  presentValue: number;
  /** Annual rate of return as a decimal (e.g., 0.08 for 8%) */
  rateOfReturn: number;
  /** Number of periods (years or months) */
  period: number;
  /** Target balance to achieve at the end of the period */
  targetBalance: number;
};

/**
 * Calculates the required annual contribution amount needed to reach a target balance
 * given an initial investment and a specific rate of return.
 * 
 * This function determines how much you need to contribute regularly to reach
 * a specific financial goal, accounting for the growth of your initial investment.
 * 
 * Formula: PMT = (FV - FV_present) / [((1 + r)^n - 1) / r]
 * 
 * Where:
 * - PMT = Payment/contribution per period (what we're solving for)
 * - FV = Target Future Value
 * - FV_present = Future value of initial investment
 * - r = Rate of return per period
 * - n = Number of periods
 * 
 * @param params - The calculation parameters
 * @returns The required annual contribution amount
 * 
 * @example
 * // Calculate required annual contributions to reach $1M in 30 years
 * // starting with $50,000 at 7% return
 * const requiredContributions = calculateRequiredContributions({
 *   presentValue: 50000,
 *   rateOfReturn: 0.07,
 *   period: 30,
 *   targetBalance: 1000000
 * });
 */
export const calculateRequiredContributions = ({
  presentValue,
  rateOfReturn,
  period,
  targetBalance,
}: RequiredContributionsParameters): number => {
  // Calculate the future value of the initial present value investment
  // Formula: PV * (1 + r)^n
  const futureValueOfPresent = presentValue * Math.pow(1 + rateOfReturn, period);
  
  // Calculate required contributions by working backwards
  // Formula: (Target - FV_present) / [((1 + r)^n - 1) / r]
  const requiredContributions =
    (targetBalance - futureValueOfPresent) /
    ((Math.pow(1 + rateOfReturn, period) - 1) / rateOfReturn);
  
  return requiredContributions;
};

/**
 * Parameters for calculating total principal invested
 */
export type PrincipalTotalParameters = {
  /** Initial amount invested (present value) */
  presentValue: number;
  /** Number of periods (years or months) */
  periods: number;
  /** Contribution amount per period */
  contributionAmount: number;
};

/**
 * Calculates the total principal amount invested (initial investment + all contributions).
 * 
 * This function calculates the total amount of money you've put into an investment,
 * excluding any interest or returns earned. It's useful for comparing against the
 * total value to see how much growth has occurred.
 * 
 * Formula: Total Principal = Initial Investment + (Contributions × Number of Periods)
 * 
 * @param params - The calculation parameters
 * @returns The total principal amount invested
 * 
 * @example
 * // Calculate total principal for $10,000 initial + $500 monthly for 5 years
 * const totalPrincipal = calculatePrincipalTotal({
 *   presentValue: 10000,
 *   periods: 60, // 5 years × 12 months
 *   contributionAmount: 500
 * });
 * // Returns: 10000 + (500 × 60) = $40,000
 */
export const calculatePrincipalTotal = ({
  presentValue,
  periods: years,
  contributionAmount: annualContributionAmount,
}: PrincipalTotalParameters) => {
  // Total principal = initial investment + all contributions made
  return presentValue + years * annualContributionAmount;
};

/**
 * Formats a number as a USD currency string with proper formatting.
 * 
 * This function handles edge cases like null values, NaN, and ensures
 * consistent currency formatting across the application.
 * 
 * @param number - The number to format (can be null)
 * @returns Formatted currency string or empty string for null/NaN values
 * 
 * @example
 * formatNumberToUSD(1234.56) // Returns "$1,234.56"
 * formatNumberToUSD(null)    // Returns ""
 * formatNumberToUSD(NaN)     // Returns "Error"
 */
export const formatNumberToUSD = function (number: number | null): string {
  // Handle null or undefined values
  if (number === null) {
    return "";
  }

  // Truncate to 2 decimal places to avoid floating point precision issues
  const truncated = Math.trunc(number * 100) / 100;
  
  // Handle NaN or invalid numbers
  if (Number.isNaN(truncated)) {
    return "Error";
  }
  
  // Format as USD currency with proper locale formatting
  return new Intl.NumberFormat("en-US", {
    currency: "USD", 
    style: "currency", 
    minimumFractionDigits: 2
  }).format(Math.abs(truncated));
};

/**
 * Finds the maximum balance value in chart data for Y-axis scaling.
 * 
 * This generic function works with any chart data type by accepting a function
 * that extracts the balance value from each data point. It handles null values
 * by treating them as 0 for comparison purposes.
 * 
 * @param data - Array of chart data points
 * @param getBalance - Function that extracts the balance value from a data point
 * @returns The largest balance value found in the data
 * 
 * @example
 * // For RetirementChartData
 * const maxBalance = getLargestBalance(data, (d) => d["Your Balance"] || 0);
 * 
 * // For CompoundInterestChartData
 * const maxBalance = getLargestBalance(data, (d) => d.Balance);
 * 
 * // For FIREChartData
 * const maxBalance = getLargestBalance(data, (d) => d["2%"] || 0);
 */
export const getLargestBalance = <T>(
  data: T[],
  getBalance: (item: T) => number
): number => {
  return Math.max(...data.map(getBalance));
};

/**
 * Calculates the Y-axis width for charts based on the largest number in the data.
 * 
 * This function combines the getLargestBalance function with the character width
 * constant to provide a consistent way to calculate Y-axis widths across all charts.
 * 
 * @param data - Array of chart data points
 * @param getBalance - Function that extracts the balance value from a data point
 * @returns The calculated Y-axis width in pixels
 * 
 * @example
 * // For any chart data type
 * const yAxisWidth = calculateYAxisWidth(data, (d) => d.Balance);
 */
export const calculateYAxisWidth = <T>(
  data: T[],
  getBalance: (item: T) => number
): number => {
  return getLargestBalance(data, getBalance).toString().length * CHART_CHARACTER_WIDTH_PX;
};