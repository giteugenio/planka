# External Integrations

**Analysis Date:** 2026-08-06

## APIs & External Services

**OpenID Connect (OIDC):**
- OIDC Provider integration for enterprise authentication
  - SDK/Client: openid-client 5.7.1
  - Config location: `server/config/custom.js` (lines 78-102)
  - Hook: `server/api/hooks/oidc/index.js`
  - Core env vars: `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_TIMEOUT`
  - Callback behavior: `OIDC_USE_OAUTH_CALLBACK`, `OIDC_RESPONSE_MODE`, `OIDC_USE_DEFAULT_RESPONSE_MODE`, `OIDC_SCOPES`, `OIDC_ID_TOKEN_SIGNED_RESPONSE_ALG`, `OIDC_USERINFO_SIGNED_RESPONSE_ALG`
  - Claims mapping: `OIDC_CLAIMS_SOURCE` (default `userinfo`), `OIDC_EMAIL_ATTRIBUTE`, `OIDC_NAME_ATTRIBUTE`, `OIDC_USERNAME_ATTRIBUTE`, `OIDC_ROLES_ATTRIBUTE`
  - Role-based access control: `OIDC_ADMIN_ROLES`, `OIDC_PROJECT_OWNER_ROLES`, `OIDC_BOARD_USER_ROLES`, `OIDC_IGNORE_USERNAME`, `OIDC_IGNORE_ROLES`, `OIDC_ENFORCED`
  - Debug: `OIDC_DEBUG` gates the `access-tokens/debug-oidc` diagnostic endpoint (returns 403 unless explicitly enabled)
  - Timeout configuration: Configurable via `OIDC_TIMEOUT`

**Email/SMTP:**
- Outgoing email notifications
  - SDK/Client: nodemailer 8.0.5
  - Helper: `server/api/helpers/utils/make-smtp-transporter.js`
  - Config: `server/config/custom.js` (lines 106-113)
  - Env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_NAME`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_SECURE`, `SMTP_TLS_REJECT_UNAUTHORIZED`
  - Test endpoint: `config/test-smtp` controller (admin-only)
  - Also supports Apprise for advanced notifications

**Avatar/Profile Images:**
- Gravatar integration for user avatars
  - Config: `server/config/custom.js` (line 115)
  - Env var: `GRAVATAR_BASE_URL` (optional, supports proxy for privacy)
  - Default: Disabled unless configured (to avoid GDPR concerns)

**Notifications (Apprise):**
- Python-based notification service
  - Runtime: Python 3 via shell execution
  - Package: apprise 1.9.7 (in `server/requirements.txt`)
  - DB-backed notification services (see `NotificationService` model)
  - Used for multi-channel notifications (webhooks, browser notifications, etc.)

## Data Storage

**Primary Database:**
- PostgreSQL
  - Type: Relational database
  - Connection: Via `DATABASE_URL` env var or separate host/port/user/password
  - Client: pg 8.20.0 (native driver)
  - ORM: Waterline (via sails-hook-orm 4.0.3)
  - Query Builder: Knex 3.1.0
  - Adapter: sails-postgresql 5.0.1
  - Config: `server/config/datastores.js`
  - Migrations: Knex migrations in `server/db/migrations/` (19 migrations as of 2026-08)
  - SSL Support: Configurable via `PGSSLMODE` env var and `KNEX_REJECT_UNAUTHORIZED_SSL_CERTIFICATE`

**File Storage:**
- **Local Filesystem** (Default)
  - Location: `server/data/` (mapped as Docker volume `/app/data`)
  - Paths:
    - Protected files: `data/protected/` (favicons, user avatars, background images)
    - Private files: `data/private/` (attachments)
  - Managed by: `server/api/hooks/file-manager/LocalFileManager.js`

- **S3-Compatible Object Storage** (Optional)
  - SDK: @aws-sdk/client-s3 3.1009.0, @aws-sdk/lib-storage 3.1009.0
  - Config: `server/config/custom.js` (lines 70-76)
  - Hook: `server/api/hooks/s3/index.js`
  - Env vars: `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_FORCE_PATH_STYLE`, `S3_REQUEST_CHECKSUM_CALCULATION`
  - File manager: `server/api/hooks/file-manager/S3FileManager.js`
  - Supports both AWS S3 and S3-compatible services (MinIO, DigitalOcean Spaces, etc.)

**Caching:**
- None - Direct database queries without explicit cache layer

## Authentication & Identity

**Auth Provider:**
- **Custom** with JWT tokens
  - Token generation: jsonwebtoken 9.0.3
  - Config: `server/config/custom.js` (line 48)
  - Env var: `TOKEN_EXPIRES_IN` (in days, default 365)
  - Session handling: Sails.js built-in sessions (`Session` model; `is-session` policy)

- **OpenID Connect** (Enterprise)
  - Provider: openid-client 5.7.1
  - Callback: `oidc-callback` route
  - Implementation: `server/api/hooks/oidc/index.js`
  - Redirect URI: Generated in `server/config/custom.js` (line 102)
  - Role claims parsing: Configurable attribute mapping

- **Password Security**
  - Hashing: bcrypt 6.0.0
  - Strength estimation: zxcvbn 4.4.2

## Monitoring & Observability

**Error Tracking:**
- None detected - Application-level only

**Logs:**
- Winston 3.19.0 structured logging
- Config: `server/config/log.js`
- File output: Optional via `LOG_FILE` env var
- Log level: Configurable via `LOG_LEVEL` env var (default: info)
- Docker: Logs output to stdout/stderr for container orchestration

**Request Tracing:**
- Sails.js built-in request logging
- Optional detailed auth errors: `SHOW_DETAILED_AUTH_ERRORS` env var (custom.js line 66; not recommended without rate limiting)

## CI/CD & Deployment

**Hosting:**
- Docker containers (primary deployment method)
- Base images: Node.js 22 Alpine (server + final stage), Node.js 22 (client build stage)
- Multi-stage build in `Dockerfile`:
  - Stage 1: Server build with npm dependencies (`node:22-alpine`)
  - Stage 2: Client build with Vite bundling (`node:22`)
  - Stage 3: Final image with both server and client, plus Python 3 (`node:22-alpine`)
- Helm charts available in `charts/` for Kubernetes deployment

**Health Checks:**
- Endpoint: `server/healthcheck.js`
- Docker: Configured in Dockerfile

**Build Commands:**
- Root: `npm run server:build` and `npm run client:build`
- Server build: `npm run build` (in `server/`)
- Client build: `npm run build` (compiles to `client/dist`)

**Package Locking:**
- Git hooks: Husky 9.1.7 with lint-staged 16.4.0
- Pre-commit: ESLint and Prettier checks

## Environment Configuration

**Required env vars:**
- `BASE_URL` - Application URL (e.g., http://localhost:1337)
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT signing secret

**Optional env vars (categories):**
- **Logging**: `LOG_LEVEL`, `LOG_FILE`
- **File Management**: `MAX_UPLOAD_FILE_SIZE`, `STORAGE_LIMIT`
- **Tokens**: `TOKEN_EXPIRES_IN`
- **Users**: `ACTIVE_USERS_LIMIT`
- **OIDC**: All `OIDC_*` variables (enterprise auth)
- **S3**: All `S3_*` variables (optional file storage)
- **SMTP**: All `SMTP_*` variables (email notifications)
- **Network**: `TRUST_PROXY`, `OUTGOING_PROXY`
- **Security**: `KNEX_REJECT_UNAUTHORIZED_SSL_CERTIFICATE`, `PGSSLMODE`

**Secrets location:**
- Environment file: `.env` (created from `server/.env.sample`)
- Docker Compose: Can use `.env` file or secrets management service

## Webhooks & Callbacks

**Incoming:**
- OIDC callback: `oidc-callback` route (OAuth2 authorization code flow)

**Outgoing:**
- Webhooks: Configurable via UI (managed in database via `Webhook` model)
  - Helper: `server/api/helpers/webhooks/` domain
  - Supports event-based webhook delivery
  - Admin-only management endpoints (`webhooks/*` controllers)

**WebSocket:**
- Client-Server real-time communication via Socket.io
  - Server: Sails.js sockets (sails-hook-sockets 3.0.2)
  - Client: socket.io-client 4.8.3 + sails.io.js 1.2.1
  - Path: `/socket.io` with configurable base path
  - Features: Live updates on card/list/board changes, real-time notifications

**Image Processing:**
- Favicon downloads and processing
  - Helper: `server/api/helpers/utils/download-favicon.js`
  - Uses: sharp 0.34.5 for image manipulation

---

*Integration audit: 2026-08-06*
