import type { ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  MoreHorizontal,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";

export function DashboardMetrics() {
  return (
    <section className="metrics-grid" aria-label="User statistics">
      <Metric
        icon={<Users size={17} />}
        label="Total users"
        value="2,420"
        change="20.1%"
        direction="up"
        note="vs. last month"
      />
      <Metric
        icon={<UserCheck size={17} />}
        label="Active users"
        value="1,845"
        change="12.8%"
        direction="up"
        note="vs. last month"
      />
      <Metric
        icon={<UserPlus size={17} />}
        label="New this month"
        value="128"
        change="8.2%"
        direction="up"
        note="vs. last month"
      />
      <Metric
        icon={<ShieldCheck size={17} />}
        label="Needs attention"
        value="12"
        change="2.4%"
        direction="down"
        note="pending verification"
        alert
      />
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
  change,
  direction,
  note,
  alert = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  change: string;
  direction: "up" | "down";
  note: string;
  alert?: boolean;
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className="metric-icon">{icon}</span>
        <button
          className="icon-button metric-more"
          aria-label={`${label} options`}
        >
          <MoreHorizontal size={17} />
        </button>
      </div>
      <p className="metric-label">{label}</p>
      <div className="metric-bottom">
        <strong>{value}</strong>
        <span
          className={`metric-change ${alert ? "change-warn" : direction === "up" ? "change-up" : "change-down"}`}
        >
          {direction === "up" ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}{" "}
          {change}
        </span>
      </div>
      <p className="metric-note">{note}</p>
    </article>
  );
}
