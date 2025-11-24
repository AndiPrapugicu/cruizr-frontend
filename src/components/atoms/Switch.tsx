import React from 'react';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    container: 'w-8 h-5',
    circle: 'w-3 h-3',
    translate: 'translate-x-3',
  },
  md: {
    container: 'w-11 h-6',
    circle: 'w-4 h-4',
    translate: 'translate-x-5',
  },
  lg: {
    container: 'w-14 h-7',
    circle: 'w-5 h-5',
    translate: 'translate-x-7',
  },
};

/**
 * Component Switch (toggle) animat
 */
export const Switch: React.FC<SwitchProps> = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  size = 'md',
}) => {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={handleToggle}
          disabled={disabled}
        />
        <div
          className={`
            ${sizeStyles[size].container}
            bg-gray-300
            peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-red-500
            rounded-full
            transition-all duration-300
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'group-hover:shadow-md'}
          `}
        >
          <div
            className={`
              absolute top-1 left-1
              ${sizeStyles[size].circle}
              bg-white
              rounded-full
              transition-transform duration-300
              shadow-md
              ${checked ? sizeStyles[size].translate : 'translate-x-0'}
            `}
          />
        </div>
      </div>
      {label && (
        <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {label}
        </span>
      )}
    </label>
  );
};
