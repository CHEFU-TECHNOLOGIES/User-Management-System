import { formatNumber, type Summary } from "@/lib/admin-api";

export function DashboardMetrics({ summary }: { summary: Summary | null }) {
    const metrics = [
        {
            label: "Total accounts",
            value: summary?.total,
            note: "Central account profiles",
        },
        {
            label: "Recently active",
            value: summary?.active,
            note: "Signed in during the last 30 days",
        },
        {
            label: "New accounts",
            value: summary?.newUsers,
            note: "Created during the last 30 days",
        },
        {
            label: "Administrators",
            value: summary?.admins,
            note: "Accounts with the admin role",
        },
    ];
    return (
        <section className="metrics-grid" aria-label="User statistics">
            {metrics.map(({ label, value, note }) => (
                <article className="metric-card" key={label}>
                    <p className="metric-label">{label}</p>
                    <div className="metric-bottom">
                        <strong>
                            {value === undefined ? "—" : formatNumber(value)}
                        </strong>
                    </div>
                    <p className="metric-note">{note}</p>
                </article>
            ))}
        </section>
    );
}
