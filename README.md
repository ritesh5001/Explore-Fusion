# 🌍 Explore Fusion - AI-Powered Travel Microservices App

**Explore Fusion** is a comprehensive travel ecosystem built on a **Microservices Architecture**. It connects travelers with influencers, provides AI-driven trip planning, and facilitates a marketplace for travel packages.

## 🚀 Key Features

### 🤖 AI-Powered Tools (Google Gemini Integration)

* **AI Trip Planner:** Generates detailed, day-by-day itineraries with cost estimates based on destination, budget, and duration.
* **Travel Buddy Matcher:** Creates a persona of an ideal travel companion based on your travel style and interests.

### 💼 Marketplace & Influencer Platform

* **Creator Dashboard:** Influencers can create and list travel packages.
* **Sales Tracking:** Creators can view real-time bookings and estimated revenue.
* **Booking System:** Users can browse and purchase exclusive travel packages.

### 📱 Social & Core Features

* **Social Feed:** Users can share travel experiences and locations.
* **Authentication:** Secure JWT-based login and registration.
* **Personalized Dashboard:** "My Trips" view combining AI-saved plans and booked packages.

---

## 🛠️ Tech Stack

**Frontend:**

* React.js (Vite)
* Tailwind CSS
* Axios & React Router

**Backend (Microservices):**

* **API Gateway:** Node.js, Express, `http-proxy-middleware`
* **Auth Service:** JWT, Bcrypt
* **Post Service:** Social feed management
* **Booking Service:** Marketplace logic & Order management
* **AI Service:** Google Gemini API (`@google/generative-ai`)
* **Database:** MongoDB (Mongoose)

---

## 🏗️ Architecture

The application uses an **API Gateway (Port 5050)** to route requests to independent microservices:

| Service | Port | Description |
| --- | --- | --- |
| **Gateway** | `5050` | Unified entry point for the frontend |
| **Auth** | `5001` | Handles User Registration & Login |
| **Post** | `5002` | Manages User Posts & Feeds |
| **Booking** | `5003` | Handles Packages, Itineraries & Orders |
| **AI** | `5004` | Connects to Google Gemini for AI features |
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

### 3. Setup Environment Variables

Create a `.env` file in `services/ai-service`:

```env
PORT=5004
GEMINI_API_KEY=your_google_gemini_key
GEMINI_MODEL=gemini-1.5-flash

```

*(Other services use default MongoDB/Port settings, but can be configured similarly if needed)*

### 4. Install Dependencies

Run this command in the root terminal to install dependencies for all folders (or go into each folder manually):

**Gateway:**

```bash
cd gateway && npm install

```

**Services:**

```bash
cd ../services/auth-service && npm install
cd ../post-service && npm install
cd ../booking-service && npm install
cd ../ai-service && npm install

```

**Client:**

```bash
cd ../../client && npm install

```

---

## 🚀 Running the Project

You need to run the **Gateway**, all **4 Services**, and the **Client** simultaneously.

**Option A: Manual Start (Open 6 Terminals)**

1. `cd gateway` -> `node server.js`
2. `cd services/auth-service` -> `npm run dev`
3. `cd services/post-service` -> `npm run dev`
4. `cd services/booking-service` -> `npm run dev`
5. `cd services/ai-service` -> `npm run dev`
6. `cd client` -> `npm run dev`

**Option B: Using Concurrently (Recommended)**
If you installed `concurrently` in the root, you can run:

```bash
npm run start

```

---

## 📸 Screenshots

*(You can upload screenshots to your repo and link them here)*

| Home Feed | AI Planner | Creator Dashboard |
| --- | --- | --- |
|  |  |  |

---

## 🔮 Future Enhancements

* [ ] Integration with Stripe/Razorpay for real payments.
* [ ] Real-time Chat between Travellers and Buddy Matches.
* [ ] Email notifications for booking confirmations.

## 👤 Author

**Your Name**

* [GitHub](https://www.google.com/search?q=https://github.com/your-username)
* [LinkedIn](https://linkedin.com/in/your-profile)

---

**Made with ❤️ using the MERN Stack**
