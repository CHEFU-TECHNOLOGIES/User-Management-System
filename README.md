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
`https://myaccount.chefu.co.za`. CheFu Account currently allows the admin app to
return to `https://internal.chefu.co.za`; configure its redirect policy and the
backend CORS allowlist if deploying this console on a different host.

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

## Validation

- `npm test`
- `npm run build` (includes TypeScript validation)
- Backend: `npm run test:user-management`, `npm run typecheck`, `npm run build`.
