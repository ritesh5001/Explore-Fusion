# 🌍 Explore Fusion - AI-Powered Travel Microservices App

**Explore Fusion** is a comprehensive travel ecosystem built on a **Microservices Architecture**. It connects travelers with influencers, provides AI-driven trip planning, facilitates a marketplace for travel packages, and enables real-time community chat.

## 🚀 Key Features

### 🤖 AI-Powered Tools (Google Gemini Integration)
* **AI Trip Planner:** Generates detailed, day-by-day itineraries with cost estimates based on destination, budget, and duration.
* **Travel Buddy Matcher:** Creates a persona of an ideal travel companion based on your travel style and interests.

### 💼 Marketplace & Influencer Platform
* **Creator Dashboard:** Influencers can upload visuals and list travel packages.
* **Sales Tracking:** Creators can view real-time bookings and estimated revenue.
* **Booking System:** Users can browse and purchase exclusive travel packages.

### 💬 Real-Time Communication
* **Community Chat:** Instant, bidirectional messaging using **Socket.IO**.
* **Global Lounge:** Travelers can discuss plans in a shared live room.

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
* **Auth Service:** JWT, Bcrypt
* **Post Service:** Social feed management
* **Booking Service:** Marketplace logic & Order management
* **AI Service:** Google Gemini API (`@google/generative-ai`)
* **Upload Service:** Multer (File Handling)
* **Chat Service:** Socket.IO (Real-time WebSocket)
* **Database:** MongoDB (Mongoose)

---

## 🏗️ Architecture

The application uses an **API Gateway (Port 5050)** to route requests to independent microservices:

| Service | Port | Description |
| :--- | :--- | :--- |
| **Gateway** | `5050` | Unified entry point for the frontend |
| **Auth** | `5001` | Handles User Registration & Login |
| **Post** | `5002` | Manages User Posts & Feeds |
| **Booking** | `5003` | Handles Packages, Itineraries & Orders |
| **AI** | `5004` | Connects to Google Gemini for AI features |
| **Upload** | `5005` | Handles File/Image Storage |
| **Chat** | `5006` | WebSocket Server for Real-Time Chat |
| **Client** | `5173` | React Frontend |

---

## ⚙️ Installation & Setup

### 1. Prerequisites
* Node.js installed
* MongoDB installed and running locally (or MongoDB Atlas URI)
* Google Gemini API Key

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
This repo ignores `.env` files (they are required locally).

Common ones used by the services:
* `MONGO_URI` (auth/post/booking services)
* `JWT_SECRET` (auth service)
* `GEMINI_API_KEY` and optional `GEMINI_MODEL` (ai service)

### 5. Run Everything (One Command)
Start client + gateway + all microservices together:
```bash
npm run dev
```

If you only want the backend processes (gateway + services):
```bash
npm run start
```
