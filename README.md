# 🌍 Explore Fusion - AI-Powered Travel Monolith App

**Explore Fusion** is a comprehensive travel ecosystem built as a **Node.js monolith**. It connects travelers with influencers, provides AI-driven trip planning, facilitates a marketplace for travel packages, and enables real-time community chat.

## 🚀 Key Features

### 🤖 AI-Powered Tools (Groq Integration)
* **AI Trip Planner:** Generates detailed, day-by-day itineraries with cost estimates based on destination, budget, and duration.
* **Travel Buddy Matcher:** Creates a persona of an ideal travel companion based on your travel style and interests.
* **AI Chat:** A Socket.IO chat endpoint served directly by the gateway at `/socket.io` for trip planning, budgeting, recommendations, and summaries.

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

**Backend (Monolith):**
* **Gateway Monolith:** Node.js, Express (hosts auth, admin, booking, AI, posts, matches, notifications, upload, and the Socket.IO chat server)
* **Auth Module:** JWT, Bcrypt
* **Post APIs:** Social feed management hosted inside the gateway at `/api/v1/posts`
* **Booking APIs:** Packages, itineraries, and orders hosted inside the gateway at `/api/v1/bookings`
* **AI APIs:** Groq-powered assistant hosted inside the gateway at `/api/v1/ai` (uses `groq-sdk`)
* **Upload APIs:** File uploads, static `/uploads`, and ImageKit auth are handled by the gateway (`/api/v1/upload`, `/uploads`, `/imagekit-auth`)
* **Notification APIs:** Hosted inside the gateway at `/api/v1/notifications`
* **Matches APIs:** Buddy matching routes hosted inside the gateway under `/api/v1/matches`
* **Social APIs:** Follow graph endpoints hosted inside the gateway at `/api/v1/follow`
* **Database:** MongoDB (Mongoose)

---

## 🏗️ Architecture

Explore Fusion runs as a **single backend process** on port `5050`.

| Component | Port | Description |
| :--- | :--- | :--- |
| **Gateway Monolith** | `5050` | Unified backend entry point; hosts auth, admin, booking, AI, posts, matches, notifications, upload, and Socket.IO chat (`/socket.io`) |
| **Client** | `5173` | React frontend in local dev |

Database model:
* One shared Mongoose connection
* One Mongo database configured by `MONGO_URI`
* Domain modules (auth/booking/post/matches/social) remain in folders but run inside the same process

Notes:
* The frontend should call the **Gateway** for API requests.
  * Local dev: `http://localhost:5050`
  * Production (Render): `https://explore-fusion-gateway.onrender.com`
* Post, social, matches, and notification APIs are exposed via the gateway (`/api/v1/posts`, `/api/v1/follow`, `/api/v1/matches`, `/api/v1/notifications`).

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
This repo ignores `.env` and `.env.production` files. For local development, copy `gateway/.env.example` to `gateway/.env` and fill values.
For production deployments, copy the root `.env.example` to `.env.production`, fill in the secrets, and keep that file out of git.

Root `.env.example` gathers shared production configuration for the gateway and frontend, including `MONGO_URI`, `JWT_SECRET`, Groq/ImageKit credentials, and Vite build-time overrides.

Common ones used by the services:

**Gateway (single backend process)**
* `MONGO_URI`
* `JWT_SECRET`
* `PORT` / `GATEWAY_PORT` (default: `5050`)
* `CORS_ORIGINS` (comma-separated)
* `IMAGEKIT_PUBLIC_KEY`
* `IMAGEKIT_PRIVATE_KEY`
* `IMAGEKIT_URL_ENDPOINT`
* `AI_PROVIDER` (set to `groq`)
* `GROQ_API_KEY`

AI endpoints (e.g., `/api/v1/ai/chat`) live in the gateway on port `5050`, so no separate port or service URL is required.

`/api/v1/posts`, `/api/v1/follow`, `/api/v1/matches`, and `/api/v1/notifications` are handled directly by the gateway and all use the same shared Mongo database from `MONGO_URI`.

Socket.IO chat traffic is handled directly by the gateway at `/socket.io`, so no extra service URL is required.

Admin, booking, and AI APIs now run from the gateway at `/api/v1/admin`, `/api/v1/bookings`, and `/api/v1/ai`, so no separate ADMIN_SERVICE_URL, BOOKING_SERVICE_URL, or AI_SERVICE_URL is required.

**Client (client)**
* `VITE_API_BASE_URL` (gateway base; can be either the origin or the full `/api/v1` base)
* `VITE_IMAGEKIT_PUBLIC_KEY`
* `VITE_IMAGEKIT_URL_ENDPOINT`
* `VITE_IMAGEKIT_AUTH_ENDPOINT` (optional override; recommended to leave unset)
  * By default the client uses `${VITE_API_BASE_URL}/imagekit-auth`

### Production Mongo credential
Set one database URI for the monolith gateway:

* `MONGO_URI=<your production MongoDB URI>`

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
* `MONGO_URI=mongodb://<host>:27017/explore_fusion`
* `JWT_SECRET`
* `IMAGEKIT_PUBLIC_KEY`
* `IMAGEKIT_PRIVATE_KEY`
* `IMAGEKIT_URL_ENDPOINT`
* `AI_PROVIDER=groq`
* `GROQ_API_KEY`

Notification, matches, social, and post APIs are served from the gateway itself (`/api/v1/notifications`, `/api/v1/matches`, `/api/v1/follow`, `/api/v1/posts`), so no additional public URLs are required beyond the gateway.

`/api/v1/posts`, `/api/v1/follow`, and `/api/v1/matches` are hosted by the gateway and all use the same Mongo database from `MONGO_URI`.

Socket.IO chat traffic is served from the gateway itself (see `/socket.io`), so no separate `CHAT_SERVICE_URL` is needed.

Admin, booking, and AI APIs are handled by the gateway itself at `/api/v1/admin`, `/api/v1/bookings`, and `/api/v1/ai`, so no extra URLs belong here.

### Render (Other Consumers)
Any other consumer that needs to validate auth via the gateway should be configured with:

* `NODE_ENV=production`
* `PORT` (Render sets this automatically)

Services that need to validate auth via the Gateway should point at its public endpoint:

* `GATEWAY_URL=https://explore-fusion-gateway.onrender.com`

DB/JWT (set as needed):

* `MONGO_URI`
* `JWT_SECRET` (must match the gateway's JWT secret)

Upload (gateway exposes `/api/v1/upload`, `/uploads`, and `/imagekit-auth`; configure ImageKit keys so the POST `/api/v1/imagekit-auth` route can mint signed tokens):

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
* Upload: `GET https://explore-fusion-gateway.onrender.com/upload/health` (same data is available at `/api/v1/upload/health`)
* Admin: `GET https://explore-fusion-gateway.onrender.com/api/v1/admin/health`
* Notifications: `GET https://explore-fusion-gateway.onrender.com/api/v1/notifications/health`
* Matches: `GET https://explore-fusion-gateway.onrender.com/api/v1/matches/health`
* Posts: `GET https://explore-fusion-gateway.onrender.com/api/v1/posts/health`

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
Start client + gateway together for local development:
```bash
npm run dev
```

If you only want the backend (gateway):
```bash
npm run dev:gateway
```

---

## 🖼️ Image Uploads (ImageKit)

The preferred flow is direct client upload to ImageKit using a protected auth endpoint.

* Auth endpoint (protected): `POST /api/v1/imagekit-auth`
  * Via gateway (recommended): `http://localhost:5050/api/v1/imagekit-auth` (local) or `https://explore-fusion-gateway.onrender.com/api/v1/imagekit-auth` (prod)
  * Direct to gateway (same path as above) when you already know the exact host.
* The response shape must be exactly: `{ token, signature, expire }` (required by the ImageKit JS SDK).
* Upload files with `POST /api/v1/upload` (field name `image`); successful responses include an `imageUrl` under `/uploads`.

---

## 🧯 Troubleshooting

* **`Missing publicKey during ImageKit initialization`**
  * Ensure `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, and `IMAGEKIT_URL_ENDPOINT` are set.

* **Port already in use (`EADDRINUSE`)**
  * Stop the process using the port or change `PORT` / `GATEWAY_PORT`.
