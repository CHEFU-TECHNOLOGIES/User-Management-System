"use client";

import type { Person } from "./people";
import { Check, ChevronsUpDown, MoreHorizontal } from "lucide-react";

type UsersTableProps = {
  people: Person[];
  selected: string[];
  onToggleUser: (name: string) => void;
  onToggleAll: () => void;
  onSort: () => void;
  notify: (message: string) => void;
};

export function UsersTable({
  people: filtered,
  selected,
  onToggleUser: toggleUser,
  onToggleAll: toggleAll,
  onSort,
  notify,
}: UsersTableProps) {
  return (
    <div className="table-scroll">
      <table className="users-table">
        <thead>
          <tr>
            <th className="check-col">
              <input
                aria-label="Select all users"
                type="checkbox"
                checked={
                  filtered.length > 0 && selected.length === filtered.length
                }
                onChange={toggleAll}
              />
            </th>
            <th>
              <button onClick={onSort}>
                Name <ChevronsUpDown size={13} />
              </button>
            </th>
            <th>Role</th>
            <th>Status</th>
            <th>Verification</th>
            <th>
              Joined <ChevronsUpDown size={13} />
            </th>
            <th className="row-action-col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((person) => (
            <tr key={person.email}>
              <td className="check-col">
                <input
                  aria-label={`Select ${person.name}`}
                  type="checkbox"
                  checked={selected.includes(person.name)}
                  onChange={() => toggleUser(person.name)}
                />
              </td>
              <td>
                <div className="person-cell">
                  <div className={`avatar avatar-${person.color}`}>
                    {person.initials}
                  </div>
                  <div className="person-copy">
                    <b>{person.name}</b>
                    <span>{person.email}</span>
                  </div>
                </div>
              </td>
              <td>
                <span className="role-label">{person.role}</span>
              </td>
              <td>
                <StatusPill status={person.status} />
              </td>
              <td>
                {person.verified ? (
                  <span className="verified">
                    <Check size={13} />
                    Verified
                  </span>
                ) : (
                  <span className="unverified">
                    <span />
                    Unverified
                  </span>
                )}
              </td>
              <td className="date-cell">{person.joined}</td>
              <td>
                <button
                  className="row-menu"
                  aria-label={`Actions for ${person.name}`}
                  onClick={() => notify(`Actions for ${person.name}`)}
                >
                  <MoreHorizontal size={17} />
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="empty-state">
                No users match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`status-pill status-${status.toLowerCase()}`}>
      <i />
      {status}
    </span>
  );
}
