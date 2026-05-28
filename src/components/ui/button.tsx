"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold" | "glass";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary", size = "md", isLoading, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
      ghost: "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
      gold: "bg-gradient-to-r from-gold to-amber-600 text-white hover:from-gold/90 hover:to-amber-600/90 shadow-lg shadow-gold/20 font-semibold border border-gold/30",
      glass: "glass-panel text-foreground hover:bg-white/10 dark:hover:bg-white/5 shadow-inner border border-white/10"
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-5 text-base",
      lg: "h-13 px-8 text-lg rounded-xl",
      icon: "h-11 w-11 p-0"
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.015, y: -1 }}
        whileTap={{ scale: 0.985 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
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
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
