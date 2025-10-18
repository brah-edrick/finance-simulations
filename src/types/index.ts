// Shared form types for all calculators
export type BaseFormValues<T> = {
  currentAge: T;
  currentSavings: T;
  monthlyContributions: T;
  interestRate: T;
};

export type RetirementFormValues<T> = {
  currentAge: T;
  currentSavings: T;
  monthlyContributions: T;
  retirementAge: T;
  monthlyBudgetInRetirement?: T;
  lifeExpectancy: T;
  otherIncome: T;
  preRetirementRateOfReturn: T;
  postRetirementRateOfReturn: T;
  inflationRate: T;
};

export type CompoundInterestFormValues<T> = {
  currentAmount: T;
  monthlyContributions: T;
  years: T;
  interestRate: T;
};

export type FIREFormValues<T> = RetirementFormValues<T>;

export type RoadToMillionaireFormValues<T> = {
  currentAmount: T;
  monthlyContributions: T;
  interestRate: T;
};

// Chart data types
export type RetirementChartData = {
  years: number;
  year: number;
  Principal?: number;
  "Your Balance": number | null;
  "Optimal Balance": number | null;
};

export type CompoundInterestChartData = {
  month: number;
  Balance: number;
  Principal: number;
  Interest?: number;
};

export type FIREChartData = {
  year: number;
  "3%": number | null;
  "4%": number | null;
  "2%": number | null;
};

// Re-export constants from the centralized constants file
export {
  MILESTONE_AMOUNTS,
  WITHDRAW_RATES,
  WITHDRAW_RATE_COLORS,
  CHART_COLORS,
  MAX_CALCULATION_ITERATIONS,
  MILLIONAIRE_TARGET,
} from "../constants";
