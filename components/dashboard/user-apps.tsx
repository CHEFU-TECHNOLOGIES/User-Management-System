import type { CSSProperties } from "react";
import { formatDate, type ManagedUser } from "@/lib/admin-api";

type AppColorStyle = CSSProperties & { "--app-hue": number };

function appColorStyle(id: string): AppColorStyle {
  let hue = 0;
  for (const character of id)
    hue = (hue * 31 + character.charCodeAt(0)) % 360;
  return { "--app-hue": hue };
}

export function UserApps({
  apps = [],
  detailed = false,
}: {
  apps?: ManagedUser["apps"];
  detailed?: boolean;
}) {
  if (!apps.length)
    return <span className="metric-note">No apps recorded</span>;
  if (!detailed) {
    const firstApp = apps[0];
    return (
      <div
        className="user-app-badges"
        title={apps
          .map(
            (app) =>
              `${app.name}${app.enabled ? "" : " (access revoked)"}`,
          )
          .join(", ")}
      >
        <span
            className={`user-app-badge ${firstApp.enabled ? "" : "app-revoked"}`}
            style={appColorStyle(firstApp.id)}
        >
          {firstApp.name}
          {!firstApp.enabled && <span> (revoked)</span>}
        </span>
        {apps.length > 1 && (
          <span className="user-app-count">+{apps.length - 1}</span>
        )}
      </div>
    );
  }
  return (
    <ul className="user-app-details">
      {apps.map((app) => (
        <li key={app.id} style={appColorStyle(app.id)}>
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
