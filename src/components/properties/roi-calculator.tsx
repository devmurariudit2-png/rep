"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/utils";

interface RoiCalculatorProps {
  propertyPrice: number;
  defaultRoi: number;
  defaultRentalYield?: number;
}

export function RoiCalculator({ propertyPrice, defaultRoi, defaultRentalYield = 3.5 }: RoiCalculatorProps) {
  const [price, setPrice] = useState(propertyPrice);
  const [appreciationRate, setAppreciationRate] = useState(defaultRoi);
  const [rentalYield, setRentalYield] = useState(defaultRentalYield);
  // Direct render calculations to comply with React 19 rules of pure rendering
  const yearlyRent = Math.round(price * (rentalYield / 100));
  const futureValue = price * Math.pow(1 + appreciationRate / 100, 5);
  const fiveYearAppreciation = Math.round(futureValue - price);
  const totalReturn = Math.round(yearlyRent * 5 + fiveYearAppreciation);

  // Year-by-year points for compounding appreciation visual
  const yearlyData = Array.from({ length: 6 }).map((_, year) => {
    const value = price * Math.pow(1 + appreciationRate / 100, year);
    return {
      year: `Yr ${year}`,
      value: Math.round(value),
    };
  });

  const maxVal = yearlyData[5].value;
  const minVal = price;
  const range = maxVal - minVal || 1;

  // SVG Coordinates calculation
  const padding = { left: 10, right: 10, top: 15, bottom: 15 };
  const width = 300;
  const height = 80;
  const points = yearlyData.map((d, index) => {
    const x = padding.left + (index / 5) * (width - padding.left - padding.right);
    const y = height - padding.bottom - ((d.value - minVal) / range) * (height - padding.top - padding.bottom);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border/40 flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-bold tracking-tight text-luxury-gradient">
          Investment ROI Projections
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          5-Year compounding analytics and dynamic rental metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Sliders */}
        <div className="flex flex-col gap-5">
          {/* Purchase Value */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground uppercase tracking-wide">Investment Value</span>
              <span className="text-foreground">{formatINR(price)}</span>
            </div>
            <input
              type="range"
              min={Math.round(propertyPrice * 0.7)}
              max={Math.round(propertyPrice * 1.5)}
              step={1000000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full accent-gold bg-muted h-1 rounded-lg cursor-pointer"
            />
          </div>

          {/* Annual Capital Appreciation */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground uppercase tracking-wide">Projected Annual Growth</span>
              <span className="text-foreground text-emerald-500 font-bold">+{appreciationRate.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={3.0}
              max={25.0}
              step={0.5}
              value={appreciationRate}
              onChange={(e) => setAppreciationRate(Number(e.target.value))}
              className="w-full accent-gold bg-muted h-1 rounded-lg cursor-pointer"
            />
          </div>

          {/* Rental Yield */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground uppercase tracking-wide">Expected Rental Yield</span>
              <span className="text-foreground text-gold font-bold">{rentalYield.toFixed(1)}% p.a.</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={10.0}
              step={0.1}
              value={rentalYield}
              onChange={(e) => setRentalYield(Number(e.target.value))}
              className="w-full accent-gold bg-muted h-1 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Results Panel */}
        <div className="flex flex-col gap-4 bg-black/10 dark:bg-white/5 p-5 rounded-xl border border-white/5 justify-between">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] uppercase font-bold text-muted-foreground">Estimated Annual Rent</span>
              <h4 className="text-base font-bold text-foreground mt-0.5">
                {formatINR(yearlyRent)}
              </h4>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-muted-foreground">5-Yr Net Capital Gain</span>
              <h4 className="text-base font-bold text-emerald-500 mt-0.5">
                +{formatINR(fiveYearAppreciation)}
              </h4>
            </div>
          </div>

          <div className="border-t border-border/10 pt-3">
            <span className="text-[9px] uppercase font-semibold text-muted-foreground">Total Return (5 Years)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-luxury-gold">{formatINR(totalReturn)}</span>
              <span className="text-xs text-emerald-500 font-bold">
                ({((totalReturn / price) * 100).toFixed(0)}% Net Return)
              </span>
            </div>
          </div>

          {/* Small sparkline */}
          <div className="w-full mt-1 border-t border-border/5 pt-2">
            <div className="flex justify-between text-[8px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
              <span>Appreciation Curve</span>
              <span>{formatINR(maxVal)} Value</span>
            </div>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 overflow-visible">
              <polyline
                fill="none"
                stroke="#d4af37"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
              {yearlyData.map((d, index) => {
                const x = padding.left + (index / 5) * (width - padding.left - padding.right);
                const y = height - padding.bottom - ((d.value - minVal) / range) * (height - padding.top - padding.bottom);
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="3"
                    fill={index === 5 ? "#10b981" : "#d4af37"}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
