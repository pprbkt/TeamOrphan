import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BrutalCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "white" | "yellow" | "pink" | "cyan" | "green" | "purple" | "muted";
  shadowSize?: "none" | "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
}

export const BrutalCard = React.forwardRef<HTMLDivElement, BrutalCardProps>(
  (
    {
      className,
      variant = "white",
      shadowSize = "md",
      interactive = false,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      white: "bg-white text-black",
      yellow: "bg-brutal-yellow text-black",
      pink: "bg-brutal-pink text-white",
      cyan: "bg-brutal-cyan text-black",
      green: "bg-brutal-green text-black",
      purple: "bg-brutal-purple text-white",
      muted: "bg-brutal-muted text-black",
    };

    const shadowStyles = {
      none: "",
      sm: "shadow-brutal-sm",
      md: "shadow-brutal",
      lg: "shadow-brutal-lg",
      xl: "shadow-brutal-xl",
    };

    const interactiveStyles = interactive
      ? "hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-xl transition-transform duration-150 cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          "border-3 border-black p-5 relative",
          variantStyles[variant],
          shadowStyles[shadowSize],
          interactiveStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BrutalCard.displayName = "BrutalCard";
