import React from "react";
import { NumberInput, NumberInputProps } from "@tremor/react";

type CustomNumberInputProps = {
  label: string;
  placeholder: string;
  required?: boolean;
  enableStepper?: boolean;
  icon?: React.JSXElementConstructor<React.SVGProps<SVGSVGElement>>;
  step?: number;
} & NumberInputProps;

/**
 * A custom number input component that wraps Tremor's NumberInput with consistent styling.
 *
 * This component is wrapped with React.forwardRef to properly handle refs from
 * react-hook-form's Controller component.
 *
 * @param props - The component props
 * @returns A styled number input component
 */
export const CustomNumberInput = React.forwardRef<
  HTMLInputElement,
  CustomNumberInputProps
>(
  (
    {
      name,
      label,
      placeholder,
      required = false,
      enableStepper = true,
      icon,
      step = 1,
      ...rest
    },
    ref
  ) => {
    return (
      <div>
        <label
          htmlFor={name}
          className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content"
        >
          {label}
        </label>
        <NumberInput
          {...rest}
          ref={ref}
          id={name}
          icon={icon}
          name={name}
          autoComplete={name}
          placeholder={placeholder}
          className="mt-2"
          required={required}
          enableStepper={enableStepper}
          step={step}
        />
      </div>
    );
  }
);

// Set display name for better debugging
CustomNumberInput.displayName = "CustomNumberInput";
