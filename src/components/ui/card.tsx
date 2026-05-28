"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
  hoverGlow?: boolean;
}

export function Card({ className, animate = true, hoverGlow = true, children, ...props }: CardProps) {
  const commonClasses = cn(
    "glass-card rounded-2xl overflow-hidden border border-border/40 transition-all duration-300",
    hoverGlow ? "hover:shadow-[0_12px_40px_-15px_rgba(197,168,128,0.15)] hover:border-gold/20" : "",
    className
  );

  if (animate) {
    return (
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className={commonClasses}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={commonClasses}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-4 flex flex-col gap-1.5", className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-bold tracking-tight text-foreground", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props}>{children}</p>;
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0 border-t border-border/10 flex items-center justify-between", className)} {...props}>{children}</div>;
}
