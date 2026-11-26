"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { adminApi, errorMessage, invalidateAdminReads } from "@/lib/admin-api";
import type { AppsResult, RegisteredApp } from "@/lib/apps";
import { RegisterAppForm } from "./register-app-form";
import { RegisteredAppCard } from "./registered-app-card";
import { AppsSkeleton } from "./apps-skeleton";
import "./apps.css";

export function AppsSection({
    owner,
    revision,
    onChanged,
    onAccessError,
}: {
    owner: string;
    revision: number;
    onChanged: () => void;
    onAccessError: (error: unknown) => void;
}) {
    const [data, setData] = useState<AppsResult | null>(null);
    const [creating, setCreating] = useState(false);
    const [secret, setSecret] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        void adminApi<AppsResult>("/apps", { signal: controller.signal })
            .then((result) => {
                if (!controller.signal.aborted) setData(result);
            })
            .catch((error) => {
                if (!controller.signal.aborted) {
                    onAccessError(error);
                    setError(errorMessage(error));
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [revision, retry, onAccessError]);

    async function action(
        app: RegisteredApp,
        action: "approve" | "revoke" | "rotate-secret",
    ) {
        if (
            action !== "approve" &&
            !window.confirm(
                action === "revoke"
                    ? `Stop new sign-ins and token refreshes for ${app.name}? Existing access tokens may remain valid until they expire.`
                    : `Replace the client secret for ${app.name}? Update its server configuration afterward.`,
            )
        )
            return;
        setBusy(true);
        setError("");
        setSecret("");
        try {
            const result = await adminApi<{ secret?: string }>(
                `/apps/${encodeURIComponent(app.client_id)}/${action}`,
                { method: "POST" },
            );
            if (result.secret) setSecret(result.secret);
            onChanged();
        } catch (error) {
            onAccessError(error);
            setError(errorMessage(error));
        } finally {
            setBusy(false);
        }
    }
    return (
        <div className="apps-section">
            <div className="directory-heading">
                <div>
                    <h2>Applications</h2>
                    <p>
                        Register trusted origins, sign-in callbacks, and OAuth
                        access.
                    </p>
                </div>
                <button
                    className="button button-primary"
                    disabled={busy || creating}
                    onClick={() => {
                        setCreating(true);
                        setSecret("");
                    }}
                >
                    <Plus size={15} />
                    Register app
                </button>
            </div>
            {secret && (
                <section
                    className="panel app-secret"
                    aria-label="New client secret"
                >
                    <h2>Save your client secret</h2>
                    <p>
                        Shown once and never stored in the dashboard cache.
                        Store it securely on the app’s server.
                    </p>
                    <code>{secret}</code>
                    <div className="dialog-actions">
                        <button
                            className="button button-secondary"
                            onClick={async () => {
                                try {
                                    await navigator.clipboard.writeText(secret);
                                } catch {
                                    setError(
                                        "Copy failed. Select and copy the secret manually.",
                                    );
                                }
                            }}
                        >
                            Copy secret
                        </button>
                        <button
                            className="button button-secondary"
                            onClick={() => setSecret("")}
                        >
                            Dismiss
                        </button>
                    </div>
                </section>
            )}
            {creating && (
                <RegisterAppForm
                    owner={owner}
                    onCancel={() => setCreating(false)}
                    onAccessError={onAccessError}
                    onRegistered={(value) => {
                        setCreating(false);
                        setSecret(value || "");
                        onChanged();
                    }}
                />
            )}
            {error && (
                <div className="inline-error" role="alert">
                    {error}{" "}
                    <button
                        disabled={loading || busy}
                        onClick={async () => {
                            await invalidateAdminReads("/apps");
                            setRetry((value) => value + 1);
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}
            {loading && <AppsSkeleton />}
            {data && (
                <>
                    <div className="apps-grid">
                        {data.dynamicApps.records.map((app) => (
                            <RegisteredAppCard
                                key={app.client_id}
                                app={app}
                                busy={busy}
                                onAction={(app, name) => void action(app, name)}
                            />
                        ))}
                    </div>
                    {!data.dynamicApps.records.length && (
                        <p className="empty-state">
                            No applications registered yet.
                        </p>
                    )}
                    <p className="metric-note">
                        Showing up to {data.dynamicApps.limit} registrations,
                        newest first.
                    </p>
                    <details className="panel built-in-apps">
                        <summary>
                            Platform applications ({data.staticApps.length})
                        </summary>
                        <p>
                            Existing platform definitions are retained. Register
                            new application IDs above.
                        </p>
                        {data.staticApps.map((app) => (
                            <div className="builtin-app" key={app.id}>
                                <b>{app.name}</b>
                                <code>{app.id}</code>
                                <span>{app.origins.join(", ")}</span>
                            </div>
                        ))}
                    </details>
                </>
            )}
        </div>
    );
}
