# Testing & Quality Evidence

This folder contains testing assets for unit/integration validation and UI screenshot capture.

## Structure

- `unit/`: unit-focused tests
- `integration/`: integration-style component tests
- `reports/coverage/`: coverage report output (generated)

## Run

```bash
npm install
npm run test
npm run test:coverage
```

## What is validated

- New ticket backend validation error rendering (`validationErrors` array)
- Attachment preview URL fallback support (`fileAccessUrl` OR `fileUrl`)
- Attachment upload error handling feedback

## Latest execution evidence

- `npm run test`: 2 test files passed, 3 tests passed.
- `npm run test:coverage`: passed and report generated under `testing/reports/coverage`.
- Screenshots should be captured manually as requested.
