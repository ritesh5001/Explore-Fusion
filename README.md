# WanderMatch

WanderMatch is a travel buddy matchmaking product with three apps in this repo:

- `backend`: Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Socket.io
- `frontend`: MERN website built with React, TypeScript, and Vite
- `mobile`: React Native app built with Expo

## Quick Start

```bash
npm run install:all
cp backend/.env.example backend/.env
docker compose up -d mongo
npm run backend
npm run frontend
npm run mobile
```

Default URLs:

- API: `http://localhost:4000`
- Website: `http://localhost:5173`
- MongoDB: `mongodb://localhost:27017/wandermatch`

## Project Structure

```text
backend/   Express API, MongoDB models, matching service, Socket.io
frontend/  React website for the MERN web experience
mobile/    Expo React Native app for iOS and Android
```

## MVP Scope

The current setup includes the foundation for registration/login, profiles, swipe discovery, matches, chats, trips, safety actions, and group trip browsing. Production services from the document such as S3, Twilio, SendGrid, Redis, Elasticsearch, payments, and ID verification are left as integration points.
