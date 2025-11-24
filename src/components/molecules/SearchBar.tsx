import React, { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from '../atoms/Input';

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  className?: string;
  showClearButton?: boolean;
}

/**
 * Component SearchBar cu debounce
 * Fully responsive cu icon-uri și clear functionality
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  className = '',
  showClearButton = true,
}) => {
  const [value, setValue] = useState('');
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      onSearch(newValue);
    }, debounceMs);

    setDebounceTimeout(timeout);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
        rightIcon={
          showClearButton && value ? (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          ) : null
        }
        variant="filled"
        className="pr-10"
      />
    </div>
  );
};
