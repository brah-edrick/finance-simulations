// yes I could use Zod for this, but wanted to tinker with some validation logic patterns

import { MAX_AGE, MAX_MONETARY_AMOUNT, MAX_PERCENTAGE } from "../constants";

/**
 * Result of a validation operation containing validity status and error messages
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Array of error messages if validation failed */
  errors: string[];
}

/**
 * Validates an age value for retirement calculations.
 * 
 * Ensures the age is within reasonable bounds and is a whole number.
 * Used for validating current age, retirement age, and life expectancy inputs.
 * 
 * @param age - The age value to validate
 * @returns Validation result with success status and any error messages
 * 
 * @example
 * const result = validateAge(65);
 * if (!result.isValid) {
 *   console.log(result.errors); // ["Age must be a whole number"]
 * }
 */
export function validateAge(age: number): ValidationResult {
  const errors: string[] = [];
  
  // Check for negative ages
  if (age < 0) {
    errors.push("Age cannot be negative");
  }
  
  // Check for unrealistic upper bound
  if (age > MAX_AGE) {
    errors.push(`Age cannot exceed ${MAX_AGE} years`);
  }
  
  // Ensure age is a whole number
  if (!Number.isInteger(age)) {
    errors.push("Age must be a whole number");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a monetary amount for financial calculations.
 * 
 * Ensures the amount is within reasonable bounds for retirement planning.
 * Used for validating savings, contributions, budgets, and other monetary inputs.
 * 
 * @param amount - The monetary amount to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @returns Validation result with success status and any error messages
 * 
 * @example
 * const result = validateAmount(50000, "Current Savings");
 * if (!result.isValid) {
 *   console.log(result.errors); // ["Current Savings cannot be negative"]
 * }
 */
export function validateAmount(amount: number, fieldName: string): ValidationResult {
  const errors: string[] = [];
  
  // Check for negative amounts
  if (amount < 0) {
    errors.push(`${fieldName} cannot be negative`);
  }
  
  // Check for unrealistic upper bound
  if (amount > MAX_MONETARY_AMOUNT) {
    errors.push(`${fieldName} cannot exceed $${(MAX_MONETARY_AMOUNT / 1000000000).toFixed(0)} billion`);
  }
  
  // Check for invalid numbers (NaN, Infinity, etc.)
  if (!Number.isFinite(amount)) {
    errors.push(`${fieldName} must be a valid number`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a percentage value for financial calculations.
 * 
 * Ensures the percentage is within reasonable bounds (0-100%).
 * Used for validating interest rates, inflation rates, and other percentage inputs.
 * 
 * @param percentage - The percentage value to validate (0-100)
 * @param fieldName - The name of the field being validated (for error messages)
 * @returns Validation result with success status and any error messages
 * 
 * @example
 * const result = validatePercentage(8.5, "Interest Rate");
 * if (!result.isValid) {
 *   console.log(result.errors); // ["Interest Rate cannot exceed 100%"]
 * }
 */
export function validatePercentage(percentage: number, fieldName: string): ValidationResult {
  const errors: string[] = [];
  
  // Check for negative percentages
  if (percentage < 0) {
    errors.push(`${fieldName} cannot be negative`);
  }
  
  // Check for percentages over maximum allowed
  if (percentage > MAX_PERCENTAGE) {
    errors.push(`${fieldName} cannot exceed ${MAX_PERCENTAGE}%`);
  }
  
  // Check for invalid numbers (NaN, Infinity, etc.)
  if (!Number.isFinite(percentage)) {
    errors.push(`${fieldName} must be a valid number`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a complete retirement scenario for logical consistency.
 * 
 * Performs comprehensive validation of age-related inputs to ensure they
 * form a logical retirement timeline. Validates individual ages and their
 * relationships to each other.
 * 
 * @param data - Object containing the three age values to validate
 * @param data.currentAge - Current age of the person
 * @param data.retirementAge - Age at which they plan to retire
 * @param data.lifeExpectancy - Expected age at death
 * @returns Validation result with success status and any error messages
 * 
 * @example
 * const result = validateRetirementScenario({
 *   currentAge: 30,
 *   retirementAge: 65,
 *   lifeExpectancy: 90
 * });
 * if (!result.isValid) {
 *   console.log(result.errors); // ["Retirement age must be greater than current age"]
 * }
 */
export function validateRetirementScenario(data: {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
}): ValidationResult {
  const errors: string[] = [];
  
  // Validate each individual age
  const ageValidation = validateAge(data.currentAge);
  if (!ageValidation.isValid) {
    errors.push(...ageValidation.errors);
  }
  
  const retirementAgeValidation = validateAge(data.retirementAge);
  if (!retirementAgeValidation.isValid) {
    errors.push(...retirementAgeValidation.errors);
  }
  
  const lifeExpectancyValidation = validateAge(data.lifeExpectancy);
  if (!lifeExpectancyValidation.isValid) {
    errors.push(...lifeExpectancyValidation.errors);
  }
  
  // Validate logical relationships between ages
  if (data.retirementAge <= data.currentAge) {
    errors.push("Retirement age must be greater than current age");
  }
  
  if (data.lifeExpectancy <= data.retirementAge) {
    errors.push("Life expectancy must be greater than retirement age");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}