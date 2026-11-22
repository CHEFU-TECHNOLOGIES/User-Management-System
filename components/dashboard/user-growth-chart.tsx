"use client";

import { useState } from "react";
import { ArrowUpRight, CalendarDays, ChevronDown } from "lucide-react";

const chartValues = [
  26, 36, 31, 46, 39, 53, 47, 61, 54, 72, 64, 77, 69, 83, 76, 92, 79, 96, 85,
  105, 92, 114, 99, 122, 107, 132, 118, 143, 128, 154,
];

export function UserGrowthChart() {
  const [range, setRange] = useState("Last 30 days");

  return (
    <article className="panel growth-panel">
      <div className="panel-heading">
        <div>
          <h2>User growth</h2>
          <p>Track user acquisition over time</p>
        </div>
        <button
          className="select-button"
          onClick={() =>
            setRange(
              range === "Last 30 days"
                ? "Last 7 days"
                : range === "Last 7 days"
                  ? "Last 90 days"
                  : "Last 30 days",
            )
          }
        >
          <CalendarDays size={14} />
          {range}
          <ChevronDown size={14} />
        </button>
      </div>
      <div className="chart-summary">
        <strong>2,420</strong>
        <span className="trend-pill">
          <ArrowUpRight size={13} />
          20.1%
        </span>
        <span className="chart-period">vs. previous period</span>
      </div>
      <div className="chart-area">
        <div className="chart-y-labels">
          <span>2.5k</span>
          <span>2k</span>
          <span>1.5k</span>
          <span>1k</span>
          <span>0</span>
        </div>
        <svg
          className="growth-chart"
          viewBox="0 0 720 188"
          preserveAspectRatio="none"
          role="img"
          aria-label="User registrations increase steadily over the last 30 days"
        >
          <defs>
            <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6655ed" stopOpacity=".16" />
              <stop offset="100%" stopColor="#6655ed" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[16, 55, 94, 133, 172].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="720"
              y2={y}
              stroke="currentColor"
              strokeOpacity=".075"
              strokeDasharray="3 5"
            />
          ))}
          <path
            d={`M 0 172 ${chartValues.map((v, i) => `L ${i * 24.8} ${172 - v}`).join(" ")} L 720 172 Z`}
            fill="url(#chartFill)"
          />
          <path
            d={`M 0 172 ${chartValues.map((v, i) => `L ${i * 24.8} ${172 - v}`).join(" ")}`}
            fill="none"
            stroke="#6957ed"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx="720"
            cy={172 - chartValues[chartValues.length - 1]}
            r="5"
            fill="#fff"
            stroke="#6957ed"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="chart-x-labels">
          <span>Jan 1</span>
          <span>Jan 5</span>
          <span>Jan 10</span>
          <span>Jan 15</span>
          <span>Jan 20</span>
          <span>Jan 25</span>
          <span>Jan 30</span>
        </div>
      </div>
    </article>
  );
}
