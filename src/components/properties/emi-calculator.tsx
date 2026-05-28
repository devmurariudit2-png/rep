"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/utils";

interface EmiCalculatorProps {
  propertyPrice: number;
}

export function EmiCalculator({ propertyPrice }: EmiCalculatorProps) {
  const [price, setPrice] = useState(propertyPrice);
  const [downPayment, setDownPayment] = useState(Math.round(propertyPrice * 0.2)); // 20% default
  const [interestRate, setInterestRate] = useState(8.55); // average Indian home loan interest rate
  const [tenureYears, setTenureYears] = useState(20);
  const loanAmount = Math.max(0, price - downPayment);

  // Direct render calculations to comply with React 19 rules of pure rendering
  const monthlyRate = interestRate / 12 / 100;
  const numberOfMonths = tenureYears * 12;

  let monthlyEmi = 0;
  let totalInterest = 0;

  if (loanAmount > 0 && monthlyRate > 0) {
    const emi =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
      (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    monthlyEmi = Math.round(emi);
    const totalPaid = emi * numberOfMonths;
    totalInterest = Math.max(0, Math.round(totalPaid - loanAmount));
  }

  const interestPercentage = totalInterest + loanAmount > 0 
    ? (totalInterest / (totalInterest + loanAmount)) * 100 
    : 0;
  const principalPercentage = 100 - interestPercentage;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border/40 flex flex-col gap-6">
      <h3 className="text-lg font-bold tracking-tight text-luxury-gradient">
        Luxury Home Loan EMI Calculator
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="flex flex-col gap-5">
          {/* Property Price */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground uppercase tracking-wide">Property Value</span>
              <span className="text-foreground">{formatINR(price)}</span>
            </div>
            <input
              type="range"
              min={Math.round(propertyPrice * 0.6)}
              max={Math.round(propertyPrice * 1.5)}
              step={500000}
              value={price}
              onChange={(e) => {
                const newVal = Number(e.target.value);
                setPrice(newVal);
                // Keep down payment reasonable (capped at value)
                if (downPayment > newVal) setDownPayment(newVal);
              }}
              className="w-full accent-gold bg-muted h-1 rounded-lg cursor-pointer"
            />
          </div>

          {/* Down Payment */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground uppercase tracking-wide">Down Payment ({((downPayment / price) * 100).toFixed(0)}%)</span>
              <span className="text-foreground">{formatINR(downPayment)}</span>
            </div>
            <input
              type="range"
              min={Math.round(price * 0.1)}
              max={Math.round(price * 0.8)}
              step={100000}
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full accent-gold bg-muted h-1 rounded-lg cursor-pointer"
            />
          </div>

          {/* Interest Rate */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground uppercase tracking-wide">Interest Rate</span>
              <span className="text-foreground">{interestRate}% p.a.</span>
            </div>
            <input
              type="range"
              min={6.5}
              max={15.0}
              step={0.05}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-gold bg-muted h-1 rounded-lg cursor-pointer"
            />
          </div>

          {/* Loan Tenure */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground uppercase tracking-wide">Loan Tenure</span>
              <span className="text-foreground">{tenureYears} Years</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-gold bg-muted h-1 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Results Panel */}
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-around bg-black/10 dark:bg-white/5 p-5 rounded-xl border border-white/5">
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Monthly EMI Installment
              </span>
              <h4 className="text-2xl font-black text-luxury-gold mt-1">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(monthlyEmi)}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border/10 pt-4">
              <div>
                <span className="text-[9px] uppercase font-semibold text-muted-foreground">Principal Loan</span>
                <p className="text-xs font-bold text-foreground mt-0.5">{formatINR(loanAmount)}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase font-semibold text-muted-foreground">Total Interest</span>
                <p className="text-xs font-bold text-foreground mt-0.5">{formatINR(totalInterest)}</p>
              </div>
            </div>
          </div>

          {/* Mini Ring Diagram */}
          <div className="relative h-28 w-28 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" className="text-emerald-500/20" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#10b981" // principal (green)
                strokeWidth="3.2"
                strokeDasharray={`${principalPercentage} ${interestPercentage}`}
                strokeDashoffset="100"
              />
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#c5a880" // interest (gold)
                strokeWidth="3.2"
                strokeDasharray={`${interestPercentage} ${principalPercentage}`}
                strokeDashoffset={`${100 - principalPercentage}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[8px] text-muted-foreground uppercase font-semibold">Interest</span>
              <span className="text-xs font-black text-gold">{interestPercentage.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
