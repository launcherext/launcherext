import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
}

const Input: React.FC<InputProps> = ({ label, error, success, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className={clsx(
          'w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
          'bg-background-surface border border-zinc-800 text-white',
          'placeholder:text-zinc-600',
          'focus:outline-none focus:ring-1 focus:ring-accent-green/50 focus:border-accent-green/50 focus:bg-background-tertiary focus:shadow-glow',
          'hover:border-zinc-700',
          error && 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500',
          success && 'border-accent-green/50 focus:ring-accent-green/30 focus:border-accent-green',
          className
        )}
      />
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;
