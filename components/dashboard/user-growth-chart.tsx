import { CalendarDays } from "lucide-react";
import { formatNumber, type Summary } from "@/lib/admin-api";

export function UserGrowthChart({
  summary,
  days,
  onRangeChange,
}: {
  summary: Summary | null;
  days: number;
  onRangeChange: (days: number) => void;
}) {
  const points = summary?.growth || [];
  const max = Math.max(1, ...points.map((point) => point.count));
  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${(index * 720) / Math.max(1, points.length - 1)} ${172 - (point.count / max) * 156}`,
    )
    .join(" ");
  return (
    <article className="panel growth-panel">
      <div className="panel-heading">
        <div>
          <h2>Account growth</h2>
          <p>New registrations by interval (UTC)</p>
        </div>
        <label className="select-button">
          <CalendarDays size={14} />
          <select
            aria-label="Growth date range"
            value={days}
            onChange={(event) => onRangeChange(Number(event.target.value))}
          >
            {[7, 30, 90].map((value) => (
              <option key={value} value={value}>
                Last {value} days
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="chart-summary">
        <strong>
          {summary
            ? formatNumber(points.reduce((sum, point) => sum + point.count, 0))
            : "—"}
        </strong>
        <span className="chart-period">new accounts in this period</span>
      </div>
      <div className="chart-area">
        <div className="chart-y-labels">
          {[1, 0.75, 0.5, 0.25, 0].map((value) => (
            <span key={value}>{formatNumber(Math.ceil(max * value))}</span>
          ))}
        </div>
        <svg
          className="growth-chart"
          viewBox="0 0 720 188"
          preserveAspectRatio="none"
          role="img"
          aria-label={`New account registrations over the last ${days} days`}
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
          {points.length > 0 && (
            <>
              <path d={`${path} L 720 172 L 0 172 Z`} fill="url(#chartFill)" />
              <path
                d={path}
                fill="none"
                stroke="#6957ed"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>
        <div className="chart-x-labels">
          {points
            .filter(
              (_, index) =>
                index === 0 ||
                index === points.length - 1 ||
                index === Math.floor(points.length / 2),
            )
            .map((point) => (
              <span key={point.date}>
                {new Date(point.date).toLocaleDateString("en-ZA", {
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </span>
            ))}
        </div>
      </div>
      {summary && !points.some((point) => point.count > 0) && (
        <p className="metric-note">No new accounts in this period.</p>
      )}
    </article>
  );
}
