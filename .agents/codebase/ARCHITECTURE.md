# Architecture

## Pattern

**Client-Server MVC with Real-Time WebSocket Communication**

Planka is a Trello-like project management tool. The backend is a **Sails.js** REST API with WebSocket support. The frontend is a **React + Redux** SPA with normalized state via Redux-ORM.

---

## Layers

### Server (Sails.js)

```
Request → Policy (auth/authz) → Controller → Helper → Model → DB
                                     ↓
                              Response / WebSocket broadcast
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Policies** | `server/api/policies/` | Global middleware: `is-authenticated`, `is-admin`, `is-admin-or-project-owner`, `is-external`, `is-internal`, `is-session` |
| **Controllers** | `server/api/controllers/` | HTTP handlers — thin, delegate to helpers |
| **Helpers** | `server/api/helpers/` | Business logic, DB operations, side effects |
| **Models** | `server/api/models/` | Waterline ORM schemas, associations, instance methods |
| **Responses** | `server/api/responses/` | Custom response types (e.g. `res.notFound()`) |
| **Hooks** | `server/api/hooks/` | Sails lifecycle hooks (startup tasks) |

### Client (React + Redux)

```
UI Event → Entry Action → Saga → API call → Action → Reducer → Redux-ORM → Selector → Component
                                     ↓
                              WebSocket event → Action → Reducer
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Components** | `client/src/components/` | React UI components |
| **Entry Actions** | `client/src/entry-actions/` | User-initiated action creators (thunk-like) |
| **Actions** | `client/src/actions/` | Pure Redux action creators |
| **Sagas** | `client/src/sagas/` | Async side effects (API calls, WebSocket) |
| **Reducers** | `client/src/reducers/` | State updates |
| **Models** | `client/src/models/` | Redux-ORM model definitions |
| **Selectors** | `client/src/selectors/` | Derived state with memoization |
| **API** | `client/src/api/` | HTTP client wrappers over native `fetch` (`http.js`) + sails.io socket client (`socket.js`) |

---

## Data Flow

### Board Loading
1. User navigates to board → entry action dispatched
2. Saga calls `client/src/api/` HTTP client
3. Server: Policy checks auth → Controller calls Helper → Helper queries Models
4. Response normalized by Redux-ORM reducer
5. Selectors compute derived data → components re-render

### Real-Time Updates
1. Other user performs action → server broadcasts via `sails.sockets`
2. Client WebSocket saga receives event → dispatches action
3. Redux-ORM reducer updates normalized store
4. Affected components re-render via selectors

### Card Update Example
```
User edits card title
→ entry-actions/cards.js dispatch
→ sagas/cards.js handles with takeLatest
→ api/cards.js PATCH /api/cards/:id (via fetch)
→ server: PoliciesController → helpers/cards/update-one.js (~428 lines)
→ Model.update() → socket broadcast to board room
→ client reducer updates ORM → component re-renders
```

---

## Key Abstractions

### Server
- **Query Methods** — model static methods under `*.qm` for complex queries (`User.qm.getOneActiveByEmailOrUsername()`, `BoardMembership.qm.getOneByBoardIdAndUserId()`); provided by the `query-methods` hook
- **Helpers** — reusable business logic, organized per-domain (`helpers/cards/`, `helpers/users/`, ...); called from controllers
- **Scoper** — controls which socket rooms receive broadcasts
- **Presenters** — format model data for API responses (`helpers/{domain}/present-one.js` + `present-many.js`, e.g. `helpers/users/present-many.js`)

### Client
- **Redux-ORM** — normalized relational state (cards, lists, boards, users as related tables)
- **Entry Actions** — the "entry point" for user interactions, coordinate action dispatching
- **Sagas** — handle all async logic (API, sockets, delays, retries)

---

## Entry Points

| Entry | File |
|-------|------|
| Server start | `server/app.js` |
| Client bootstrap | `client/src/index.js` |
| API routes | `server/config/routes.js` |
| Redux store | `client/src/store.js` |
| ORM setup | `client/src/orm.js` |

---

## Error Handling

- **Server**: String throws (ESLint rule disabled), custom response handlers in `server/api/responses/`
- **Client**: Saga `try/catch`, limited error boundary usage; bootstrap errors not always caught
- **HTTP errors**: Mapped to custom Sails response types (`res.badRequest()`, `res.forbidden()`, etc.)

---

## Cross-Cutting Concerns

- **Authentication**: JWT-based, enforced via `is-authenticated` policy (plus `is-external` for non-internal flows)
- **Authorization**: Global role checks via policies (`is-admin`, `is-admin-or-project-owner`); per-resource authorization performed **in controllers/helpers** (role check → `isProjectManager` helper → `BoardMembership.qm` lookup), throwing a "not found" to avoid leaking existence
- **Real-time**: socket.io via Sails.js built-in WebSocket support
- **Logging**: Sails.js built-in logger (Winston) on server; console on client
- **i18n**: `client/src/locales/` (client, 25+ languages), `server/config/locales/` (server)
