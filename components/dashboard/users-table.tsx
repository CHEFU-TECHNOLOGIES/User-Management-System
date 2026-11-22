"use client";

import { Check, ChevronsUpDown, MoreHorizontal } from "lucide-react";
import { formatDate, initials, type ManagedUser } from "@/lib/admin-api";

type UsersTableProps = {
  people: ManagedUser[];
  selected: string[];
  busy: boolean;
  currentUid: string;
  onToggleUser: (uid: string) => void;
  onToggleAll: () => void;
  onSort: () => void;
  onAction: (user: ManagedUser) => void;
};
export function UsersTable({
  people,
  selected,
  busy,
  currentUid,
  onToggleUser,
  onToggleAll,
  onSort,
  onAction,
}: UsersTableProps) {
  const selectable = people.filter(
    (user) => user.uid && user.uid !== currentUid,
  );
  return (
    <div className="table-scroll">
      <table className="users-table">
        <thead>
          <tr>
            <th className="check-col">
              <input
                aria-label="Select all users on this page"
                type="checkbox"
                disabled={busy || !selectable.length}
                checked={
                  selectable.length > 0 &&
                  selectable.every((user) => selected.includes(user.uid!))
                }
                onChange={onToggleAll}
              />
            </th>
            <th>
              <button onClick={onSort}>
                Name <ChevronsUpDown size={13} />
              </button>
            </th>
            <th>Roles</th>
            <th>Status</th>
            <th>Verification</th>
            <th>Joined</th>
            <th className="row-action-col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person.email}>
              <td className="check-col">
                <input
                  aria-label={`Select ${person.name}`}
                  type="checkbox"
                  disabled={busy || !person.uid || person.uid === currentUid}
                  checked={!!person.uid && selected.includes(person.uid)}
                  onChange={() => person.uid && onToggleUser(person.uid)}
                />
              </td>
              <td>
                <div className="person-cell">
                  <div className="avatar avatar-lavender">
                    {initials(person.name)}
                  </div>
                  <div className="person-copy">
                    <b>{person.name}</b>
                    <span>{person.email}</span>
                  </div>
                </div>
              </td>
              <td>
                <span className="role-label">
                  {person.roles.join(", ") || "user"}
                </span>
              </td>
              <td>
                <span
                  className={`status-pill status-${person.status.toLowerCase()}`}
                >
                  <i />
                  {person.status}
                </span>
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
              <td className="date-cell">{formatDate(person.createdAt)}</td>
              <td>
                <button
                  className="row-menu"
                  disabled={busy || !person.uid}
                  aria-label={`Manage ${person.name}`}
                  onClick={() => onAction(person)}
                >
                  <MoreHorizontal size={17} />
                </button>
              </td>
            </tr>
          ))}
          {people.length === 0 && (
            <tr>
              <td colSpan={7} className="empty-state">
                No users match this view.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
