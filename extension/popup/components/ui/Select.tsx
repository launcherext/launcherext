import React from 'react';
import clsx from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, error, options, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <select
        {...props}
        className={clsx(
          'w-full px-4 py-3 rounded-md',
          'bg-background-secondary border text-text-primary',
          'focus:outline-none focus:ring-2 transition-all',
          'cursor-pointer',
          error && 'border-error focus:ring-error',
          !error && 'border-border focus:border-accent-green focus:ring-accent-green',
          className
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default Select;
