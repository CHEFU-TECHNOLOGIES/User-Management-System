"use client";

import { useEffect, useState } from "react";
import {
  adminApi,
  errorMessage,
  type AuditEvent,
  type AuditPage,
} from "@/lib/admin-api";

export function AuditLog({
  revision,
  onAccessError,
}: {
  revision: number;
  onAccessError: (error: unknown) => void;
}) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [cursor, setCursor] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    setEvents([]);
    setCursor("");
    setNextCursor(null);
  }, [revision]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    void adminApi<AuditPage>(`/audit?${new URLSearchParams({ cursor })}`, {
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;
        setEvents((current) =>
          cursor
            ? [
                ...new Map(
                  [...current, ...result.events].map((event) => [
                    event.id,
                    event,
                  ]),
                ).values(),
              ]
            : result.events,
        );
        setNextCursor(result.nextCursor);
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
  }, [cursor, revision, retry, onAccessError]);
  return (
    <section className="panel audit-panel">
      <div className="panel-heading">
        <div>
          <h2>Account management audit</h2>
          <p>Role and account-status changes made through this console.</p>
        </div>
      </div>
      {error && (
        <p role="alert" className="inline-error">
          {error}{" "}
          <button onClick={() => setRetry((value) => value + 1)}>Retry</button>
        </p>
      )}
      <div className="table-scroll">
        <table className="users-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Administrator</th>
              <th>Account</th>
              <th>Change</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>
                  {event.createdAt
                    ? new Date(event.createdAt).toLocaleString("en-ZA")
                    : "Pending"}
                </td>
                <td>{event.actor}</td>
                <td>{event.target}</td>
                <td>
                  {[
                    event.change.role && `Role: ${event.change.role}`,
                    event.change.disabled !== undefined &&
                      (event.change.disabled
                        ? "Suspend account"
                        : "Enable account"),
                  ]
                    .filter(Boolean)
                    .join("; ")}
                </td>
                <td>{event.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && (
        <p className="empty-state" role="status">
          Loading audit history…
        </p>
      )}
      {!loading && !events.length && !error && (
        <p className="empty-state">No account changes have been recorded.</p>
      )}
      {nextCursor && (
        <button
          className="button button-secondary"
          disabled={loading}
          onClick={() => setCursor(nextCursor)}
        >
          Load more
        </button>
      )}
    </section>
  );
}
