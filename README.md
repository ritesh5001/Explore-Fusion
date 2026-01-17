# 🌍 Explore Fusion - AI-Powered Travel Microservices App

**Explore Fusion** is a comprehensive travel ecosystem built on a **Microservices Architecture**. It connects travelers with influencers, provides AI-driven trip planning, facilitates a marketplace for travel packages, and enables real-time community chat.

## 🚀 Key Features

### 🤖 AI-Powered Tools (Groq Integration)
* **AI Trip Planner:** Generates detailed, day-by-day itineraries with cost estimates based on destination, budget, and duration.
* **Travel Buddy Matcher:** Creates a persona of an ideal travel companion based on your travel style and interests.
* **AI Chat:** A gateway-proxied chat endpoint for trip planning, budgeting, recommendations, and summaries.

### 💼 Marketplace & Influencer Platform
* **Creator Dashboard:** Influencers can upload visuals and list travel packages.
* **Sales Tracking:** Creators can view real-time bookings and estimated revenue.
* **Booking System:** Users can browse and purchase exclusive travel packages.

### 💬 Real-Time Communication
* **Community Chat:** Instant, bidirectional messaging using **Socket.IO**.
* **Global Lounge:** Travelers can discuss plans in a shared live room.

### 👤 Social Profiles (Instagram-style)
* **Universal profile page:** View any user at `/users/:id` from the feed and other surfaces.
* **Follow system:** Follow/unfollow users with strict role rules (admins/superadmins cannot be followed; superadmin cannot follow anyone).
* **Profile stats + posts grid:** Followers/following/posts counts and a responsive posts grid with modal preview.

### 📱 Core Features
* **Authentication:** Secure JWT-based login and registration.
* **Media Uploads:** Dedicated service for handling image storage and retrieval.
* **Personalized Dashboard:** "My Trips" view combining AI-saved plans and booked packages.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS
* Axios & Socket.io-client

**Backend (Microservices):**
* **API Gateway:** Node.js, Express, `http-proxy-middleware`
* **Admin Service:** Admin APIs
* **Auth Service:** JWT, Bcrypt
* **Post Service:** Social feed management
* **Booking Service:** Marketplace logic & Order management
* **AI Service:** Groq API (`groq-sdk`)
* **Upload Service:** Legacy Multer uploads + optional ImageKit auth
* **Chat Service:** Socket.IO (Real-time WebSocket)
* **Notification Service:** Notifications APIs
* **Matches Service:** Buddy matching APIs
* **Social Service:** Follow graph APIs
* **Database:** MongoDB (Mongoose)

---

## 🏗️ Architecture

The application uses an **API Gateway (Port 5050)** to route requests to independent microservices:

| Service | Port | Description |
| :--- | :--- | :--- |
| **Gateway** | `5050` | Unified entry point for the frontend |
| **Admin** | `5007` | Admin APIs (cross-service DB access) |
| **Auth** | `5001` | Handles User Registration & Login |
| **Post** | `5002` | Manages User Posts & Feeds |
| **Booking** | `5003` | Handles Packages, Itineraries & Orders |
| **AI** | `5004` | AI chat + travel tools (Groq) |
| **Upload** | `5005` | Handles File/Image Storage |
| **Chat** | `5006` | WebSocket Server for Real-Time Chat |
| **Notification** | `5008` | Notification APIs |
| **Matches** | `5009` | Buddy matching APIs |
| **Social** | `5010` | Follow graph (follow/unfollow, followers/following) |
| **Client** | `5173` | React Frontend |

Notes:
* The frontend should call the **Gateway** for API requests.
  * Local dev: `http://localhost:5050`
  * Production (Render): `https://explore-fusion-gateway.onrender.com`

---

## ⚙️ Installation & Setup

### 1. Prerequisites
* Node.js installed
* MongoDB running locally (or MongoDB Atlas URI)
* Groq API Key
* (Optional) ImageKit account/keys for image uploads

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/explore-fusion.git
cd explore-fusion
```

### 3. Install Dependencies (Repo Root)
From the repo root (this folder), install all workspace dependencies:
```bash
npm run install:all
```

### 4. Environment Variables
This repo ignores `.env` and `.env.production` files. For local development, copy the per-service `*.env.example` inside each folder.
For production deployments with Docker Compose, copy the root `.env.example` to `.env.production`, fill in the secrets, and keep that file out of git.

Root `.env.example` gathers the shared configuration that every container expects, e.g. the public endpoints that the gateway exposes, the per-service Mongo URIs (`AUTH_MONGO_URI`, `BOOKING_MONGO_URI`, `POST_MONGO_URI`, `MATCHES_MONGO_URI`), the `JWT_SECRET`, Groq/ImageKit credentials, and the Vite build-time overrides (see the `.env.example` file for the full list).

Common ones used by the services:

**Auth Service (services/auth-service)**
* `PORT` (default: `5001`)
* `MONGO_URI`
* `JWT_SECRET`
* `IMAGEKIT_PUBLIC_KEY`
* `IMAGEKIT_PRIVATE_KEY`
* `IMAGEKIT_URL_ENDPOINT`

**Booking Service (services/booking-service)**
* `PORT` (default: `5003`)
* `MONGO_URI`
* `JWT_SECRET`

**Post Service (services/post-service)**
* `PORT` (default: `5002`)
* `MONGO_URI`
* `JWT_SECRET`

**AI Service (services/ai-service)**
* `PORT` (default: `5004`)
* `AI_PROVIDER` (set to `groq`)
* `GROQ_API_KEY`

**Upload Service (services/upload-service)**
* `UPLOAD_PORT` (default: `5005`)
* (Only needed if you use the upload-service ImageKit auth endpoint) `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`

**Gateway (gateway)**
* `GATEWAY_PORT` (default: `5050`)
* `CORS_ORIGINS` (comma-separated)
* `AUTH_SERVICE_URL`
* `BOOKING_SERVICE_URL`
* `POST_SERVICE_URL`
* `CHAT_SERVICE_URL` (optional)
* `AI_SERVICE_URL` (optional)
* `UPLOAD_SERVICE_URL` (optional)
* `ADMIN_SERVICE_URL` (optional)
* `NOTIFICATION_SERVICE_URL` (optional)
* `MATCHES_SERVICE_URL` (optional)
* `SOCIAL_SERVICE_URL` (optional)

**Client (client)**
* `VITE_API_BASE_URL` (gateway base; can be either the origin or the full `/api/v1` base)
* `VITE_IMAGEKIT_PUBLIC_KEY`
* `VITE_IMAGEKIT_URL_ENDPOINT`
* `VITE_IMAGEKIT_AUTH_ENDPOINT` (optional override; recommended to leave unset)
  * By default the client uses `${VITE_API_BASE_URL}/imagekit-auth`

### Docker Compose Mongo credentials
The production Docker stack relies on a single Mongo container with multiple databases. Copy the root `.env.example` into `.env.production` and fill in the following URIs so each service connects to its own database via the Docker network (`mongo` service name):

* `AUTH_MONGO_URI=mongodb://mongo:27017/auth`
* `BOOKING_MONGO_URI=mongodb://mongo:27017/booking`
* `POST_MONGO_URI=mongodb://mongo:27017/post`
* `MATCHES_MONGO_URI=mongodb://mongo:27017/matches`
* `AI_MONGO_URI=mongodb://mongo:27017/ai`
* `ADMIN_MONGO_URI=mongodb://mongo:27017/admin`
* `NOTIFICATION_MONGO_URI=mongodb://mongo:27017/notification`
* `UPLOAD_MONGO_URI=mongodb://mongo:27017/upload`
* (Optional) `MONGO_URI` – legacy fallback for any service still checking that variable.

---

## 👤 Profile System (Frontend)

The app includes an Instagram-style profile experience.

### Routes
* Profile: `GET /users/:id` (frontend route; protected)

### APIs used
* Aggregated profile: `GET /api/v1/users/:id/profile`
  * Expected shape:
    ```json
    {
      "user": { "_id": "...", "name": "...", "username": "...", "avatar": "...", "bio": "...", "role": "..." },
      "counts": { "followers": 0, "following": 0, "posts": 0 },
      "isFollowing": true,
      "followsYou": false
    }
    ```
* Follow/unfollow:
  * `POST /api/v1/follow/:id`
  * `DELETE /api/v1/unfollow/:id`
  * `GET /api/v1/follow/followers/:id`
  * `GET /api/v1/follow/following/:id`
* User posts: `GET /api/v1/posts/user/:id`

### UI behavior
* Feed post headers show author avatar + name/username and link to `/users/:id`.
* Profile shows avatar, name, username, bio, counts, follow state, and a posts grid.

---

## ☁️ Deployment Environment Variables

### Render (Gateway)
Set these on the `explore-fusion-gateway` service:

* `NODE_ENV=production`
* `PORT` (Render sets this automatically)
* `CORS_ORIGINS=https://explore-fusion.vercel.app`
* `AUTH_SERVICE_URL=https://explore-fusion-auth.onrender.com`
* `BOOKING_SERVICE_URL=https://explore-fusion-booking.onrender.com`
* `POST_SERVICE_URL=https://explore-fusion-post.onrender.com`
* `AI_SERVICE_URL=https://explore-fusion-ai.onrender.com`
* `UPLOAD_SERVICE_URL=https://explore-fusion-upload.onrender.com`
* `CHAT_SERVICE_URL=https://explore-fusion-chat.onrender.com`
* `ADMIN_SERVICE_URL=https://explore-fusion-admin.onrender.com`
* `NOTIFICATION_SERVICE_URL=https://explore-fusion-notification.onrender.com`
* `MATCHES_SERVICE_URL=https://explore-fusion-matches.onrender.com`

### Render (Each Service)
All services should be configured with:

* `NODE_ENV=production`
* `PORT` (Render sets this automatically)

Services that need to validate auth via the Gateway (do not call auth-service directly):

* `GATEWAY_URL=https://explore-fusion-gateway.onrender.com`

DB/JWT (set per service as needed):

* `MONGO_URI` (auth, booking, post)
* `JWT_SECRET` (must be the same across auth + downstream services)

AI:

* `AI_PROVIDER=groq`
* `GROQ_API_KEY`

Upload (ImageKit auth is handled by auth-service; upload-service only needs ImageKit keys if you also use its ImageKit endpoint):

* `IMAGEKIT_PUBLIC_KEY` (optional)
* `IMAGEKIT_PRIVATE_KEY` (optional)
* `IMAGEKIT_URL_ENDPOINT` (optional)

### Vercel (Frontend)
Set these on the `explore-fusion` frontend:

* `VITE_API_BASE_URL=https://explore-fusion-gateway.onrender.com`

---

## 🧪 Smoke Tests

After deploying, these should work:

* Gateway: `GET https://explore-fusion-gateway.onrender.com/health`
* Auth (expected 401): `GET https://explore-fusion-gateway.onrender.com/api/v1/auth/me`
* Upload: `GET https://explore-fusion-gateway.onrender.com/api/v1/upload/health`
* Admin: `GET https://explore-fusion-gateway.onrender.com/api/v1/admin/health`
* Notifications: `GET https://explore-fusion-gateway.onrender.com/api/v1/notifications/health`
* Matches: `GET https://explore-fusion-gateway.onrender.com/api/v1/matches/health`

ImageKit auth (returns `{ token, expire, signature }`):

```bash
curl https://explore-fusion-gateway.onrender.com/api/v1/imagekit-auth
```

AI Chat:

```bash
curl -X POST https://explore-fusion-gateway.onrender.com/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"plan trip to goa for 3 days"}'
```

Expected (200 OK):

```json
{ "success": true, "intent": "PLAN_TRIP", "reply": "...", "data": {} }
```

### 5. Run Everything (One Command)
Start client + gateway + all microservices together for local development:
```bash
npm run dev
```

If you only want the backend processes (gateway + services):
```bash
npm run start
```

For a production-like deployment on a VPS run the Docker stack instead. Copy `.env.example` to `.env.production`, fill in the secrets (JWT, Groq, ImageKit, Mongo URIs), and then:
```bash
docker compose --env-file .env.production up --build
```
That single command builds every image, wires all services onto the `fusion-net`, and only exposes port `5050` for the gateway plus port `80` for the frontend.

## 🐳 Docker Compose (Production)

The Compose stack lives at the repo root and orchestrates MongoDB plus all services:

* MongoDB (`mongo:7`) stores its data in the `mongo_data` volume and exposes `/data/db` only to the network; each service connects with its own database name (`auth`, `booking`, `post`, `matches`).
* Every Node.js service copies `.env.production`, waits for Mongo via health checks, and only exposes internal ports. Gateway, frontend, and Mongo share the `fusion-net` network so internal DNS names (`http://auth-service:5001`, etc.) are resolved automatically.
* Gateway runs on 5050, uses `CORS_ORIGINS` from `.env.production`, proxies `/api/v1/*`, `/imagekit-auth`, `/socket.io`, and `/uploads`, and relies on the service URLs defined in the same env file.
* The frontend is a Vite/React build served by `nginx` (`client/nginx/default.conf`) which enables gzip, SPA fallback, and proxies `/api`, `/socket.io`, `/imagekit-auth`, and `/uploads` to the gateway.
* Only the gateway port `5050` and frontend port `80` map to the host; all other services remain internal.
* A single `.env.production` (copied from `.env.example`) drives every container. Keep the real values (JWT_SECRET, GROQ_API_KEY, ImageKit keys, absolute Mongo URIs) out of version control and rotate them via your deployment pipeline.

After `docker compose --env-file .env.production up --build` succeeds, exercise the same smoke tests locally (replace `https://explore-fusion-gateway.onrender.com` with `http://localhost:5050`). The gateway health endpoint, AI chat, and ImageKit auth all travel through the same port, and Mongo data survives container restarts thanks to the named volume.

---

## 🖼️ Image Uploads (ImageKit)

The preferred flow is direct client upload to ImageKit using a protected auth endpoint.

* Auth endpoint (protected): `POST /api/v1/imagekit-auth`
  * Via gateway (recommended): `http://localhost:5050/api/v1/imagekit-auth` (local) or `https://explore-fusion-gateway.onrender.com/api/v1/imagekit-auth` (prod)
  * Direct to auth-service: `http://localhost:5001/api/v1/imagekit-auth`
* The response shape must be exactly: `{ token, signature, expire }` (required by the ImageKit JS SDK).

---

## 🧯 Troubleshooting

* **`Missing publicKey during ImageKit initialization`**
  * Ensure `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, and `IMAGEKIT_URL_ENDPOINT` are set.

* **Port already in use (`EADDRINUSE`)**
  * Stop the process using the port or change `PORT` / `UPLOAD_PORT` / `GATEWAY_PORT`.
