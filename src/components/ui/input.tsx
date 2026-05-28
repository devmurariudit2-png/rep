"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "glass-input w-full h-11 px-4 text-foreground rounded-lg transition-all duration-300 placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-1 focus:ring-gold/60 focus:border-gold/60 disabled:opacity-50",
            error ? "border-red-500/50 focus:ring-red-500/50" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </label>
        )}
        <textarea
          rows={rows}
          className={cn(
            "glass-input w-full p-4 text-foreground rounded-lg transition-all duration-300 placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-1 focus:ring-gold/60 focus:border-gold/60 disabled:opacity-50 resize-none",
            error ? "border-red-500/50 focus:ring-red-500/50" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
