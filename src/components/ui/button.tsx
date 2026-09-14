import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-content-inverse hover:bg-primary-hover shadow-sm",
        secondary: "bg-surface text-primary border border-primary hover:bg-surface-subtle",
        outline: "border border-primary bg-transparent text-primary hover:bg-primary hover:text-content-inverse",
        ghost: "text-content-primary hover:text-primary",
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-sm",
        md: "h-12 px-8 text-sm uppercase tracking-wider rounded-none",
        lg: "h-14 px-12 text-base font-bold uppercase tracking-widest rounded-none",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <span className="mr-2 animate-spin">⏳</span> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
