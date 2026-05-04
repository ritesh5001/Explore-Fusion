# Explore Fusion

Explore Fusion is a travel buddy matchmaking platform for solo travelers. The repo contains one backend API, one MERN web app, and one Expo React Native mobile app.

The platform workflow is:

1. User registers or logs in.
2. User completes travel onboarding with preferences, trip dates, destination, profile photo, selfie, and optional ID document.
3. User account stays pending until admin review.
4. Admin approves or rejects the account, photo verification, and ID verification from `/admin`.
5. Approved users can discover compatible travelers.
6. Users swipe/like each other.
7. Mutual likes create matches.
8. Matches unlock chat.
9. Users can create or join group trips.

## Apps

```text
backend/   Express + TypeScript + MongoDB API
frontend/  React + Vite website
mobile/    Expo React Native mobile app
```

## Tech Stack

- Backend: Node.js, Express, TypeScript, Mongoose, MongoDB, JWT, Socket.io, Zod
- Web: React, TypeScript, Vite, React Router
- Mobile: Expo, React Native, React Navigation, React Native Paper, Redux Toolkit Query
- Database: MongoDB
- Local infra: Docker Compose for MongoDB

## Quick Start

Install all dependencies:

```bash
npm run install:all
```

Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp mobile/.env.example mobile/.env
```

Start MongoDB:

```bash
docker compose up -d mongo
```

Run backend and web together:

```bash
npm run dev
```

Run mobile:

```bash
npm run mobile
```

Default local URLs:

- Backend API: `http://localhost:4000`
- Web app: `http://localhost:5173`
- Expo Metro: `http://localhost:8081`
- MongoDB: `mongodb://localhost:27017/wandermatch`

If Vite uses another port such as `5174`, the backend CORS allowlist already supports local Vite ports.

## Root Scripts

- `npm run dev`: starts backend and frontend together
- `npm run backend`: starts Express API in watch mode
- `npm run frontend`: starts Vite web app
- `npm run mobile`: starts Expo
- `npm run build`: builds backend and frontend
- `npm run typecheck`: checks backend, frontend build, and mobile TypeScript
- `npm run install:all`: installs root, backend, frontend, and mobile dependencies

## Environment Variables

Backend `backend/.env`:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/wandermatch
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,https://explorefusion.online,https://www.explorefusion.online
ADMIN_TOKEN=replace_with_a_long_random_admin_token
```

Frontend `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000
```

Mobile `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

For Android Emulator, use:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

## Backend

The backend is in `backend/src`.

Main responsibilities:

- Register and login users
- Issue JWT tokens
- Store user profiles and onboarding data
- Store verification submission data
- Enforce account approval before discovery
- Calculate compatibility scores
- Store swipes and matches
- Store chat messages
- Store group trips
- Expose admin moderation controls
- Serve India destination options

### Models

`User`

- Basic identity: name, email, phone, date of birth, gender, home city
- Travel preferences: travel style, interests, languages, budget, dream destinations, trip plans
- Photos: profile photo list
- Approval state: `accountStatus`
- Verification state: `verificationStatus`, `photoVerificationStatus`, `isVerified`
- Verification submission: profile photo, selfie, optional ID document, note, review timestamps, rejection reason
- Onboarding state: `onboardingCompleted`

`Swipe`

- User who swiped
- Target user
- Swipe action: `left`, `right`, `super`
- Compatibility score at swipe time

`Match`

- Matched user IDs
- Match status
- Compatibility score
- Match timestamp

`Message`

- Match ID
- Sender
- Message body
- Message type

`Trip`

- Creator
- Destination
- Start/end dates
- Trip type
- Max members
- Members
- Tasks
- Expenses

### Auth And Account Rules

Users can register and login immediately, but discovery is blocked until:

- `onboardingCompleted` is true
- `accountStatus` is `approved`

Admin approval is required because the onboarding includes photo and identity verification review.

### Matching Logic

Compatibility is calculated in `backend/src/services/matching.service.ts`.

Weighted factors:

- Destination overlap: 30%
- Date overlap: 25%
- Travel style match: 20%
- Shared interests: 15%
- Budget compatibility: 10%

Only approved, onboarded users are returned from discovery.

### API Endpoints

Health:

- `GET /health`

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`

Destinations:

- `GET /api/destinations`
- `GET /api/destinations?q=jaipur`

Profile:

- `GET /api/profile/me`
- `PUT /api/profile/me`
- `PUT /api/profile/onboarding`
- `GET /api/profile/:userId`

Matching:

- `GET /api/match/discover`
- `POST /api/match/swipe`
- `GET /api/match/matches`

Trips:

- `GET /api/trips`
- `POST /api/trips`
- `POST /api/trips/:tripId/join`

Chat:

- `GET /api/chat/:matchId/messages`
- `POST /api/chat/:matchId/messages`

Admin:

- `GET /api/admin/summary`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:userId/moderation`

Admin routes require the `x-admin-token` header:

```bash
curl http://localhost:4000/api/admin/summary \
  -H "x-admin-token: dev-admin-token"
```

### Socket.io

Socket.io is configured for real-time chat events:

- `join_room`
- `send_message`
- `typing`

The current web chat uses REST messages. Socket.io is ready for upgrading the chat UI to live push updates.

## Web App

The web app is in `frontend/src`.

### Routes

- `/`: landing page
- `/auth`: login/register
- `/onboarding`: travel preferences and photo verification submission
- `/discover`: approved traveler discovery
- `/profile/:id`: public traveler profile
- `/matches`: mutual matches
- `/chat`: chat list
- `/chat/:id`: chat thread
- `/trips`: group trips
- `/admin`: admin moderation panel

### Web Workflow

Register/login:

- User creates account or logs in.
- Token and user are stored in local storage.
- If onboarding is incomplete, user is sent to `/onboarding`.

Onboarding:

- Travel style
- Languages
- Bio
- Interests
- Destination from backend India destination list
- Trip dates
- Budget range
- Profile photo
- Verification selfie
- Optional ID document
- Reviewer note

After onboarding:

- User account remains pending.
- Admin must approve the account before discovery works.

Admin panel:

- Opens at `/admin`.
- Admin enters `ADMIN_TOKEN`.
- Panel loads summary counts and users.
- Admin can approve/reject/suspend accounts.
- Admin can approve/reject photo verification.
- Admin can approve/reject ID verification.
- `isVerified` turns true when both photo and ID verification are approved.

Discover:

- Loads real approved users from `/api/match/discover`.
- Shows empty states if no users exist.
- Supports skip, like, and super like.
- Likes are saved through `/api/match/swipe`.

Matches:

- Loads real mutual matches from `/api/match/matches`.
- Opens chat for each match.

Chat:

- Loads messages from `/api/chat/:matchId/messages`.
- Sends messages through `POST /api/chat/:matchId/messages`.

Trips:

- Loads trips from `/api/trips`.
- Creates new group trips.
- Allows users to request/join a trip.

## Mobile App

The mobile app is in `mobile/src`.

### Mobile Screens

- `AuthScreen`: register/login
- `PreferencesScreen`: mobile onboarding
- `DiscoverScreen`: traveler discovery
- `TripsScreen`: group trips
- `SafetyScreen`: safety controls UI
- `ProfileScreen`: current user profile UI

### Mobile Workflow

Mobile starts with auth:

- User registers or logs in.
- Token and user are kept in React state.
- If onboarding is incomplete, the app shows `PreferencesScreen`.
- After onboarding, the tab navigator opens.

Mobile tabs:

- Discover
- Trips
- Safety
- Profile

Mobile API integration is handled with Redux Toolkit Query in `mobile/src/features/api.ts`.

Current mobile API-backed features:

- Register/login
- Complete onboarding
- Load discover profiles
- Load trips

Current mobile workflow notes:

- The mobile app follows the same backend approval rules as web.
- Discovery can return an account-approval error until admin approval is complete.
- The mobile onboarding sends a verification package to the backend.
- The web app currently has the more complete admin, matches, and chat UI.

## Admin Workflow

Use this flow to test the full platform locally:

1. Register a user from web or mobile.
2. Complete onboarding with travel preferences and photos.
3. Open `/admin`.
4. Enter the admin token from `backend/.env`.
5. Approve the user account.
6. Approve photo verification.
7. Approve ID verification if an ID was submitted.
8. Register and approve a second user.
9. Both users can now appear in discovery.
10. User A likes User B.
11. User B likes User A.
12. A match is created.
13. Chat unlocks for the match.

## Production Deployment

Backend deployment:

- Build command: `npm --prefix backend run build`
- Start command: `npm --prefix backend run start`
- Required env vars: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `ADMIN_TOKEN`

Frontend deployment:

- Build command: `npm --prefix frontend run build`
- Output directory: `frontend/dist`
- Required env var: `VITE_API_URL`

Mobile:

- Configure `EXPO_PUBLIC_API_URL` for the deployed backend.
- Use Expo/EAS for production builds when needed.

Production CORS:

Set `CLIENT_ORIGIN` to every web origin that should call the API, for example:

```env
CLIENT_ORIGIN=https://explorefusion.online,https://www.explorefusion.online
```

Do not ship production with `ADMIN_TOKEN=dev-admin-token`.

## Verification Commands

Run all checks:

```bash
npm run typecheck
```

Build backend and frontend:

```bash
npm run build
```

Check API health:

```bash
curl http://localhost:4000/health
```

Check admin auth:

```bash
curl http://localhost:4000/api/admin/summary \
  -H "x-admin-token: dev-admin-token"
```

Check destinations:

```bash
curl http://localhost:4000/api/destinations
```

## Current Limitations

- Photo and ID uploads are currently stored as URL/base64 strings in MongoDB for prototype workflow. Production should move files to S3 or another object store.
- Payments and subscriptions are not implemented yet.
- Twilio OTP, SendGrid email, Redis, Elasticsearch, and AWS infrastructure are planned production integrations.
- Mobile does not yet include a full admin UI.
- Web chat uses REST polling/manual refresh style behavior; Socket.io server support exists for live messaging.
