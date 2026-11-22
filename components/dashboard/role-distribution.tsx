import { formatNumber, type Summary } from "@/lib/admin-api";

export function RoleDistribution({ summary }: { summary: Summary | null }) {
  const total = summary?.total || 0;
  const percent = total ? (summary!.admins / total) * 100 : 0;
  return (
    <article className="panel distribution-panel">
      <div className="panel-heading">
        <div>
          <h2>Administrator access</h2>
          <p>Central account roles</p>
        </div>
      </div>
      <div className="donut-wrap">
        <div
          className="donut"
          style={{
            background: total
              ? `conic-gradient(#6957ed 0% ${percent}%, #71a6f7 ${percent}% 100%)`
              : "var(--panel-border)",
          }}
        >
          <div className="donut-center">
            <b>{summary ? formatNumber(total) : "—"}</b>
            <span>Total accounts</span>
          </div>
        </div>
      </div>
      <div className="role-legend">
        {summary?.roles.map((role, index) => (
          <div className="legend-row" key={role.label}>
            <span className={`legend-dot ${index === 0 ? "purple" : "blue"}`} />
            <span className="legend-label">{role.label}</span>
            <b>{formatNumber(role.count)}</b>
            <span className="legend-pct">
              {total ? ((role.count / total) * 100).toFixed(1) : "0"}%
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
