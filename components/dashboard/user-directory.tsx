"use client";

import { useMemo, useState } from "react";
import { initialPeople } from "./people";
import { UsersTable } from "./users-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ListFilter,
  Search,
  SlidersHorizontal,
} from "lucide-react";

export function UserDirectory({
  notify,
}: {
  notify: (message: string) => void;
}) {
  const [people, setPeople] = useState(initialPeople);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All users");
  const [selected, setSelected] = useState<string[]>([]);
  const filtered = useMemo(
    () =>
      people.filter(
        (p) =>
          `${p.name} ${p.email} ${p.role}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (status === "All users" || p.status === status),
      ),
    [people, query, status],
  );
  const csv = () => {
    const rows = [
      ["Name", "Email", "Role", "Status", "Joined"],
      ...filtered.map((p) => [p.name, p.email, p.role, p.status, p.joined]),
    ];
    const blob = new Blob(
      [rows.map((row) => row.map((c) => `"${c}"`).join(",")).join("\n")],
      { type: "text/csv" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("Your user export is ready");
  };

  const toggleUser = (name: string) =>
    setSelected((current) =>
      current.includes(name)
        ? current.filter((s) => s !== name)
        : [...current, name],
    );
  const toggleAll = () =>
    setSelected(
      selected.length === filtered.length ? [] : filtered.map((p) => p.name),
    );

  return (
    <section className="panel directory-card">
      <div className="directory-heading">
        <div>
          <div className="title-with-badge">
            <h2>Recent users</h2>
            <span className="total-badge">2,420</span>
          </div>
          <p>A list of users who recently joined your workspace.</p>
        </div>
        <button className="button button-secondary export-button" onClick={csv}>
          <Download size={15} />
          Export
        </button>
      </div>
      <div className="table-toolbar">
        <label className="table-search">
          <Search size={16} />
          <input
            aria-label="Search users"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd>⌘ K</kbd>
        </label>
        <div className="toolbar-right">
          <label className="filter-select">
            <ListFilter size={15} />
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>All users</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Suspended</option>
            </select>
            <ChevronDown size={14} />
          </label>
          <button
            className="button button-secondary filter-button"
            onClick={() => notify("All filters are up to date")}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
          </button>
        </div>
      </div>
      {selected.length > 0 && (
        <div className="bulk-bar">
          <span>{selected.length} users selected</span>
          <button
            onClick={() => {
              setPeople((current) =>
                current.map((p) =>
                  selected.includes(p.name) ? { ...p, status: "Active" } : p,
                ),
              );
              setSelected([]);
              notify("Selected users activated");
            }}
          >
            Activate
          </button>
          <button
            onClick={() => {
              setPeople((current) =>
                current.map((p) =>
                  selected.includes(p.name)
                    ? {
                        ...p,
                        status: "Suspended",
                      }
                    : p,
                ),
              );
              setSelected([]);
              notify("Selected users suspended");
            }}
          >
            Suspend
          </button>
          <button onClick={() => setSelected([])}>Clear selection</button>
        </div>
      )}
      <UsersTable
        people={filtered}
        selected={selected}
        onToggleUser={toggleUser}
        onToggleAll={toggleAll}
        onSort={() => setPeople((current) => [...current].reverse())}
        notify={notify}
      />
      <div className="table-footer">
        <span>
          Showing{" "}
          <b>
            {filtered.length ? 1 : 0}–{filtered.length}
          </b>{" "}
          of <b>{filtered.length}</b> users
        </span>
        <div className="pagination">
          <button
            className="page-button"
            aria-label="Previous page"
            onClick={() => notify("You’re on the first page")}
          >
            <ChevronLeft size={15} />
            <span>Previous</span>
          </button>
          <button className="page-number active-page">1</button>
          <button
            className="page-number"
            onClick={() => notify("Page 2 is ready")}
          >
            2
          </button>
          <button
            className="page-number"
            onClick={() => notify("Page 3 is ready")}
          >
            3
          </button>
          <span className="page-ellipsis">...</span>
          <button
            className="page-number"
            onClick={() => notify("Last page is ready")}
          >
            12
          </button>
          <button
            className="page-button"
            onClick={() => notify("Next page is ready")}
          >
            <span>Next</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
