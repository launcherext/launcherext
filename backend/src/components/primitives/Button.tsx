"use client";

import { forwardRef, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-accent text-black border-accent hover:bg-accent-hover hover:border-accent-hover",
  secondary: "bg-gray-900 text-foreground border-border hover:bg-gray-800 hover:border-gray-700",
  ghost: "bg-transparent text-gray-400 border-transparent hover:bg-gray-900 hover:text-foreground",
  outline: "bg-transparent text-accent border-accent hover:bg-accent/10",
  danger: "bg-error text-white border-error hover:bg-error-dim",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs gap-1.5 min-h-[36px]", // Mobile-friendly minimum
  md: "h-11 px-4 text-sm gap-2 min-h-[44px]", // 44px touch target
  lg: "h-12 px-6 text-base gap-2.5 min-h-[48px]", // Larger touch target
};

/**
 * Button - Primary interactive element
 * 
 * Obsidian Minimal design:
 * - Sharp corners (8px radius)
 * - Solid fills, no gradients
 * - Single accent color for primary
 * - Fast transitions (150ms)
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={!isDisabled ? { scale: 1.01 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        disabled={isDisabled}
        className={clsx(
          // Base styles
          "inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-150",
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // States
          isDisabled && "opacity-50 cursor-not-allowed",
          // Width
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <LoadingSpinner size={size} />
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
            {children && <span>{children}</span>}
            {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

/**
 * IconButton - Square button for icons only
 */
interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'iconPosition' | 'children'> {
  icon: ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', className, ...props }, ref) => {
    const sizeClasses: Record<ButtonSize, string> = {
      sm: "w-9 h-9 min-w-[36px] min-h-[36px]",
      md: "w-11 h-11 min-w-[44px] min-h-[44px]", // 44px touch target
      lg: "w-12 h-12 min-w-[48px] min-h-[48px]",
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={clsx(sizeClasses[size], "px-0", className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

/**
 * Loading Spinner
 */
function LoadingSpinner({ size }: { size: ButtonSize }) {
  const sizeClasses: Record<ButtonSize, string> = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <svg
      className={clsx("animate-spin", sizeClasses[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
