import { ReadCache } from "./read-cache";

export type AdminAccount = {
  uid: string;
  email: string;
  name: string;
  roles: string[];
};
export type ManagedUser = {
  uid: string | null;
  email: string;
  name: string;
  roles: string[];
  status: "Active" | "Pending" | "Suspended" | "Unavailable";
  verified: boolean;
  createdAt: string | null;
  lastLoginAt: string | null;
};
export type UserPage = {
  users: ManagedUser[];
  nextCursor: string | null;
  total: number;
};
export type Summary = {
  total: number;
  active: number;
  newUsers: number;
  admins: number;
  days: number;
  growth: { date: string; count: number }[];
  roles: { label: string; count: number }[];
  generatedAt: string;
};
export type AuditEvent = {
  id: string;
  actor: string;
  target: string;
  createdAt: string | null;
  outcome: string;
  change: { role?: string; disabled?: boolean };
};
export type AuditPage = { events: AuditEvent[]; nextCursor: string | null };

const base = "https://api.chefu.co.za".replace(/\/$/, "");
export const accountBase = "https://myaccount.chefu.co.za".replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const reads = new ReadCache();

export function invalidateAdminReads(path?: string) {
  reads.invalidate(path ? (key) => key === path : undefined);
}

export function invalidateAdminData() {
  reads.invalidate((key) => key !== "/session");
}

export async function adminApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  if (method === "GET") {
    return reads.read(
      path,
      (signal) => requestAdmin<T>(path, { ...init, signal }),
      init.signal || undefined,
    );
  }
  try {
    return await requestAdmin<T>(path, init);
  } finally {
    // Even failed mutations can partially apply server changes.
    invalidateAdminData();
  }
}

async function requestAdmin<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${base}/admin/user-management${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      "x-chefu-app": "admin",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403)
      invalidateAdminReads();
    const data = await response.json().catch(() => ({}));
    const message = Array.isArray(data.message)
      ? data.message.join(" ")
      : data.message || data.error;
    throw new ApiError(
      response.status,
      message || `The server returned ${response.status}.`,
    );
  }
  return response.json() as Promise<T>;
}
export function accountUrl(path: "/login" | "/logout" | "/account") {
  invalidateAdminReads();
  const params = new URLSearchParams({
    app: "admin",
    returnTo: window.location.origin + "/",
  });
  return `${accountBase}${path}?${params}`;
}
export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unable to reach the CheFu API. Please try again.";
}
export function isAccessError(error: unknown): error is ApiError {
  return error instanceof ApiError && [401, 403].includes(error.status);
}
export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-ZA").format(value);
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
export function formatDate(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown";
}
