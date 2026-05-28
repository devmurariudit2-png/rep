"use client";

import React, { useState } from "react";

// ==========================================
// AREA CHART TYPE & COMPONENT
// ==========================================
interface AreaChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  fillGradientId?: string;
}

export function AreaChart({ data, height = 200, color = "#d4af37", fillGradientId = "gold-gradient" }: AreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const valueRange = maxValue - minValue;
  
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartHeight = height - padding.top - padding.bottom;
  
  // Calculate points
  const points = data.map((d, index) => {
    const x = padding.left + (index / (data.length - 1)) * (400 - padding.left - padding.right);
    // scale y
    const relativeVal = (d.value - minValue) / valueRange;
    const y = padding.top + chartHeight - relativeVal * chartHeight;
    return { x, y, ...d };
  });

  // Construct SVG path
  let pathD = "";
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Curved approximation (Cubic Bezier control points)
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
  }

  // Construct closed fill path
  const fillD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
    : "";

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 400 ${height}`} className="w-full h-auto overflow-visible select-none">
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + chartHeight * ratio;
          const val = maxValue - ratio * valueRange;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={400 - padding.right}
                y2={y}
                stroke="currentColor"
                className="text-border/30"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[8px] font-medium"
              >
                {val >= 10000000 ? `₹${(val / 10000000).toFixed(1)}Cr` : val >= 100000 ? `₹${(val / 100000).toFixed(0)}L` : val}
              </text>
            </g>
          );
        })}

        {/* Closed Gradient Fill Area */}
        <path d={fillD} fill={`url(#${fillGradientId})`} />

        {/* Line Path */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

        {/* Interactive Overlay & Markers */}
        {points.map((pt, idx) => (
          <g
            key={idx}
            className="cursor-pointer"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Invisibly large hover targets */}
            <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />
            
            {/* Glowing dot on hover */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIndex === idx ? "5" : "3.5"}
              fill={color}
              stroke="white"
              strokeWidth={hoveredIndex === idx ? "1.5" : "1"}
              className="transition-all duration-200"
            />
          </g>
        ))}

        {/* X Axis Labels */}
        {points.map((pt, idx) => (
          <text
            key={idx}
            x={pt.x}
            y={height - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px] font-semibold"
          >
            {pt.label}
          </text>
        ))}
      </svg>

      {/* Tooltip Popup */}
      {hoveredIndex !== null && (
        <div
          className="absolute glass-panel p-2.5 rounded-lg border border-gold/30 text-xs shadow-xl pointer-events-none z-10 flex flex-col gap-0.5"
          style={{
            left: `${(points[hoveredIndex].x / 400) * 100}%`,
            top: `${(points[hoveredIndex].y / height) * 100 - 45}%`,
            transform: "translateX(-50%)",
          }}
        >
          <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
            {points[hoveredIndex].label}
          </span>
          <span className="font-bold text-foreground text-sm">
            {points[hoveredIndex].value >= 10000000 
              ? `₹${(points[hoveredIndex].value / 10000000).toFixed(2)} Cr` 
              : points[hoveredIndex].value >= 100000 
                ? `₹${(points[hoveredIndex].value / 100000).toFixed(0)} Lakh`
                : points[hoveredIndex].value}
          </span>
        </div>
      )}
    </div>
  );
}

// ==========================================
// BAR CHART COMPONENT
// ==========================================
interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

export function BarChart({ data, height = 200, color = "#c5a880" }: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1);

  const padding = { top: 20, right: 10, bottom: 30, left: 30 };
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = Math.max(10, (400 - padding.left - padding.right) / data.length - 12);

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 400 ${height}`} className="w-full h-auto overflow-visible select-none">
        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding.top + chartHeight * ratio;
          return (
            <line
              key={i}
              x1={padding.left}
              y1={y}
              x2={400 - padding.right}
              y2={y}
              stroke="currentColor"
              className="text-border/30"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Bars */}
        {data.map((d, idx) => {
          const x = padding.left + idx * ((400 - padding.left - padding.right) / data.length) + 6;
          const barHeight = (d.value / maxValue) * chartHeight;
          const y = padding.top + chartHeight - barHeight;

          return (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Actual bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill={hoveredIdx === idx ? "#d4af37" : color}
                className="transition-all duration-300"
              />
              
              {/* Invisible touch target */}
              <rect
                x={x - 4}
                y={padding.top}
                width={barWidth + 8}
                height={chartHeight}
                fill="transparent"
              />

              {/* Label */}
              <text
                x={x + barWidth / 2}
                y={height - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px] font-semibold"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredIdx !== null && (
        <div
          className="absolute glass-panel p-2 rounded-lg border border-gold/30 text-xs shadow-xl pointer-events-none z-10"
          style={{
            left: `${((padding.left + hoveredIdx * ((400 - padding.left - padding.right) / data.length) + 6 + barWidth / 2) / 400) * 100}%`,
            top: `${((padding.top + chartHeight - (data[hoveredIdx].value / maxValue) * chartHeight) / height) * 100 - 35}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-bold text-center">{data[hoveredIdx].value} Inquiries</div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// DONUT CHART COMPONENT
// ==========================================
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function DonutChart({ data, size = 180 }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  const segments = data.map((item, idx) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const strokeLength = total > 0 ? (item.value / total) * circumference : 0;
    
    // Sum up preceding segments to calculate the offset immutably
    const previousSum = data
      .slice(0, idx)
      .reduce((sum, d) => sum + (total > 0 ? (d.value / total) * circumference : 0), 0);
    const strokeOffset = circumference - previousSum;

    return {
      ...item,
      percentage,
      strokeLength,
      strokeOffset,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 justify-center">
      {/* Circle Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-border/20"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, idx) => (
            <circle
              key={idx}
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.strokeLength} ${circumference - seg.strokeLength}`}
              strokeDashoffset={seg.strokeOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          ))}
        </svg>

        {/* Central Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">
            Total Leads
          </span>
          <span className="text-2xl font-black text-foreground">{total}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3 min-w-[120px]">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="h-3.5 w-3.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground uppercase">
                {seg.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {seg.value} ({seg.percentage.toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
