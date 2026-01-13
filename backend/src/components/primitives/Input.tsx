"use client";

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * Input - Text input field
 * 
 * Obsidian Minimal design:
 * - Dark background (gray-950)
 * - Subtle border
 * - Cyan focus ring/glow
 * - Clean typography
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      icon,
      iconPosition = 'left',
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;
    const hasIcon = !!icon;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Icon - Left */}
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={clsx(
              // Base
              "w-full bg-gray-950 border rounded-lg text-foreground text-sm",
              "placeholder:text-gray-600",
              "transition-all duration-150",
              // Padding - increased for mobile touch targets (min 44px height)
              hasIcon && iconPosition === 'left' && "pl-10 pr-4 py-3.5 min-h-[44px]",
              hasIcon && iconPosition === 'right' && "pl-4 pr-10 py-3.5 min-h-[44px]",
              !hasIcon && "px-4 py-3.5 min-h-[44px]",
              // Border
              error ? "border-error" : "border-border",
              // Hover
              !disabled && !error && "hover:border-gray-700",
              // Focus
              "focus:outline-none",
              error 
                ? "focus:border-error focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                : "focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,212,255,0.15)]",
              // Disabled
              disabled && "opacity-50 cursor-not-allowed bg-gray-900",
              className
            )}
            {...props}
          />

          {/* Icon - Right */}
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {icon}
            </div>
          )}
        </div>

        {/* Hint or Error */}
        {(hint || error) && (
          <p
            className={clsx(
              "mt-2 text-xs",
              error ? "text-error" : "text-gray-500"
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea - Multi-line text input
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || `textarea-${generatedId}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={clsx(
            // Base
            "w-full bg-gray-950 border rounded-lg text-foreground text-sm",
            "placeholder:text-gray-600 resize-none",
            "px-4 py-3.5 min-h-[44px]",
            "transition-all duration-150",
            // Border
            error ? "border-error" : "border-border",
            // Hover
            !disabled && !error && "hover:border-gray-700",
            // Focus
            "focus:outline-none",
            error
              ? "focus:border-error focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
              : "focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,212,255,0.15)]",
            // Disabled
            disabled && "opacity-50 cursor-not-allowed bg-gray-900",
            className
          )}
          {...props}
        />

        {(hint || error) && (
          <p
            className={clsx(
              "mt-2 text-xs",
              error ? "text-error" : "text-gray-500"
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
