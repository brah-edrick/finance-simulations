import { useForm, UseFormReturn, DefaultValues } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";

export interface UseCalculatorFormOptions<T extends Record<string, string>> {
  defaultValues: DefaultValues<T>;
  onSubmit: (data: T) => void;
  debounceMs?: number;
}

export function useCalculatorForm<T extends Record<string, string>>({
  defaultValues,
  onSubmit,
  debounceMs = 300,
}: UseCalculatorFormOptions<T>): UseFormReturn<T> {
  const form = useForm<T>({ defaultValues });
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSubmit = useCallback(
    (data: T) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      const timer = setTimeout(() => {
        try {
          onSubmit(data);
        } catch (error) {
          console.error("Form submission error:", error);
        }
      }, debounceMs);
      
      setDebounceTimer(timer);
    },
    [onSubmit, debounceMs, debounceTimer]
  );

  useEffect(() => {
    const subscription = form.watch((value) => {
      debouncedSubmit(value as T);
    });
    
    return () => {
      subscription.unsubscribe();
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [form, debouncedSubmit, debounceTimer]);

  return form;
}
