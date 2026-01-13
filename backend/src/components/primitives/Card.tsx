"use client";

import { forwardRef, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'elevated' | 'outline';
  interactive?: boolean;

  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

const variantStyles = {
  default: "bg-gray-900 border-border",
  elevated: "bg-gray-900 border-gray-800 shadow-lg",
  outline: "bg-transparent border-border",
};

const paddingStyles = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5 md:p-6",
  lg: "p-5 sm:p-6 md:p-8",
};

/**
 * Card - Container component
 * 
 * Obsidian Minimal design:
 * - Subtle border
 * - Dark fill
 * - Optional interactive state
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      interactive = false,
      padding = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const motionProps = interactive
      ? {
          whileHover: { scale: 1.005 },
          whileTap: { scale: 0.995 },
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={clsx(
          "rounded-xl border transition-colors duration-150",
          variantStyles[variant],
          paddingStyles[padding],
          interactive && "cursor-pointer hover:border-gray-700 hover:bg-gray-800",
          className
        )}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

/**
 * CardHeader - Optional header section
 */
interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={clsx("flex items-start justify-between gap-4 mb-4", className)}>
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/**
 * CardFooter - Optional footer section
 */
interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={clsx(
        "flex items-center gap-3 pt-4 mt-4 border-t border-border",
        className
      )}
    >
      {children}
    </div>
  );
}
