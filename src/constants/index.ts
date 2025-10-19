/**
 * Centralized constants for the retirement calculator application.
 * 
 * This file contains all magic numbers, default values, and shared constants
 * to ensure consistency across all calculators and simulations.
 */

// ============================================================================
// CHART DISPLAY CONSTANTS
// ============================================================================

/**
 * Pixel width multiplier for Y-axis labels in charts.
 * 
 * This value estimates the pixel width per character for formatted currency values
 * in Tremor charts. Used to dynamically size the Y-axis based on the largest
 * number in the dataset.
 * 
 * @example
 * // For a number like "1,234,567.89" (13 characters)
 * // Y-axis width = 13 * 5.5 = 71.5 pixels
 */
export const CHART_CHARACTER_WIDTH_PX = 5.5;

/**
 * Maximum number of calculation iterations to prevent infinite loops.
 * Used in scenarios like "Road to Millionaire" where we calculate until
 * reaching a target amount.
 */
export const MAX_CALCULATION_ITERATIONS = 1000;

// ============================================================================
// FINANCIAL TARGETS
// ============================================================================

/**
 * The millionaire target amount used in the "Road to Millionaire" calculator.
 */
export const MILLIONAIRE_TARGET = 1000000;

/**
 * Milestone amounts for progress tracking and visualization.
 */
export const MILESTONE_AMOUNTS = [
  100000, 200000, 300000, 400000, 500000, 
  600000, 700000, 800000, 900000, 1000000,
] as const;

// ============================================================================
// WITHDRAWAL RATES
// ============================================================================

/**
 * Standard withdrawal rates for FIRE calculations.
 * These represent the percentage of retirement savings that can be safely
 * withdrawn annually during retirement.
 */
export const WITHDRAW_RATES = ["4%", "3%", "2%"];

/**
 * Colors corresponding to each withdrawal rate for chart visualization.
 */
export const WITHDRAW_RATE_COLORS = ["pink", "indigo", "lime"];

// ============================================================================
// COMMON DEFAULT VALUES
// ============================================================================

/**
 * Default current age for all calculators.
 */
export const DEFAULT_CURRENT_AGE = 30;

/**
 * Default monthly contributions amount.
 */
export const DEFAULT_MONTHLY_CONTRIBUTIONS = 1250;

/**
 * Default life expectancy age.
 */
export const DEFAULT_LIFE_EXPECTANCY = 90;

/**
 * Default other income amount (pensions, social security, etc.).
 */
export const DEFAULT_OTHER_INCOME = 0;

/**
 * Default retirement age.
 */
export const DEFAULT_RETIREMENT_AGE = 67;

/**
 * Default current savings amount.
 */
export const DEFAULT_CURRENT_SAVINGS = 35000;

/**
 * Default monthly budget in retirement.
 */
export const DEFAULT_MONTHLY_BUDGET_IN_RETIREMENT = 4000;

// ============================================================================
// DEFAULT INTEREST RATES (CRITICAL - MUST BE CONSISTENT)
// ============================================================================

/**
 * Default pre-retirement rate of return (annual percentage).
 * This is the expected return on investments during the accumulation phase.
 * 
 * IMPORTANT: This value must be consistent across all calculators that use
 * pre-retirement rate of return calculations.
 */
export const DEFAULT_PRE_RETIREMENT_RATE_OF_RETURN = 7;

/**
 * Default post-retirement rate of return (annual percentage).
 * This is the expected return on investments during the retirement phase.
 * Typically lower than pre-retirement due to more conservative allocation.
 * 
 * IMPORTANT: This value must be consistent across all calculators that use
 * post-retirement rate of return calculations.
 */
export const DEFAULT_POST_RETIREMENT_RATE_OF_RETURN = 5;

/**
 * Default inflation rate (annual percentage).
 * Used to calculate real (inflation-adjusted) returns.
 * 
 * IMPORTANT: This value must be consistent across all calculators that use
 * inflation-adjusted calculations.
 */
export const DEFAULT_INFLATION_RATE = 3;

/**
 * Default interest rate for compound interest calculations (annual percentage).
 * Used in the compound interest calculator and road to millionaire calculator.
 * 
 * IMPORTANT: This value must be consistent across all calculators that use
 * general interest rate calculations.
 */
export const DEFAULT_INTEREST_RATE = 7;

// ============================================================================
// DEFAULT FORM VALUES
// ============================================================================

/**
 * Default values for retirement calculator form.
 */
export const DEFAULT_RETIREMENT_VALUES = {
  currentAge: DEFAULT_CURRENT_AGE.toString(),
  retirementAge: DEFAULT_RETIREMENT_AGE.toString(),
  currentSavings: DEFAULT_CURRENT_SAVINGS.toString(),
  monthlyContributions: DEFAULT_MONTHLY_CONTRIBUTIONS.toString(),
  monthlyBudgetInRetirement: DEFAULT_MONTHLY_BUDGET_IN_RETIREMENT.toString(),
  lifeExpectancy: DEFAULT_LIFE_EXPECTANCY.toString(),
  otherIncome: DEFAULT_OTHER_INCOME.toString(),
  preRetirementRateOfReturn: DEFAULT_PRE_RETIREMENT_RATE_OF_RETURN.toString(),
  postRetirementRateOfReturn: DEFAULT_POST_RETIREMENT_RATE_OF_RETURN.toString(),
  inflationRate: DEFAULT_INFLATION_RATE.toString(),
} as const;

/**
 * Default values for compound interest calculator form.
 */
export const DEFAULT_COMPOUND_INTEREST_VALUES = {
  currentAmount: DEFAULT_CURRENT_SAVINGS.toString(),
  monthlyContributions: "100",
  years: "15",
  interestRate: DEFAULT_INTEREST_RATE.toString(),
} as const;

/**
 * Default values for FIRE calculator form.
 */
export const DEFAULT_FIRE_VALUES = {
  currentAge: DEFAULT_CURRENT_AGE.toString(),
  retirementAge: "47",
  currentSavings: "100000",
  monthlyContributions: "2500",
  lifeExpectancy: DEFAULT_LIFE_EXPECTANCY.toString(),
  otherIncome: DEFAULT_OTHER_INCOME.toString(),
  preRetirementRateOfReturn: DEFAULT_PRE_RETIREMENT_RATE_OF_RETURN.toString(),
  postRetirementRateOfReturn: DEFAULT_POST_RETIREMENT_RATE_OF_RETURN.toString(),
  inflationRate: DEFAULT_INFLATION_RATE.toString(),
} as const;

/**
 * Default values for road to millionaire calculator form.
 */
export const DEFAULT_ROAD_TO_MILLIONAIRE_VALUES = {
  currentAmount: "0",
  monthlyContributions: "833.33", // $10,000 annually
  interestRate: DEFAULT_INTEREST_RATE.toString(),
} as const;

// ============================================================================
// CHART COLORS
// ============================================================================

/**
 * Standard color palette for charts across all calculators.
 */
export const CHART_COLORS = ["indigo", "pink", "lime"];

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Maximum age allowed in validation (years).
 */
export const MAX_AGE = 120;

/**
 * Maximum monetary amount allowed in validation (dollars).
 */
export const MAX_MONETARY_AMOUNT = 1000000000; // 1 billion dollars

/**
 * Maximum percentage allowed in validation.
 */
export const MAX_PERCENTAGE = 100;
