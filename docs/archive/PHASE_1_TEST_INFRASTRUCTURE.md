# Phase 1 – Test Infrastructure & Quality Gates

## Objectives
- Establish comprehensive test coverage for all critical paths.
- Enforce quality gates in CI.
- Enable safe refactoring for Phases 2‑6.

## Tasks

| # | Task | Details | Effort |
|---|------|---------|--------|
| 1.1 | **Install Vitest** | `npm i -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom` | 0.5 day |
| 1.2 | **Unit test API routes** | Test all 7 endpoints in `app/api/v1/`: bookings/create, queue/status, telemetry/gate-verify, telemetry/weighbridge, telemetry/batch-sync, reset, mandis | 1.5 days |
| 1.3 | **Unit test lib functions** | `calculateHaversineDistance`, `generateHmacGateToken`, `verifyHmacGateToken`, `MandiSyncDatabase` methods (createBooking, verifyGateEntry, updateWeighbridgeMeasurement, logTelemetry, resetDemoData) | 1 day |
| 1.4 | **Install Playwright** | `npm i -D @playwright/test` + `npx playwright install chromium` | 0.5 day |
| 1.5 | **E2E test: Tab navigation** | Verify all 5 tabs render, switch, maintain state | 0.5 day |
| 1.6 | **E2E test: FarmerPortal 5‑step flow** | GPS → Mandi → Slot → Pass → Receipt | 1 day |
| 1.7 | **E2E test: GateControlDesk** | RFID input → scan → barrier animation → logs | 0.5 day |
| 1.8 | **E2E test: HardwareBench** | Weight input → gross/tare capture → offline buffer → sync | 0.5 day |
| 1.9 | **E2E test: Demo modal** | All 4 phases execute sequentially | 0.5 day |
| 1.10 | **CI workflow** | Update `.github/workflows/ci.yml` to run: `lint` → `type-check` → `test` → `test:e2e` → `build` on every PR | 0.5 day |
| 1.11 | **Coverage threshold** | Configure `vitest.config.ts` with `coverage: { thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 } }` | 0.25 day |
| 1.12 | **Fix existing issues** | Run `npm run lint` and `npm run type-check`, fix all errors | 0.5 day |

## Test File Structure
```
tests/
├── unit/
│   ├── api/
│   │   ├── bookings.create.test.ts
│   │   ├── queue.status.test.ts
│   │   ├── telemetry.gate-verify.test.ts
│   │   ├── telemetry.weighbridge.test.ts
│   │   ├── telemetry.batch-sync.test.ts
│   │   └── reset.test.ts
│   └── lib/
│       ├── spatial.test.ts
│       ├── crypto.test.ts
│       └── db.test.ts
├── e2e/
│   ├── tabs.navigation.test.ts
│   ├── farmer-portal.flow.test.ts
│   ├── gate-control-desk.test.ts
│   ├── hardware-bench.test.ts
│   └── demo-modal.test.ts
├── fixtures/
│   └── seed-data.ts
└── setup/
    ├── vitest.setup.ts
    └── playwright.setup.ts
```

## CI Workflow (`.github/workflows/ci.yml`)
```yaml
name: CI
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
  test:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test -- --coverage
      - uses: codecov/codecov-action@v4
  e2e:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
  build:
    needs: [test, e2e]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```