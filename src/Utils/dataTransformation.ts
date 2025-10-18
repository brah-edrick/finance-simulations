/**
 * Converts all string values in a form data object to numbers.
 * 
 * This function is used to transform form input data (which comes as strings)
 * into numeric values for financial calculations. It handles the conversion
 * from string form values to the numeric types expected by calculation functions.
 * 
 * @param data - Record with string values to convert
 * @returns Object with the same keys but numeric values
 * 
 * @example
 * // Convert form data from strings to numbers
 * const formData = { currentAge: "30", savings: "50000", rate: "8" };
 * const numericData = castStringsToNumbers(formData);
 * // Returns: { currentAge: 30, savings: 50000, rate: 8 }
 */
export function castStringsToNumbers<T extends Record<string, string>>(
  data: T
): Record<keyof T, number> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      // Convert string to number, defaulting to 0 for invalid values
      const numValue = parseFloat(value) || 0;
      
      return [key, numValue];
    })
  ) as Record<keyof T, number>;
}