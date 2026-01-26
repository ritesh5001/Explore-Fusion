# Local Development Guide

## Environment
- The root `.env` file is the single source of truth. Every service, the gateway, and Vite load it directly via `dotenv`.
- This workflow runs the full stack locally (no Docker or Nginx) by pointing every service at its localhost port.
- Do **not** duplicate secrets or values in individual services; if you need to change something for local dev, edit the root `.env` and restart the correlating process.
- Frontend only needs its own `.env.local` to override the API base URL (`VITE_API_BASE_URL=http://localhost:5050/api/v1`). All other `VITE_*` values (ImageKit keys, etc.) come from the shared `.env` via Vite's `envDir` pointing to the workspace root.

## Ports
| Component | Description | Port |
|-----------|-------------|------|
| Gateway | Proxies all `/api/v1/*` traffic to the services and hosts the auth, booking, admin, and AI APIs plus the real-time Socket.IO chat server | 5050 |
| Frontend (Vite) | Runs the React UI | 5173 |

AI endpoints (Groq-powered helpers) respond from `/api/v1/ai` on the gateway port `5050`, so you no longer need to run a separate process for them.

Uploads run through the gateway at `/api/v1/upload`, serve files from `/uploads`, and reuse `/imagekit-auth` for ImageKit tokens.

Admin and booking APIs now live inside the gateway at `/api/v1/admin` and `/api/v1/bookings` (5050); you no longer need to run separate processes for them.
Chat uses the gateway's `/socket.io` endpoint, so no extra service or port is required for real-time messaging.
Matches also live inside the gateway via `/api/v1/matches`, so no standalone port or process is required for buddy matching.
Notifications live inside the gateway at `/api/v1/notifications`, so there is no separate service or port for the inbox APIs.
Post APIs live inside the gateway at `/api/v1/posts`, so you no longer need to start a dedicated process on port 5002 for the social feed.

## Recommended Startup Order
1. `npm install` (or `npm run install:all`) to install every project dependency.
2. `npm run dev:gateway` so the gateway listens on `5050` and serves all `/api/v1` traffic, including the AI routes.
3. In a new terminal tab/window, `npm run dev:frontend` to start Vite at `http://localhost:5173` with the API pointing at the local gateway.
4. Alternatively, run `npm run dev` to start the frontend and gateway together via `concurrently`.

## Common Errors
- **Gateway 404 for `/api/v1/...`** → Ensure the gateway is running on `5050` and has loaded the router that owns the requested endpoint (AI, bookings, uploads, etc.).
- **`VITE_IMAGEKIT_URL_ENDPOINT` missing** → The frontend will throw an error during ImageKit initialization if the URL endpoint is not defined. Make sure the root `.env` defines `VITE_IMAGEKIT_URL_ENDPOINT` and `VITE_IMAGEKIT_PUBLIC_KEY`.
- **MongoDB connection issues** → Each service uses the Atlas URIs stored in the shared `.env` (e.g., `AUTH_MONGO_URI`, `BOOKING_MONGO_URI`). Verify the credentials and that your network allows connections to MongoDB Atlas. Restart the service after updating any URI.

## Tips
- Check each service's `/health` endpoint (e.g., `http://localhost:5050/health` for the gateway) before opening the frontend.
- The gateway exposes `/health` as well, confirming it has started and loaded the `.env` values.
- If you encounter CORS warnings, confirm that `CORS_ORIGINS` in the root `.env` includes `http://localhost:5173`.
- You can still run an individual service via `node services/<name>/server.js` if you prefer to debug it in isolation.
