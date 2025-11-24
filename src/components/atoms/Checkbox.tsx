import { InputHTMLAttributes, forwardRef } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

/**
 * Component Checkbox personalizat
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              className="peer sr-only"
              {...props}
            />
            <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:border-pink-500 peer-checked:bg-pink-500 transition-all duration-200 group-hover:border-pink-400">
              <svg
                className="w-full h-full text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          {label && (
            <span className="text-sm text-gray-700 select-none">{label}</span>
          )}
        </label>
        {error && (
          <p className="text-xs text-red-500 ml-7">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
