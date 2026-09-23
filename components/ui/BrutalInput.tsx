"use client";

import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BrutalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const BrutalInput = React.forwardRef<HTMLInputElement, BrutalInputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-heading text-xs font-black uppercase tracking-wider text-black"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full border-3 border-black bg-white px-3.5 py-2.5 text-sm font-medium text-black placeholder:text-neutral-500 shadow-brutal outline-none transition-all focus:bg-yellow-50 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none disabled:bg-neutral-200 disabled:cursor-not-allowed",
            error && "border-red-600 bg-red-50",
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="text-xs font-semibold text-neutral-600">{helperText}</p>
        )}
        {error && <p className="text-xs font-black text-red-600 uppercase">{error}</p>}
      </div>
    );
  }
);

BrutalInput.displayName = "BrutalInput";

export interface BrutalTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const BrutalTextarea = React.forwardRef<HTMLTextAreaElement, BrutalTextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-heading text-xs font-black uppercase tracking-wider text-black"
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "w-full border-3 border-black bg-white px-3.5 py-2.5 text-sm font-medium text-black placeholder:text-neutral-500 shadow-brutal outline-none transition-all focus:bg-yellow-50 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none min-h-[100px] disabled:bg-neutral-200 disabled:cursor-not-allowed",
            error && "border-red-600 bg-red-50",
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="text-xs font-semibold text-neutral-600">{helperText}</p>
        )}
        {error && <p className="text-xs font-black text-red-600 uppercase">{error}</p>}
      </div>
    );
  }
);

BrutalTextarea.displayName = "BrutalTextarea";

export interface BrutalSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const BrutalSelect = React.forwardRef<HTMLSelectElement, BrutalSelectProps>(
  ({ className, label, error, helperText, id, children, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-heading text-xs font-black uppercase tracking-wider text-black"
          >
            {label}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={cn(
            "w-full border-3 border-black bg-white px-3.5 py-2.5 text-sm font-bold text-black shadow-brutal outline-none transition-all focus:bg-yellow-50 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none cursor-pointer disabled:bg-neutral-200 disabled:cursor-not-allowed",
            error && "border-red-600 bg-red-50",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {helperText && !error && (
          <p className="text-xs font-semibold text-neutral-600">{helperText}</p>
        )}
        {error && <p className="text-xs font-black text-red-600 uppercase">{error}</p>}
      </div>
    );
  }
);

BrutalSelect.displayName = "BrutalSelect";
