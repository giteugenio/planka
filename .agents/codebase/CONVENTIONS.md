# Coding Conventions

**Analysis Date:** 2026-08-06

## Naming Patterns

**Files:**
- Controllers: kebab-case (e.g., `access-tokens/create.js`, `board-memberships/delete.js`)
- Models: PascalCase in code, kebab-case directory names (e.g., `models/User.js`)
- Helpers: kebab-case (e.g., `projects/get-boards-total-by-id.js`, `users/is-project-manager.js`)
- React components: PascalCase with `.jsx` extension (e.g., `Card.jsx`, `EditName.jsx`), typically grouped in PascalCase dirs under a kebab-case feature dir, with an `index.js` barrel (e.g., `components/cards/Card/Card.jsx` + `Card/index.js`)
- Tests: .test.js or .spec.js suffix (e.g., `local-id.test.js`, `remote-address.test.js`)
- Actions/Reducers: camelCase with domain name (e.g., `bootstrap.js`, `card-labels.js`)

**Functions:**
- camelCase for regular functions: `getRemoteAddress()`, `isProjectManager()`, `createOne()`
- Server controller functions named `fn()` for Sails.js controllers
- Helper functions prefixed with verb: `getOneById()`, `isEmailOrUsername()`, `handleSteps()`

**Variables:**
- camelCase for all variables and constants
- SCREAMING_SNAKE_CASE for immutable regex patterns and constants: `ID_REGEX`, `MAX_STRING_ID`, `USERNAME_REGEX`
- Object keys in camelCase: `emailOrUsername`, `projectId`, `isProjectManager`
- Error object keys use camelCase in nested errors: `Errors.INVALID_CREDENTIALS.invalidCredentials`

**Types:**
- Model names PascalCase: `User`, `Board`, `Project`
- Use `.qm` prefix for query methods: `User.qm.getOneActiveByEmailOrUsername()`, `Board.qm.getByProjectId()`

## Code Style

**Formatting:**
- ESLint + Prettier for both client and server
- Print width: 100 characters
- Single quotes for strings
- Trailing commas: "all" (commas after final items in objects/arrays)
- End of line: "auto" (client) / default (server)
- No semicolons added by Prettier, but ESLint may enforce other style rules

**Linting:**
- Server: airbnb-base config with prettier plugin, max-warnings=0 strict mode
- Client: airbnb + airbnb/hooks configs with prettier plugin
- Server disables `no-throw-literal` and `no-undef` rules
- Client has custom import resolver ignoring `\?url$` and `\.svg\?react$`

**Comments:**
- File-level copyright header on all files:
  ```javascript
  /*!
   * Copyright (c) 2024 PLANKA Software GmbH
   * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
   */
  ```
- TODO comments used to mark incomplete work (e.g., `// TODO: add all methods`)
- JSDoc/swagger comments above functions for API endpoints (e.g., `/** @swagger ... */`)

## Import Organization

**Order:**
1. Copyright header and license
2. Third-party imports (npm packages): `const bcrypt = require('bcrypt');`, `import React from 'react';`
3. Local imports: relative paths using `../` or absolute imports from `src/`
4. Last: export of module.exports or default export

**Path Aliases:**
- No source path aliases. Uses relative paths throughout: `../../../utils/validators`
- Client uses ES6 imports with relative paths: `import ActionTypes from '../constants/ActionTypes';`
- Vite config defines only a dependency shim alias (`source-map-js` → `source-map`) in `client/vite.config.js`

**Import Patterns:**
- Server: CommonJS (require/module.exports)
- Client: ES6 modules (import/export)

## Error Handling

**Patterns:**
- Server: Structured error objects with camelCase keys mapped to error messages:
  ```javascript
  const Errors = {
    INVALID_CREDENTIALS: {
      invalidCredentials: 'Invalid credentials',
    },
    INVALID_EMAIL_OR_USERNAME: {
      invalidEmailOrUsername: 'Invalid email or username',
    },
  };
  throw Errors.INVALID_CREDENTIALS;
  ```
- Error exits mapped to HTTP response types in Sails controllers:
  ```javascript
  exits: {
    invalidCredentials: { responseType: 'unauthorized' },
    projectNotFound: { responseType: 'notFound' },
  }
  ```
- Intercept error chains and rethrow with custom error structure:
  ```javascript
  .intercept('invalidFile', () => Errors.INVALID_IMPORT_FILE)
  .intercept('termsAcceptanceRequired', (error) => ({
    termsAcceptanceRequired: error.raw,
  }))
  ```

## Logging

**Framework:** Winston logger (server), console (client)

**Patterns:**
- Server: `sails.log.warn()`, `sails.log.error()` for security events like authentication failures
- Log format includes context like IP addresses: `sails.log.warn(\`Invalid password! (IP: ${remoteAddress})\`)`
- Avoid logging sensitive data; conditionally show details based on config flag

## Function Design

**Size:** Functions kept relatively small with focused responsibility. Controllers typically 50-100 lines.

**Parameters:**
- Server controllers use `inputs` object and Sails.js context (`this.req`, `this.res`)
- Helper functions use destructured `inputs` object: `fn(inputs)` or `fn({ currentUser, projectId })`
- React components use object props with destructuring

**Return Values:**
- Server controllers return response object or throw errors: `return exits.success({ item, included })`
- Helper functions return Promise or data: `async fn(inputs) { return result; }`
- React components return JSX
- Utility validators return boolean: `isId(value)`, `isEmailOrUsername(value)`

## Module Design

**Exports:**
- Server: `module.exports = { inputs: {...}, exits: {...}, fn: async fn(inputs) {...} }`
- Client: `export default { actionName, anotherAction };` or named exports
- Helpers: Single function export with module.exports

**Barrel Files:**
- Client uses index.js barrel files in action/api directories: `export * from './file.js'` or `export default { ...imports }`
- Server uses index.js for controller organization

## Server Controller Structure

**Standard controller pattern in `api/controllers/`:**
```javascript
const Errors = { /* error definitions */ };

module.exports = {
  inputs: { /* input validation */ },
  exits: { /* error response mappings */ },
  async fn(inputs) {
    // Validate permissions
    // Fetch data
    // Perform operation
    // Return response via exits.success() or throw Errors.*
  }
};
```

**Input validation:**
- Uses custom validators from `utils/validators.js`: `isId`, `isEmailOrUsername`, `isUrl`
- Spread operator for reusable input patterns: `...idInput`
- Explicit required flags and type definitions

## React Component Patterns

**Functional components with React.memo:**
```javascript
const ComponentName = React.memo(() => {
  const state = useSelector(selectors.selectSomething);
  const dispatch = useDispatch();
  const [t] = useTranslation();
  // Component logic
  return <JSX />;
});
```

**Custom hooks used:**
- `useForm()` for form state management
- `useNestedRef()` for field references
- `useTranslation()` for i18next integration
- `usePopupInClosableContext()` for modal/popup handling
- `useSelector()` / `useDispatch()` for Redux integration

**Props handling:**
- Components receive props implicitly via hooks (Redux selectors, i18next)
- Minimal prop passing, heavy use of Redux for state management

---

*Convention analysis: 2026-08-06*
