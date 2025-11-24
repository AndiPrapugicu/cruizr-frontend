import React from 'react';
import { Input, InputProps } from '../atoms/Input';

export interface FormFieldProps extends InputProps {
  label: string;
  name: string;
  required?: boolean;
  helperText?: string;
}

/**
 * Component FormField - Input cu label și helper text
 * Wrapper pentru consistență în formulare
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  required = false,
  error,
  helperText,
  ...inputProps
}) => {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <Input
        id={name}
        name={name}
        error={error}
        {...inputProps}
      />
      
      {!error && helperText && (
        <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
