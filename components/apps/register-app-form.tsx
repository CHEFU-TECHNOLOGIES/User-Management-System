"use client";

import { adminApi, errorMessage } from "@/lib/admin-api";
import { applicationId } from "@/lib/application-id";
import { splitLines } from "@/lib/apps";
import { useState, type FormEvent } from "react";

export function RegisterAppForm({
    owner,
    onRegistered,
    onCancel,
    onAccessError,
}: {
    owner: string;
    onRegistered: (secret?: string) => void;
    onCancel: () => void;
    onAccessError: (error: unknown) => void;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [appId, setAppId] = useState("");
    const [platform, setPlatform] = useState("web");
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const body = {
            name: String(data.get("name")).trim(),
            appId: String(data.get("appId")).trim(),
            owner: String(data.get("owner")).trim(),
            clientType: "public",
            origins: platform === "web" ? splitLines(data.get("origins")) : [],
            redirectUris: splitLines(data.get("callbacks")),
            allowedScopes: ["openid", "profile", "email"],
            status: data.has("activate") ? "approved" : "pending",
        };
        setBusy(true);
        setError("");
        try {
            const result = await adminApi<{ clientSecret?: string }>(
                "/apps/register",
                { method: "POST", body: JSON.stringify(body) },
            );
            onRegistered(result.clientSecret);
        } catch (error) {
            onAccessError(error);
            setError(errorMessage(error));
        } finally {
            setBusy(false);
        }
    }
    return (
        <section className="panel app-registration">
            <h2>Register an application</h2>
            <p>Connect a web, mobile, or server app to our SSO.</p>
            <form onSubmit={(event) => void submit(event)}>
                <fieldset disabled={busy} className="app-form-fields">
                    <label className="field-label">
                        Application name
                        <input
                            name="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            onBlur={(event) =>
                                setAppId(
                                    applicationId(event.currentTarget.value),
                                )
                            }
                            required
                            maxLength={100}
                            placeholder="My new app"
                        />
                    </label>
                    <label className="field-label">
                        Application ID
                        <input
                            name="appId"
                            value={appId}
                            onChange={(event) => setAppId(event.target.value)}
                            required
                            pattern="[a-z][a-z0-9-]{1,63}"
                            maxLength={64}
                            placeholder="my-new-app"
                        />
                    </label>
                    <label className="field-label">
                        Owner email
                        <input
                            name="owner"
                            type="email"
                            required
                            defaultValue={owner}
                            maxLength={254}
                        />
                    </label>
                    <label className="field-label">
                        App platform
                        <select
                            name="platform"
                            value={platform}
                            onChange={(event) => setPlatform(event.target.value)}
                        >
                            <option value="web">Web app</option>
                            <option value="native">Native app</option>
                        </select>
                    </label>
                    {platform === "web" && (
                        <label className="field-label app-form-wide">
                            Web origins
                            <textarea
                                name="origins"
                                required
                                rows={3}
                                placeholder={
                                    "https://my-new-app.example.com\nhttp://localhost:3000"
                                }
                            />
                            <small>One exact origin per line.</small>
                        </label>
                    )}
                    <label className="field-label app-form-wide">
                        Callback URLs
                        <textarea
                            name="callbacks"
                            rows={3}
                            required
                            placeholder={
                                "https://my-new-app.example.com/auth/callback\nmyapp://auth"
                            }
                        />
                        <small>
                            One exact URL per line. Web callbacks must belong to
                            a registered origin.
                        </small>
                    </label>
                    <label className="app-form-wide">
                        <input type="checkbox" name="activate" defaultChecked />{" "}
                        Activate immediately
                    </label>
                    {error && (
                        <p className="inline-error app-form-wide" role="alert">
                            {error}
                        </p>
                    )}
                    <div className="dialog-actions app-form-wide">
                        <button className="button button-primary" type="submit">
                            {busy ? "Registering…" : "Register application"}
                        </button>
                        <button
                            className="button button-secondary"
                            type="button"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </fieldset>
            </form>
        </section>
    );
}
