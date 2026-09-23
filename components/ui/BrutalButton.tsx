"use client";

import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BrutalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "yellow" | "pink" | "cyan" | "green" | "black" | "white" | "purple" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  shadow?: boolean;
}

export const BrutalButton = React.forwardRef<HTMLButtonElement, BrutalButtonProps>(
  (
    {
      className,
      variant = "yellow",
      size = "md",
      shadow = true,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      yellow: "bg-brutal-yellow text-black hover:bg-yellow-300",
      pink: "bg-brutal-pink text-white hover:bg-pink-500",
      cyan: "bg-brutal-cyan text-black hover:bg-cyan-300",
      green: "bg-brutal-green text-black hover:bg-lime-300",
      black: "bg-black text-white hover:bg-zinc-800",
      white: "bg-white text-black hover:bg-neutral-100",
      purple: "bg-brutal-purple text-white hover:bg-purple-600",
      outline: "bg-transparent text-black hover:bg-black/10",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs font-bold uppercase tracking-wider",
      md: "px-5 py-2.5 text-sm font-bold uppercase tracking-wider",
      lg: "px-7 py-3.5 text-base font-black uppercase tracking-wider",
      xl: "px-9 py-4.5 text-lg font-black uppercase tracking-wider",
    };

    const shadowClass = shadow
      ? "shadow-brutal hover:shadow-brutal-hover active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
      : "";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 border-3 border-black font-heading select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:active:translate-x-0 disabled:active:translate-y-0",
          variantStyles[variant],
          sizeStyles[size],
          shadowClass,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

BrutalButton.displayName = "BrutalButton";
