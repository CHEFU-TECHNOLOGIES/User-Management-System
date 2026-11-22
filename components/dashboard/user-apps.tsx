import { formatDate, type ManagedUser } from "@/lib/admin-api";

export function UserApps({
  apps = [],
  detailed = false,
}: {
  apps?: ManagedUser["apps"];
  detailed?: boolean;
}) {
  if (!apps.length)
    return <span className="metric-note">No apps recorded</span>;
  if (!detailed)
    return (
      <div className="user-app-badges">
        {apps.map((app) => (
          <span
            key={app.id}
            className={`user-app-badge ${app.enabled ? "" : "app-revoked"}`}
            title={`${app.name} · Last activity: ${formatDate(app.lastSeenAt)}${app.enabled ? "" : " · Access revoked"}`}
          >
            {app.name}
            {!app.enabled && <span> (revoked)</span>}
          </span>
        ))}
      </div>
    );
  return (
    <ul className="user-app-details">
      {apps.map((app) => (
        <li key={app.id}>
          <div>
            <b>{app.name}</b>
            <span className={app.enabled ? "verified" : "unverified"}>
              {app.enabled ? "Connected" : "Access revoked"}
            </span>
          </div>
          <p>First activity: {formatDate(app.firstSeenAt)}</p>
          <p>Last activity: {formatDate(app.lastSeenAt)}</p>
        </li>
      ))}
    </ul>
  );
}
