import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BrutalBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "yellow" | "pink" | "cyan" | "green" | "black" | "white" | "purple" | "orange" | "urgent";
  size?: "sm" | "md" | "lg";
}

export const BrutalBadge: React.FC<BrutalBadgeProps> = ({
  className,
  variant = "yellow",
  size = "md",
  children,
  ...props
}) => {
  const variantStyles = {
    yellow: "bg-brutal-yellow text-black border-black",
    pink: "bg-brutal-pink text-white border-black",
    cyan: "bg-brutal-cyan text-black border-black",
    green: "bg-brutal-green text-black border-black",
    purple: "bg-brutal-purple text-white border-black",
    orange: "bg-brutal-orange text-black border-black",
    black: "bg-black text-white border-black",
    white: "bg-white text-black border-black",
    urgent: "bg-brutal-pink text-white border-black animate-pulse font-black",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] font-bold tracking-wider",
    md: "px-2.5 py-1 text-xs font-black tracking-wider uppercase",
    lg: "px-3.5 py-1.5 text-sm font-black tracking-wider uppercase",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border-2 font-heading select-none shadow-[2px_2px_0px_0px_#000000]",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
