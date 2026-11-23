"use client";

import type { RegisteredApp } from "@/lib/apps";
import { accountBase } from "@/lib/admin-api";

export function RegisteredAppCard({
    app,
    busy,
    onAction,
}: {
    app: RegisteredApp;
    busy: boolean;
    onAction: (
        app: RegisteredApp,
        action: "approve" | "revoke" | "rotate-secret",
    ) => void;
}) {
    const signIn = `${accountBase}/login?${new URLSearchParams({ app: app.app_id, ...(app.origins[0] ? { returnTo: `${app.origins[0]}/` } : {}) })}`;
    return (
        <article className="panel registered-app-card">
            <div className="panel-heading">
                <div>
                    <h2>{app.name}</h2>
                    <p>
                        {app.app_id} · {app.client_type} client
                    </p>
                </div>
                <span
                    className={`status-pill ${app.status === "approved" ? "status-active" : app.status === "pending" ? "status-pending" : "status-suspended"}`}
                >
                    {app.status === "approved" ? "Active" : app.status}
                </span>
            </div>
            <dl className="app-config">
                <dt>Client ID</dt>
                <dd>
                    <code>{app.client_id}</code>
                </dd>
                <dt>Owner</dt>
                <dd>{app.owner}</dd>
                <dt>Origins</dt>
                <dd>
                    {app.origins.length
                        ? app.origins.map((origin) => (
                              <div key={origin}>{origin}</div>
                          ))
                        : "Native-only app"}
                </dd>
                <dt>Callbacks</dt>
                <dd>
                    {app.redirect_uris.map((uri) => (
                        <div key={uri}>{uri}</div>
                    ))}
                </dd>
                <dt>Scopes</dt>
                <dd>{app.allowed_scopes.join(", ")}</dd>
            </dl>
            {app.registry_version !== 1 && (
                <p className="inline-error">
                    Legacy registration. Review and activate before using it
                    with the runtime registry.
                </p>
            )}
            {app.status === "approved" && app.registry_version === 1 && (
                <details className="app-integration">
                    <summary>Integration details</summary>
                    <p>
                        Send <code>x-chefu-app: {app.app_id}</code> on
                        credentialed API requests.
                    </p>
                    {!!app.origins.length && (
                        <>
                            <p>Shared-session sign-in:</p>
                            <code>{signIn}</code>
                        </>
                    )}
                    <p>
                        OAuth authorization:{" "}
                        <code>https://api.chefu.co.za/oauth/authorize</code>.
                        Use this client ID, an exact registered callback, state,
                        nonce, and S256 PKCE. Token endpoint:{" "}
                        <code>https://api.chefu.co.za/oauth/token</code>.
                    </p>
                </details>
            )}
            <div className="dialog-actions">
                {app.status !== "approved" || app.registry_version !== 1 ? (
                    <button
                        className="button button-primary"
                        disabled={busy}
                        onClick={() => onAction(app, "approve")}
                    >
                        Activate
                    </button>
                ) : (
                    <button
                        className="button button-danger"
                        disabled={busy}
                        onClick={() => onAction(app, "revoke")}
                    >
                        Revoke
                    </button>
                )}
                {app.client_type === "confidential" && (
                    <button
                        className="button button-secondary"
                        disabled={busy}
                        onClick={() => onAction(app, "rotate-secret")}
                    >
                        Rotate client secret
                    </button>
                )}
            </div>
        </article>
    );
}
