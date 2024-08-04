import { NumberInput, NumberInputProps } from "@tremor/react";

type CustomNumberInputProps = {
  label: string;
  placeholder: string;
  required?: boolean;
  enableStepper?: boolean;
  icon?: React.JSXElementConstructor<any>;
  step?: number;
} & NumberInputProps &
  React.RefAttributes<HTMLInputElement>;

export const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
  name,
  label,
  placeholder,
  required = false,
  enableStepper = true,
  icon,
  step = 1,
  ...rest
}) => {
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
};
