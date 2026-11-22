"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { UserApps } from "./user-apps";
import { UserCountry } from "./user-country";
import {
  adminApi,
  errorMessage,
  formatDate,
  isAccessError,
  type ManagedUser,
} from "@/lib/admin-api";

export function UserActionsDialog({
  user,
  currentUid,
  onClose,
  onChanged,
  onAccessError,
  notify,
}: {
  user: ManagedUser;
  currentUid: string;
  onClose: () => void;
  onChanged: () => void;
  onAccessError: (error: unknown) => void;
  notify: (message: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const managed = ["admin", "moderator", "support", "user"];
  const initialRole =
    managed.find((role) =>
      user.roles.some((value) => value.toLowerCase() === role),
    ) || "user";
  const [role, setRole] = useState(initialRole);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ownAccount = user.uid === currentUid;
  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  async function update(change: { disabled?: boolean; role?: string }) {
    if (!user.uid || busy || ownAccount) return;
    setBusy(true);
    setError("");
    try {
      await adminApi(`/users/${encodeURIComponent(user.uid)}`, {
        method: "PATCH",
        body: JSON.stringify(change),
      });
      notify(
        "Account updated. Access changes take effect across the platforms.",
      );
      onChanged();
      onClose();
    } catch (error) {
      if (isAccessError(error)) onAccessError(error);
      setError(errorMessage(error));
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="account-dialog"
      aria-labelledby="account-dialog-title"
      onCancel={(event) => {
        if (busy) event.preventDefault();
        else onClose();
      }}
    >
      <div className="panel-heading">
        <div>
          <h2 id="account-dialog-title">{user.name}</h2>
          <p>{user.email}</p>
        </div>
        <button
          className="icon-button"
          aria-label="Close user details"
          onClick={onClose}
          disabled={busy}
        >
          <X size={18} />
        </button>
      </div>
      <dl className="account-details">
        <dt>Status</dt>
        <dd>{user.status}</dd>
        <dt>Country</dt>
        <dd>
          <UserCountry country={user.country} />
        </dd>
        <dt>Gender</dt>
        <dd>{user.gender || "Not specified"}</dd>
        <dt>Created</dt>
        <dd>{formatDate(user.createdAt)}</dd>
        <dt>Last sign-in</dt>
        <dd>{formatDate(user.lastLoginAt)}</dd>
        <dt>Current roles</dt>
        <dd>{user.roles.join(", ") || "user"}</dd>
      </dl>
      <section className="user-app-section" aria-label="Apps signed in to">
        <h3>Apps signed in to</h3>
        <UserApps apps={user.apps} detailed />
      </section>
      {ownAccount ? (
        <p>
          You can manage your own profile in your account. Your administrator
          access cannot be changed here.
        </p>
      ) : (
        <>
          <label className="field-label">
            Account role
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              disabled={busy}
            >
              {managed.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <p className="metric-note">
            Other product roles are retained. Changing a role signs this user
            out.
          </p>
          <div className="dialog-actions">
            <button
              className="button button-primary"
              disabled={busy || role === initialRole}
              onClick={() => void update({ role })}
            >
              Save role
            </button>
            <button
              className={`button ${user.status === "Suspended" ? "button-secondary" : "button-danger"}`}
              disabled={busy}
              onClick={() =>
                void update({ disabled: user.status !== "Suspended" })
              }
            >
              {user.status === "Suspended"
                ? "Enable account"
                : "Suspend account"}
            </button>
          </div>
          {user.status === "Pending" && (
            <p className="metric-note">
              Enabling an account does not verify its email address.
            </p>
          )}
        </>
      )}
      {busy && <p role="status">Saving account changes…</p>}
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
    </dialog>
  );
}
