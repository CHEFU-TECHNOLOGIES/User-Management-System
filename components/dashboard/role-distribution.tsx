"use client";

import { MoreHorizontal } from "lucide-react";

export function RoleDistribution({
  notify,
}: {
  notify: (message: string) => void;
}) {
  return (
    <article className="panel distribution-panel">
      <div className="panel-heading">
        <div>
          <h2>Users by role</h2>
          <p>Role distribution</p>
        </div>
        <button
          className="icon-button"
          aria-label="Role chart options"
          onClick={() => notify("Chart options")}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div className="donut-wrap">
        <div className="donut">
          <div className="donut-center">
            <b>2,420</b>
            <span>Total users</span>
          </div>
        </div>
      </div>
      <div className="role-legend">
        <Legend color="purple" label="Users" value="2,182" pct="90.2%" />
        <Legend color="blue" label="Admins" value="186" pct="7.7%" />
        <Legend color="pink" label="Moderators" value="52" pct="2.1%" />
      </div>
    </article>
  );
}

function Legend({
  color,
  label,
  value,
  pct,
}: {
  color: string;
  label: string;
  value: string;
  pct: string;
}) {
  return (
    <div className="legend-row">
      <span className={`legend-dot ${color}`} />
      <span className="legend-label">{label}</span>
      <b>{value}</b>
      <span className="legend-pct">{pct}</span>
    </div>
  );
}
