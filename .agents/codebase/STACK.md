# Technology Stack

**Analysis Date:** 2026-08-06

**App Version:** 2.1.1 (root `package.json`)

## Languages

**Primary:**
- JavaScript (ES6+) - Server and client code
- JSX - React component definitions in client
- CSS/SCSS - Styling via sass-embedded 1.98.0

**Secondary:**
- Python 3 - Notification delivery (Apprise) via shell execution
- SQL - PostgreSQL schema and migrations

## Runtime

**Environment:**
- Node.js >= 20 (required in `server/package.json` engines)
- Docker (Node.js 22 on Alpine for server/final stages, Node.js 22 for client build stage)

**Package Manager:**
- npm - Version management in `package.json` files
- Lockfile: `package-lock.json` present for root, server, and client
- patch-package - Patches applied from `server/patches/` (sails, skipper-disk, waterline) and `client/patches/` (redux-orm, sails.io.js, semantic-ui-react, react-mentions, @gravity-ui/markdown-editor, @diplodoc/transform)

## Frameworks

**Backend:**
- Sails.js 1.5.17 - MVC web framework and real-time communication
- Waterline ORM (via sails-hook-orm 4.0.3) - Database abstraction layer
- sails-hook-sockets 3.0.2 - WebSocket/Socket.io support

**Frontend:**
- React 18.2.0 - UI framework
- Redux 5.0.1 - State management
- Redux-Saga 1.4.2 - Side effects management
- React Router 7.13.1 - Client-side routing

**Build/Dev:**
- Vite 7.3.2 - Client bundler and dev server (with commonjs, node-polyfills, svgr, ejs-template plugins)
- Nodemon 3.1.14 - Dev server auto-reload
- Babel - transpilation: preset-env 7.29.0, eslint-parser 7.28.6, runtime 7.28.6

**Testing:**
- Jest 30.3.0 - Client test runner
- Mocha 11.7.5 - Server test runner
- Chai 6.2.2 - Server test assertions
- Supertest 7.2.2 - HTTP assertion library for API tests
- Playwright 1.58.2 - E2E browser automation
- Cucumber 12.7.0 - BDD acceptance tests

**Database:**
- Knex 3.1.0 - Query builder and migrations
- PostgreSQL (pg 8.20.0) - Primary database driver
- sails-postgresql 5.0.1 - Waterline adapter for PostgreSQL

## Key Dependencies

**Critical:**
- bcrypt 6.0.0 - Password hashing for security
- jsonwebtoken 9.0.3 - JWT token generation and validation
- pg 8.20.0 - PostgreSQL driver
- sharp 0.34.5 - Image processing for avatars, backgrounds, favicons
- socket.io-client 4.8.3 - WebSocket client (browser)
- sails.io.js 1.2.1 - Sails socket wrapper for browser

**Infrastructure:**
- @aws-sdk/client-s3 3.1009.0 - S3 file storage integration
- @aws-sdk/lib-storage 3.1009.0 - S3 multipart upload handling
- openid-client 5.7.1 - OpenID Connect authentication provider
- nodemailer 8.0.5 - Email sending (SMTP)

**Client UI:**
- @gravity-ui/uikit 7.34.0 - Component library (ongoing migration target)
- @gravity-ui/markdown-editor 15.35.1 - Markdown editing
- @diplodoc/cut-extension 1.1.1 + @diplodoc/transform 4.70.2 - Text formatting/transforms
- semantic-ui-react 2.1.5 - Legacy component library (still widely used, patched)
- react-mentions 4.4.10 - @mentions in comment inputs
- react-beautiful-dnd 13.1.1 - Drag-and-drop for cards/lists
- react-redux 9.2.0 - Redux integration with React
- redux-orm 0.16.2 - ORM layer for Redux
- reselect 5.1.1 - Memoized selectors

**Client Features:**
- i18next 25.8.18 - Internationalization (i18n)
- react-i18next 16.5.8 - i18next React integration
- linkifyjs 4.3.2 - URL detection and linking
- markdown-it 13.0.2 - Markdown parsing
- date-fns 4.1.0 - Date formatting and manipulation
- javascript-time-ago 2.6.4 - Relative time display
- jwt-decode 4.0.0 - Client-side JWT decoding

**Utilities:**
- lodash 4.18.1 - Utility library functions
- uuid 11.1.0 - Unique ID generation
- zxcvbn 4.4.2 - Password strength estimation
- validator 13.15.26 - Input validation
- dotenv 17.3.1 - Environment variable loading
- moment 2.30.1 - Date handling (server only; in maintenance mode)

**Logging:**
- winston 3.19.0 - Structured logging framework

**Code Quality:**
- ESLint 8.57.1 - JavaScript linting
- Prettier 3.8.1 - Code formatting
- eslint-config-airbnb - Airbnb style guide
- babel-jest 30.3.0 - Jest Babel transformer
- Husky 9.1.7 + lint-staged 16.4.0 - Pre-commit hooks

## Configuration

**Environment:**
- `.env` file with environment variables (sample: `server/.env.sample`)
- Required: `BASE_URL`, `DATABASE_URL`, `SECRET_KEY`
- Optional: S3, OIDC, SMTP, logging, rate limiting configs
- Database SSL configuration via `PGSSLMODE` and `KNEX_REJECT_UNAUTHORIZED_SSL_CERTIFICATE`

**Build:**
- `Dockerfile` - Multi-stage build (server, client, final)
- `docker-compose.yml` - Full stack with PostgreSQL
- `docker-compose-dev.yml` - Development stack with hot-reload
- `vite.config.js` - Client bundler config in `client/` (dev proxy for `/api` and `/socket.io`)
- `server/.sailsrc` - Sails.js configuration file
- `server/nodemon.json` - Dev server watch config
- `package.json` - Root workspace orchestration with npm scripts
- App version injected via genversion into `server/version.js` and `client/src/version.js` (`npm run gv`)

## Platform Requirements

**Development:**
- Node.js >= 20
- PostgreSQL (for database)
- npm 8.0.0+ (global)
- Docker and Docker Compose (optional, for containerized development)

**Production:**
- Docker container (Alpine Linux base, Node.js 22)
- PostgreSQL database (separate service)
- Python 3 (for Apprise notifications)
- Minimum 1GB RAM, 1 CPU recommended

---

*Stack analysis: 2026-08-06*
