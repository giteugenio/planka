# Testing

## Frameworks

| Layer | Framework | Version |
|-------|-----------|---------|
| Server unit/integration | Mocha + Chai | Mocha 11.7.5, Chai 6.2.2 |
| Client unit | Jest | 30.3.0 |
| E2E / Acceptance | Cucumber.js + Playwright | Cucumber 12.7.0, Playwright 1.58.2 |

---

## Server Tests (`server/test/`)

### Structure

```
server/test/
├── lifecycle.test.js       # Global Sails app setup/teardown
├── mocha.opts               # Mocha runner options
├── fixtures/               # Test data (currently empty)
├── integration/
│   ├── controllers/        # Controller-level integration tests
│   ├── helpers/            # Helper-level integration tests
│   └── models/             # Model-level integration tests
└── utils/                  # Utility function unit tests
    └── remote-address.test.js
```

### Setup / Lifecycle

`server/test/lifecycle.test.js` — lifts a Sails app before the test suite and tears it down after:

```js
before(function(done) {
  sails.lift({ ... }, done);
});
after(function(done) {
  sails.lower(done);
});
```

### Test Pattern

```js
// server/test/utils/remote-address.test.js
const { expect } = require('chai');

describe('remoteAddress', () => {
  it('should return IP from X-Forwarded-For header', async () => {
    const result = remoteAddress({ headers: { 'x-forwarded-for': '1.2.3.4' } });
    expect(result).to.equal('1.2.3.4');
  });
});
```

### Running Server Tests

```bash
cd server && npm test
```

---

## Client Unit Tests (`client/src/`)

### Structure

Tests are **co-located** with source files:

```
client/src/utils/
├── local-id.js
└── local-id.test.js        # Jest test alongside source
```

### Test Pattern

```js
// client/src/utils/local-id.test.js
import { generate, isLocalId } from './local-id';

test('generates a local ID', () => {
  const id = generate();
  expect(isLocalId(id)).toBe(true);
});
```

### Configuration

- **Transform**: `babel-jest` for `.js` and `.jsx`
- **Config**: `client/jest.config.js` (or `package.json` jest field)

### Running Client Tests

```bash
cd client && npm test
```

---

## Acceptance / E2E Tests (`client/tests/acceptance/`)

### Structure

```
client/tests/acceptance/
├── Config.js               # Base URL, timeout, Playwright options
├── cucumber.conf.js        # Cucumber world/hooks setup
├── features/               # Cucumber .feature files (Given-When-Then)
│   └── login.feature
├── pages/                  # Page object wrappers
│   ├── LoginPage.js
│   └── HomePage.js
└── steps/                  # Step definition files
    └── login.step.js
```

### Pattern

```js
// client/tests/acceptance/steps/login.step.js
Given('I am on the login page', async function() {
  await this.page.goto(Config.baseUrl + '/login');
});

When('I enter valid credentials', async function() {
  await this.page.fill('[name=emailOrUsername]', Config.testUser);
  await this.page.fill('[name=password]', Config.testPassword);
  await this.page.click('[type=submit]');
});

Then('I should be redirected to the dashboard', async function() {
  await this.page.waitForURL('**/');
});
```

### Configuration (`Config.js`)

```js
const BASE_URL = process.env.BASE_URL || 'http://localhost:1337';
const TIMEOUT = parseInt(process.env.TIMEOUT, 10) || 6000;
const PLAYWRIGHT = {
  headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
  slowMo: parseInt(process.env.PLAYWRIGHT_SLOW_MO, 10) || 1000,
};

export default { BASE_URL, TIMEOUT, PLAYWRIGHT };
```

### Running Acceptance Tests

```bash
cd client && npm run test:acceptance
# Requires running Planka instance
```

---

## Mocking Strategies

### Server
- Manual mocking via helper functions in `server/test/fixtures/`
- Integration tests hit a real (test) Sails/database instance — no DB mocking

### Client
- Jest module mocking (`jest.mock()`) for API modules
- No dedicated mock library — manual factory functions for test data

---

## Coverage

- No coverage thresholds configured
- Coverage can be generated with `--coverage` flag in Jest
- Server tests have minimal coverage; primarily focused on utility functions and model logic
- E2E tests cover critical user flows (login, board navigation)

---

## Test Coverage Gaps (Known)

- Database migration scripts — **no tests** (critical risk)
- Client saga error paths — largely untested
- Card duplication logic (`helpers/cards/duplicate-one.js`)
- S3 file manager operations
- Concurrent modification / race condition scenarios
- OIDC token refresh and error flows
