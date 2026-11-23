"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import {
  adminApi,
  errorMessage,
  formatNumber,
  isAccessError,
  invalidateAdminReads,
  type ManagedUser,
  type UserPage,
} from "@/lib/admin-api";
import { downloadCsv } from "@/lib/csv";
import { UsersTable } from "./users-table";
import { UserActionsDialog } from "./user-actions-dialog";
import { countryLabel } from "./user-country";

type Props = {
  currentUid: string;
  revision: number;
  onChanged: () => void;
  onAccessError: (error: unknown) => void;
  notify: (message: string) => void;
};
export function UserDirectory({
  currentUid,
  revision,
  onChanged,
  onAccessError,
  notify,
}: Props) {
  const [result, setResult] = useState<UserPage | null>(null);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All users");
  const [role, setRole] = useState("All roles");
  const [sortBy, setSortBy] = useState<"name" | "createdAt">("name");
  const [descending, setDescending] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [cursors, setCursors] = useState<string[]>([""]);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [actionUser, setActionUser] = useState<ManagedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const cursor = cursors[page] || "";
  const readPath = `/users?${new URLSearchParams({ limit: "25", search, cursor })}`;

  useEffect(() => {
    if (query.trim() === search) return;
    const timer = window.setTimeout(() => {
      setSearch(query.trim());
      setPage(0);
      setCursors([""]);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setResult(null);
    if (!cursor) setTotal(null);
    setSelected([]);
    void adminApi<UserPage>(readPath, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          setResult(data);
          if (data.total !== null) setTotal(data.total);
        }
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
  }, [readPath, revision, retry, onAccessError]);

  const people = useMemo(() => {
    const filtered = (result?.users || []).filter(
      (person) =>
        (status === "All users" || person.status === status) &&
        (role === "All roles" || person.roles.includes(role)),
    );
    return filtered.sort((a, b) => {
      if (sortBy === "name")
        return (descending ? -1 : 1) * a.name.localeCompare(b.name);
      const aCreated = a.createdAt ? Date.parse(a.createdAt) : NaN;
      const bCreated = b.createdAt ? Date.parse(b.createdAt) : NaN;
      if (Number.isNaN(aCreated)) return Number.isNaN(bCreated) ? 0 : 1;
      if (Number.isNaN(bCreated)) return -1;
      return (descending ? -1 : 1) * (aCreated - bCreated);
    });
  }, [result, status, role, sortBy, descending]);
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
            <h2>Accounts</h2>
            {total !== null && (
              <span className="total-badge">{formatNumber(total)}</span>
            )}
          </div>
          <p>
            Email search covers all profiles. Filters and sorting apply to
            this page.
          </p>
        </div>
        <button
          className="button button-secondary export-button"
          disabled={waiting || !people.length}
          onClick={() => {
            downloadCsv([
              [
                "Name",
                "Email",
                "Roles",
                "Apps signed in to",
                "Country",
                "Gender",
                "Status",
                "Joined",
              ],
              ...people.map((person) => [
                person.name,
                person.email,
                person.roles.join(", "),
                (person.apps || [])
                  .map((app) => `${app.name}${app.enabled ? "" : " (revoked)"}`)
                  .join(", "),
                countryLabel(person.country || null),
                person.gender || "Not specified",
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
            onClick={async () => {
              await invalidateAdminReads(readPath);
              setRetry((value) => value + 1);
            }}
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
          Loading accounts…
        </p>
      ) : !error || result ? (
        <UsersTable
          people={people}
          selected={selected}
          busy={waiting}
          currentUid={currentUid}
          sortBy={sortBy}
          descending={descending}
          onToggleUser={toggleUser}
          onToggleAll={toggleAll}
          onSort={(field) => {
            if (sortBy === field) {
              setDescending((value) => !value);
            } else {
              setSortBy(field);
              setDescending(field === "createdAt");
            }
          }}
          onAction={setActionUser}
        />
      ) : null}
      <div className="table-footer">
        <span>
          Page {page + 1} · {people.length} shown ·{" "}
          {total !== null
            ? `${formatNumber(total)} matching profiles`
            : result?.nextCursor
              ? "More profiles available"
              : result
                ? "End of results"
                : "—"}
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
