# CheFu User Management

Administrator console for the shared CheFu account backend. It uses CheFu Account
sign-in and the existing shared session cookie; no credentials are stored in this
application. An account needs the central `admin` role to access the console.

## Run locally

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and configure the API and Account app URLs.
3. Run `npm run dev`.

For an entirely local setup, run `chefu-inc-backend` on port 4000, `CheFu-Account`
on port 3001, and this console on port 3000. Add the frontend origins to the
backend's `FRONTEND_ORIGINS` and use local cookie settings. Sign in through the
local Account app: production-domain cookies are not sent to localhost.

Production defaults use `https://api.chefu.co.za` and
`https://myaccount.chefu.co.za`. The backend and CheFu Account allow the admin app
at `https://admin.chefu.co.za` and retain `https://internal.chefu.co.za`.
Deploy both services' allowlist updates when enabling the new host.

## Backend contract

Deploy the new `user-management` module in `chefu-inc-backend` before using this
console against that API. Its `/admin/user-management` routes provide session
identity, aggregate statistics, account pages, account-status/role changes, and
audit history. Requests use `credentials: include` and `x-chefu-app: admin`.

Total accounts count central profiles. Active accounts signed in within the last
30 days. New accounts were created within the last 30 days. Registration charts
use UTC intervals and real `createdAt` timestamps. Missing historical timestamps
cannot contribute to date-based statistics.

Email-prefix search and cursor pagination run on the server. Status and role
filters and name sorting apply to the current page. Export downloads the visible
page. Account actions persist to Firebase; enabling an account does not verify
email. Roles and suspension revoke existing sessions. Your own access cannot be
changed from this console. Other product roles are retained.

The user table and account details show apps from the central profile, including
first/last activity and revoked access. App names are included in CSV exports.
Updated user-page cache keys load the new response shape once.
Gender is shown in the table, account details, and exports using the saved
profile value. Missing values display as `Not specified`.
Country is shown in the table, account details, and CSV. Saved country takes
precedence; detected-country fallbacks are labeled, and missing data shows Unknown.

## Client caching

Successful page reads are persisted in IndexedDB under the verified administrator
UID. Each reopened app validates the server session once before reading that
account's cache. Session responses and failed requests are never persisted.
Concurrent requests are shared in memory for the current tab.
Navigating between pages, revisiting searches or pages, switching back to a cached
chart range, and refocusing the tab reuse existing data. There are no background
refresh timers or automatic retries. A first visit to uncached data still loads it.

Refresh clears the read cache and reloads the visible data. Account mutations
invalidate users, statistics, and audit data, then reload the current view; the
session read is retained. Retry explicitly reloads a failed request. Sign-in,
sign-out, opening CheFu Account, and server access-denied responses clear the
account's persistent cache before navigation. Other open tabs receive cache
invalidation and sign-out messages. A full browser reload validates the session
but retains page data; the dashboard Refresh button deliberately clears that
data and reloads it. Storage restrictions fall back to memory caching. The API
continues to authorize every server request independently.

## Validation

- `npm test`
- `npm run build` (includes TypeScript validation)
- Backend: `npm run test:user-management`, `npm run typecheck`, `npm run build`.
