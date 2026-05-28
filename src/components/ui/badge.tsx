"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "destructive" | "warning" | "gold" | "glass" | "hot" | "warm" | "cold";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-300 border";

  const variants = {
    default: "bg-primary border-primary text-primary-foreground",
    secondary: "bg-secondary border-border text-secondary-foreground",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]",
    destructive: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.1)]",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.1)]",
    gold: "bg-gold/10 border-gold/30 text-gold shadow-[0_0_10px_rgba(197,168,128,0.15)]",
    glass: "glass-panel border-white/10 text-foreground",
    // Specialized Lead Scoring Badges
    hot: "bg-red-500/15 border-red-500/30 text-red-500 dark:text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)] font-bold animate-pulse-slow",
    warm: "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold",
    cold: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
  };

  return <span className={cn(baseStyles, variants[variant], className)} {...props} />;
}
