# Local Development Guide

## Environment
- The root `.env` file is the single source of truth. Every service, the gateway, and Vite load it directly via `dotenv`.
- This workflow runs the full stack locally (no Docker or Nginx) by pointing every service at its localhost port.
- Do **not** duplicate secrets or values in individual services; if you need to change something for local dev, edit the root `.env` and restart the correlating process.
- Frontend only needs its own `.env.local` to override the API base URL (`VITE_API_BASE_URL=http://localhost:5050/api/v1`). All other `VITE_*` values (ImageKit keys, etc.) come from the shared `.env` via Vite's `envDir` pointing to the workspace root.

## Ports
| Component | Description | Port |
|-----------|-------------|------|
| Gateway | Proxies all `/api/v1/*` traffic to the services | 5050 |
| Frontend (Vite) | Runs the React UI | 5173 |
| Auth Service | Authentication, user, and admin endpoints | 5001 |
| Post Service | Posts, uploads, and the public feed | 5002 |
| Booking Service | Packages, bookings, itineraries, and reviews | 5003 |
| AI Service | Groq-based AI endpoints | 5004 |
| Upload Service | ImageKit auth and direct uploads | 5005 |
| Chat Service | Socket.IO-powered chat backend | 5006 |
| Admin Service | Admin tooling, analytics, and dashboards | 5007 |
| Notification Service | Notification inbox + delivery | 5008 |
| Matches Service | Buddy matching and suggestions | 5009 |

## Recommended Startup Order
1. `npm install` (or `npm run install:all`) to install every project dependency.
2. `npm run dev:services` so each service binds to its dictated port and connects to Mongo Atlas.
3. In a new terminal tab/window, `npm run dev:gateway` so the gateway listens on `5050` and proxies `/api/v1` traffic to the services.
4. Finally, `npm run dev:frontend` to start Vite at `http://localhost:5173` with the API pointing at the local gateway.
5. Alternatively, run `npm run dev` to start frontend, gateway, and services together via `concurrently`.

## Common Errors
- **Gateway 404 for `/api/v1/...`** → Ensure the target service is running on its expected localhost port. The gateway no longer rewrites paths, so `/api/v1/ai/chat` only works if the AI service exposes the same base path.
- **`VITE_IMAGEKIT_URL_ENDPOINT` missing** → The frontend will throw an error during ImageKit initialization if the URL endpoint is not defined. Make sure the root `.env` defines `VITE_IMAGEKIT_URL_ENDPOINT` and `VITE_IMAGEKIT_PUBLIC_KEY`.
- **MongoDB connection issues** → Each service uses the Atlas URIs stored in the shared `.env` (e.g., `AUTH_MONGO_URI`, `BOOKING_MONGO_URI`). Verify the credentials and that your network allows connections to MongoDB Atlas. Restart the service after updating any URI.

## Tips
- Check each service's `/health` endpoint (e.g., `http://localhost:5001/health`) before opening the frontend.
- The gateway exposes `/health` as well, confirming it has started and loaded the `.env` values.
- If you encounter CORS warnings, confirm that `CORS_ORIGINS` in the root `.env` includes `http://localhost:5173`.
- You can still run an individual service via `node services/<name>/server.js` if you prefer to debug it in isolation.
