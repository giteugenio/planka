# Structure

## Top-Level Layout

```
planka/
├── server/                 # Sails.js backend
├── client/                 # React frontend
├── assets/                 # Static assets (logos, etc.)
├── charts/                 # Helm charts for Kubernetes deployment
├── .github/                # CI/CD workflows
├── .husky/                 # Git hooks (pre-commit via lint-staged)
├── docker-compose.yml      # Production docker-compose
├── docker-compose-dev.yml  # Development docker-compose
├── Dockerfile              # Production image
├── Dockerfile.dev          # Development image
└── package.json            # Root-level scripts
```

---

## Server Directory

```
server/
├── api/
│   ├── controllers/        # HTTP request handlers (thin, delegate to helpers)
│   │   └── {domain}/       # Per-domain (cards/, projects/, users/, webhooks/, ...)
│   ├── helpers/            # Business logic and DB operations
│   │   └── {domain}/       # Per-domain (cards/update-one.js, users/present-many.js, ...)
│   ├── hooks/              # Sails lifecycle hooks
│   │   ├── current-user/    # Attach currentUser to req
│   │   ├── file-manager/   # Local + S3 file managers
│   │   ├── oidc/           # OIDC client initialization
│   │   ├── query-methods/  # Adds .qm helpers to models
│   │   ├── s3/             # S3 client setup
│   │   ├── terms/          # Terms of use
│   │   └── watcher/        # DB/IO watchers
│   ├── models/             # Waterline ORM schemas + associations (32 models)
│   ├── policies/           # Global auth/authz middleware
│   └── responses/          # Custom response types (conflict, forbidden, notFound, ...)
├── config/
│   ├── env/                # Environment-specific config (production.js, etc.)
│   ├── locales/            # Server-side i18n strings
│   ├── routes.js           # API route definitions
│   ├── policies.js         # Controller→policy mappings
│   ├── datastores.js       # DB connection config
│   └── ...                 # Other Sails config files
├── db/
│   ├── migrations/         # Knex database migrations (19 migrations)
│   ├── seeds/              # Seed data (default.js)
│   ├── create-admin-user.js
│   ├── init.js
│   └── upgrade.js          # DB upgrade script
├── data/                   # Runtime data (uploads, etc.)
├── patches/                # patch-package patches (sails, skipper-disk, waterline)
├── public/                 # Static files served by Sails
├── test/
│   ├── fixtures/           # Test data (currently empty)
│   ├── integration/
│   │   ├── controllers/     # Controller-level tests
│   │   ├── helpers/        # Helper-level tests
│   │   └── models/         # Model-level tests
│   ├── utils/              # Utility function unit tests
│   ├── lifecycle.test.js   # Global Sails app setup/teardown
│   └── mocha.opts
├── utils/                  # Shared server utilities
├── views/                  # Server-side view templates (minimal)
├── app.js                  # Server entry point
└── terms/                  # Terms/legal text
```

### Key Server Files

| File | Purpose |
|------|---------|
| `server/app.js` | Entry point |
| `server/config/routes.js` | All API routes |
| `server/config/policies.js` | Controller→policy mappings |
| `server/config/datastores.js` | DB connection |
| `server/api/helpers/cards/update-one.js` | Card update logic (~428 lines) |
| `server/api/helpers/cards/duplicate-one.js` | Card duplication (~364 lines) |
| `server/db/migrations/` | Schema migrations (Knex) |
| `server/db/upgrade.js` | DB upgrade script |

---

## Client Directory

```
client/
├── src/
│   ├── actions/            # Redux action creators
│   ├── api/                # HTTP (`http.js`, fetch) + socket (`socket.js`) clients
│   ├── assets/             # Images, icons bundled with app
│   ├── components/         # React components (organized by feature)
│   ├── configs/            # Client-side configuration constants
│   ├── constants/          # Shared constants (action types, etc.)
│   ├── contexts/           # React contexts
│   ├── entry-actions/      # User-initiated action coordinators
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Third-party lib wrappers (custom-ui, popup, redux-router, ...)
│   ├── locales/            # i18n translation files (25+ languages)
│   ├── models/             # Redux-ORM model definitions
│   ├── reducers/           # Redux reducers
│   ├── sagas/              # Redux-saga async logic
│   ├── selectors/          # Memoized state selectors
│   ├── utils/              # Pure utility functions
│   ├── history.js          # Browser history instance
│   ├── i18n.js             # i18n setup
│   ├── index.js            # App entry point
│   ├── orm.js              # Redux-ORM setup
│   ├── store.js            # Redux store configuration
│   ├── styles.module.scss  # Global styles
│   └── version.js         # Generated version string (via genversion)
├── tests/
│   └── acceptance/         # Cucumber + Playwright E2E tests
├── patches/                # patch-package patches (redux-orm, sails.io.js, ...)
└── public/                 # Static public assets
```

### Key Client Files

| File | Purpose |
|------|---------|
| `client/src/index.js` | App bootstrap |
| `client/src/store.js` | Redux store setup |
| `client/src/orm.js` | Redux-ORM initialization |
| `client/src/sagas/` | All async side effects |
| `client/src/components/` | All UI (organized by feature) |

---

## Naming Conventions

### Server

| Type | Convention | Example |
|------|-----------|---------|
| Controllers | kebab-case dirs + verb files | `controllers/cards/update.js`, `controllers/users/create.js` |
| Models | PascalCase singular | `Card.js`, `User.js`, `TaskList.js` |
| Helpers | kebab-case dirs + verb files | `helpers/cards/update-one.js`, `helpers/users/present-many.js` |
| Policies | kebab-case | `is-authenticated.js`, `is-admin-or-project-owner.js` |
| Config files | camelCase | `datastores.js`, `routes.js` |

### Client

| Type | Convention | Example |
|------|-----------|---------|
| Components | kebab-case domain dirs → PascalCase dir + matching `.jsx` + `index.js` barrel | `components/cards/Card/Card.jsx`, `components/cards/Card/index.js` |
| Actions | camelCase, verb phrases | `createCard`, `updateCard` |
| Sagas | camelCase | `watchCreateCard`, `handleCreateCard` |
| Selectors | camelCase, noun phrases | `selectCardById`, `makeSelectBoard` |
| Constants | SCREAMING_SNAKE_CASE | `CREATE_CARD`, `UPDATE_LIST` |
| Hooks | camelCase, `use` prefix | `useBoard`, `useCard` |

---

## Where to Add New Features

| Feature type | Location |
|-------------|---------|
| New API endpoint | `server/config/routes.js` + new controller in `server/api/controllers/{domain}/` + policy mapping in `server/config/policies.js` |
| Business logic | New helper in `server/api/helpers/{domain}/` |
| New DB model | `server/api/models/` + migration in `server/db/migrations/` |
| New UI component | `client/src/components/{domain}/{FeatureName}/` |
| New async flow | `client/src/sagas/` + entry action in `client/src/entry-actions/` |
| New state shape | `client/src/models/` (Redux-ORM) + reducer + selector |
| i18n strings | `client/src/locales/` (all language files) |
