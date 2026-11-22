"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import {
  adminApi,
  errorMessage,
  formatNumber,
  isAccessError,
  type ManagedUser,
  type UserPage,
} from "@/lib/admin-api";
import { downloadCsv } from "@/lib/csv";
import { UsersTable } from "./users-table";
import { UserActionsDialog } from "./user-actions-dialog";

type Props = {
  currentUid: string;
  revision: number;
  moderation?: boolean;
  onChanged: () => void;
  onAccessError: (error: unknown) => void;
  notify: (message: string) => void;
};
export function UserDirectory({
  currentUid,
  revision,
  moderation,
  onChanged,
  onAccessError,
  notify,
}: Props) {
  const [result, setResult] = useState<UserPage | null>(null);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All users");
  const [role, setRole] = useState("All roles");
  const [descending, setDescending] = useState(false);
  const [cursors, setCursors] = useState<string[]>([""]);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [actionUser, setActionUser] = useState<ManagedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const cursor = cursors[page] || "";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(query.trim());
      setPage(0);
      setCursors([""]);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setResult(null);
    setSelected([]);
    const params = new URLSearchParams({ limit: "25", search, cursor });
    void adminApi<UserPage>(`/users?${params}`, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setResult(data);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        onAccessError(error);
        setError(errorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [search, cursor, revision, retry, onAccessError]);

  const people = useMemo(
    () =>
      (result?.users || [])
        .filter(
          (person) =>
            (status === "All users" || person.status === status) &&
            (role === "All roles" || person.roles.includes(role)),
        )
        .sort((a, b) => (descending ? -1 : 1) * a.name.localeCompare(b.name)),
    [result, status, role, descending],
  );
  const selectable = people
    .filter((user) => user.uid && user.uid !== currentUid)
    .map((user) => user.uid!);
  const waiting = busy || loading || query.trim() !== search;
  const toggleAll = () =>
    setSelected(
      selectable.every((uid) => selected.includes(uid)) ? [] : selectable,
    );
  const toggleUser = (uid: string) =>
    setSelected((current) =>
      current.includes(uid)
        ? current.filter((value) => value !== uid)
        : [...current, uid],
    );

  async function updateSelected(disabled: boolean) {
    setBusy(true);
    setError("");
    let completed = 0;
    const failures: string[] = [];
    for (const uid of selected) {
      try {
        await adminApi(`/users/${encodeURIComponent(uid)}`, {
          method: "PATCH",
          body: JSON.stringify({ disabled }),
        });
        completed++;
      } catch (error) {
        failures.push(errorMessage(error));
        if (isAccessError(error)) {
          onAccessError(error);
          break;
        }
      }
    }
    setSelected([]);
    setBusy(false);
    if (failures.length)
      setError(
        `${completed} account(s) updated. ${failures.length} failed: ${failures[0]}`,
      );
    notify(
      failures.length
        ? `${completed} updated. ${failures.length} failed: ${failures[0]}`
        : `${completed} account(s) ${disabled ? "suspended" : "enabled"}.`,
    );
    onChanged();
  }

  return (
    <section className="panel directory-card" aria-busy={waiting}>
      <div className="directory-heading">
        <div>
          <div className="title-with-badge">
            <h2>{moderation ? "Account moderation" : "CheFu accounts"}</h2>
            {result && (
              <span className="total-badge">{formatNumber(result.total)}</span>
            )}
          </div>
          <p>
            Email search covers all profiles. Status, role, and name sorting
            apply to this page.
          </p>
        </div>
        <button
          className="button button-secondary export-button"
          disabled={waiting || !people.length}
          onClick={() => {
            downloadCsv([
              ["Name", "Email", "Roles", "Status", "Joined"],
              ...people.map((person) => [
                person.name,
                person.email,
                person.roles.join(", "),
                person.status,
                person.createdAt || "",
              ]),
            ]);
            notify("Current page exported.");
          }}
        >
          <Download size={15} />
          Export page
        </button>
      </div>
      <div className="table-toolbar">
        <label className="table-search">
          <Search size={16} />
          <input
            aria-label="Search users by email prefix"
            placeholder="Search by email…"
            value={query}
            disabled={busy}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="toolbar-right">
          <select
            className="select-button"
            aria-label="Filter status on this page"
            value={status}
            disabled={busy}
            onChange={(event) => {
              setStatus(event.target.value);
              setSelected([]);
            }}
          >
            {["All users", "Active", "Pending", "Suspended", "Unavailable"].map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </select>
          <select
            className="select-button"
            aria-label="Filter role on this page"
            value={role}
            disabled={busy}
            onChange={(event) => {
              setRole(event.target.value);
              setSelected([]);
            }}
          >
            {["All roles", "admin", "user", "moderator", "support"].map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </select>
        </div>
      </div>
      {error && (
        <div className="inline-error" role="alert">
          {error}{" "}
          <button
            onClick={() => setRetry((value) => value + 1)}
            disabled={waiting}
          >
            Retry
          </button>
        </div>
      )}
      {selected.length > 0 && (
        <div className="bulk-bar">
          <span>{selected.length} selected</span>
          <button disabled={waiting} onClick={() => void updateSelected(false)}>
            Enable accounts
          </button>
          <button disabled={waiting} onClick={() => void updateSelected(true)}>
            Suspend accounts
          </button>
          <button disabled={waiting} onClick={() => setSelected([])}>
            Clear selection
          </button>
        </div>
      )}
      {loading ? (
        <p className="empty-state" role="status">
          Loading CheFu accounts…
        </p>
      ) : !error || result ? (
        <UsersTable
          people={people}
          selected={selected}
          busy={waiting}
          currentUid={currentUid}
          onToggleUser={toggleUser}
          onToggleAll={toggleAll}
          onSort={() => setDescending((value) => !value)}
          onAction={setActionUser}
        />
      ) : null}
      <div className="table-footer">
        <span>
          Page {page + 1} · {people.length} shown ·{" "}
          {result ? formatNumber(result.total) : "—"} matching profiles
        </span>
        <div className="pagination">
          <button
            className="page-button"
            disabled={waiting || page === 0}
            onClick={() => setPage((value) => value - 1)}
          >
            <ChevronLeft size={15} />
            Previous
          </button>
          <button
            className="page-button"
            disabled={waiting || !result?.nextCursor}
            onClick={() => {
              if (result?.nextCursor) {
                setCursors((current) => [
                  ...current.slice(0, page + 1),
                  result.nextCursor!,
                ]);
                setPage((value) => value + 1);
              }
            }}
          >
            Next
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
      {actionUser && (
        <UserActionsDialog
          user={actionUser}
          currentUid={currentUid}
          onClose={() => setActionUser(null)}
          onChanged={onChanged}
          onAccessError={onAccessError}
          notify={notify}
        />
      )}
    </section>
  );
}
