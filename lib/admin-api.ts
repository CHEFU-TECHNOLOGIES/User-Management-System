import { ReadCache } from "./read-cache";
import { AccountCache } from "./account-cache";
import { IndexedDbCache } from "./persistent-cache";
import { publishCacheEvent, subscribeCacheEvents } from "./cache-events";

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
  apps: {
    id: string;
    name: string;
    enabled: boolean;
    firstSeenAt: string | null;
    lastSeenAt: string | null;
  }[];
  country: {
    code: string | null;
    name: string;
    source: "profile" | "detected";
  } | null;
  gender: string | null;
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
const dataCache = new AccountCache(new IndexedDbCache());
let sessionRevision = 0;

function cachePath(path: string) {
  const url = new URL(path, "https://cache.local");
  if (url.searchParams.has("search"))
    url.searchParams.set(
      "search",
      url.searchParams.get("search")!.trim().toLowerCase(),
    );
  url.searchParams.sort();
  // Fetch the updated profile response once instead of reusing older pages.
  return `${url.pathname === "/users" ? "v4:" : ""}${url.pathname}${url.search}`;
}

subscribeCacheEvents((event) => {
  if (event.kind === "session") {
    sessionRevision++;
    reads.invalidate();
    dataCache.forget();
    if (typeof window !== "undefined")
      window.dispatchEvent(new Event("chefu-admin-session-cleared"));
  } else if (event.account === dataCache.identity)
    dataCache.dropMemory(event.path);
});

export async function invalidateAdminReads(path?: string) {
  if (path) {
    const key = cachePath(path);
    await dataCache.invalidate(key);
    publishCacheEvent({ kind: "data", account: dataCache.identity, path: key });
  } else {
    sessionRevision++;
    reads.invalidate();
    await dataCache.invalidate();
    publishCacheEvent({ kind: "data", account: dataCache.identity });
  }
}

async function invalidateAdminData() {
  await dataCache.invalidate();
  publishCacheEvent({ kind: "data", account: dataCache.identity });
}

async function clearAccountCache() {
  const account = dataCache.identity;
  sessionRevision++;
  reads.invalidate();
  await dataCache.clear();
  publishCacheEvent({ kind: "session", account });
}

async function session(signal?: AbortSignal) {
  return reads.read(
    "/session",
    async (requestSignal) => {
      const revision = sessionRevision;
      const account = await requestAdmin<AdminAccount>("/session", {
        signal: requestSignal,
      });
      requestSignal.throwIfAborted();
      if (revision !== sessionRevision)
        throw new DOMException("Session changed.", "AbortError");
      if (!account.uid || typeof account.uid !== "string")
        throw new Error("The server returned an invalid account identity.");
      dataCache.activate(account.uid);
      return account;
    },
    signal,
  );
}

export async function adminApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  if (method === "GET" && path === "/session")
    return session(init.signal || undefined) as Promise<T>;
  await session(init.signal || undefined);
  if (method === "GET") {
    const key = cachePath(path);
    return dataCache.read(
      key,
      (signal) => requestAdmin<T>(path, { ...init, signal }),
      init.signal || undefined,
    );
  }
  try {
    return await requestAdmin<T>(path, init);
  } finally {
    // Even failed mutations can partially apply server changes.
    await invalidateAdminData();
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
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403)
      await clearAccountCache();
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
  const params = new URLSearchParams({
    app: "admin",
    returnTo: window.location.origin + "/",
  });
  return `${accountBase}${path}?${params}`;
}
export async function openAccount(path: "/login" | "/logout" | "/account") {
  // Complete persistent deletion before leaving this document.
  await clearAccountCache();
  window.location.assign(accountUrl(path));
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
