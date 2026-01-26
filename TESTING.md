# Testing Guide

## Overview
This project uses Jest and Supertest to exercise the gateway and selected services locally. Tests run against `localhost` ports (no Docker) and assume the services are already running.

## Setup
1. Install dependencies: `npm install` at the repo root (adds Jest, Supertest, etc.).
2. Ensure the gateway is running (it now hosts AI, admin, booking, upload, and notification routes):
   - `npm run dev:gateway`
3. The frontend is not required for these tests.

## Running Tests
- `npm test` – run the full suite once (serial mode via `--runInBand`).
- `npm run test:watch` – rerun on file changes.
- `npm run test:auth` – run only the auth-related contract.
- `npm run test:gateway` – run only the gateway health test.

## What the tests do
- `tests/auth/auth.login.test.js` hits `POST http://localhost:5050/api/v1/auth/login` and tolerates either a success token or a 401 error.
- `tests/gateway/gateway.health.test.js` checks the gateway health endpoint at `/health` (expect `{ status: 'ok' }`).
- `tests/notifications/notifications.my.test.js` logs in, then calls `/api/v1/notifications/my` via the gateway with the token to make sure protected routes behave.

## Common Failures
- `ECONNREFUSED` → a service (gateway/auth/etc.) is not running on the expected port.
- `401 Unauthorized` → login credentials (`test@example.com` / `password`) are rejected. Ensure test user exists or catch the failure as optional.
- `Missing VITE_API_BASE_URL` → env not loaded before tests (see `tests/setup.js`).

## Extending
- Add new files under `tests/<service>/` and use `supertest('http://localhost:<port>')` for each service.
- Reuse `tests/utils/auth.js` to share login logic.
- Keep `NODE_ENV=test` for isolation (handled via `cross-env` in `npm test`).
