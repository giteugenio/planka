# Codebase Concerns

## Tech Debt

- **String-based error throwing** instead of Error objects — explicitly disabled in ESLint config (`server/.eslintrc.js`). Affects error handling and stack trace quality.
- **Missing error handlers in client saga initialization** — bootstrap errors not caught, leaving app in invalid state.
- **Card update helper is overly large** (`server/api/helpers/cards/update-one.js`, ~428 lines) with TODO comments indicating incomplete refactoring.
- **Hardcoded configuration values** scattered throughout server code instead of centralized config.
- **Race condition prevention** using fork/take patterns instead of proper redux-saga `race()` effects in client sagas.
- **Large model files** (`server/api/models/`) some exceeding 500-800 lines mixing concerns.
- **Moment.js and date-fns both present** — inconsistent date handling; moment.js is in maintenance mode.

## Known Issues / Bugs

- **Popup closing relies on `document.body.click()` hack** — fragile DOM interaction in client.
- **Multiple TODO comments** indicating incomplete implementation scattered through codebase.
- **Bootstrap initialization errors not handled** — app can end up in invalid state silently.

## Security Risks

- **OIDC client base URL hardcoded for localhost** in dev config — risk of leaking into prod misconfiguration.
- **Debug OIDC endpoint exists** (`access-tokens/debug-oidc`) — gated by `OIDC_DEBUG` env var and returns 403 when disabled; risk if accidentally enabled in production.
- **String error throwing could leak implementation details** to clients.
- **No API key rate limiting differentiation** — all API keys treated equally.
- **File uploads** — error handling during image processing silently skips failures during migration.

## Performance Bottlenecks

- **Synchronous loops with `await`** in database upgrade script — marked with `eslint-disable` comment, blocks event loop.
- **Uncontrolled concurrency** in Trello import using `Promise.all()` — can overwhelm DB on large boards.
- **Database migrations process all data without pagination** — memory-intensive on large datasets.
- **N+1 query patterns** possible in card/list queries — not all associations eagerly loaded.
- **Redux ORM normalization cost** — large board state can cause performance degradation on the client.

## Fragile Areas

- **Card duplication logic** (`server/api/helpers/cards/duplicate-one.js`, ~364 lines) — tight coupling, many DB operations, hard to test.
- **List archive/trash state management** — unclear context switching between active/archived/trashed states.
- **Database upgrade paths** — complex migration logic with no test coverage (critical risk on upgrades).
- **Concurrent card modifications** — race conditions when multiple users edit the same card not fully addressed.

## Scaling Limits

- **WebSocket concurrency** not explicitly configured — socket.io defaults may be insufficient under load.
- **File attachment storage** — local disk storage unbounded; S3 adapter available but not default.
- **Database connection pool** — Sails.js defaults may not be tuned for high concurrency.
- **No audit log** — no built-in event history/audit trail for compliance use cases.

## Dependencies at Risk

| Package | Risk |
|---------|------|
| `redux-orm@0.16.2` | Patched via patch-package; minimal maintenance |
| `react-beautiful-dnd` | Deprecated; should migrate to dnd-kit |
| `moment.js` | In maintenance mode; date-fns also present |
| `openid-client` | Debug endpoint must stay disabled in prod (`OIDC_DEBUG`) |
| `sails` | Framework has declining community momentum |

## Test Coverage Gaps

- **Database upgrade paths** — no tests for migration scripts (CRITICAL)
- **Client saga error boundaries** — error cases in async flows untested
- **Card duplication edge cases** — complex logic with minimal test coverage
- **File manager S3 operations** — untested
- **Concurrent modification race conditions** — no tests for simultaneous edits
- **OIDC edge cases** — token refresh, expiry, error flows not covered
