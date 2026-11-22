import { ShieldCheck, UserCheck, UserPlus, Users } from "lucide-react";
import { formatNumber, type Summary } from "@/lib/admin-api";

export function DashboardMetrics({ summary }: { summary: Summary | null }) {
  const metrics = [
    {
      icon: Users,
      label: "Total accounts",
      value: summary?.total,
      note: "Central account profiles",
    },
    {
      icon: UserCheck,
      label: "Recently active",
      value: summary?.active,
      note: "Signed in during the last 30 days",
    },
    {
      icon: UserPlus,
      label: "New accounts",
      value: summary?.newUsers,
      note: "Created during the last 30 days",
    },
    {
      icon: ShieldCheck,
      label: "Administrators",
      value: summary?.admins,
      note: "Accounts with the admin role",
    },
  ];
  return (
    <section className="metrics-grid" aria-label="User statistics">
      {metrics.map(({ icon: Icon, label, value, note }) => (
        <article className="metric-card" key={label}>
          <div className="metric-top">
            <span className="metric-icon">
              <Icon size={17} />
            </span>
          </div>
          <p className="metric-label">{label}</p>
          <div className="metric-bottom">
            <strong>{value === undefined ? "—" : formatNumber(value)}</strong>
          </div>
          <p className="metric-note">{note}</p>
        </article>
      ))}
    </section>
  );
}
