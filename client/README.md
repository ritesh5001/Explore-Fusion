# Explore Fusion Client (React + Vite)

Explore Fusion frontend built with React, Vite, and Tailwind.

## Run locally

From the repo root:

	npm --prefix client install
	npm --prefix client run dev

Run the full stack (client + gateway + services):

	npm run dev

## Environment variables

Create `client/.env` with:

- `VITE_API_BASE_URL` – API gateway base URL
  - Local: `http://localhost:5050`
  - Render: `https://explore-fusion-gateway.onrender.com`

Optional (ImageKit uploads):

- `VITE_IMAGEKIT_PUBLIC_KEY`
- `VITE_IMAGEKIT_URL_ENDPOINT`

## Universal profile system

- Route: `/users/:id` (protected)
- Feed post header shows author avatar + label and links to profiles
- Profile page shows avatar/name/username/bio, stats, follow/unfollow (role rules), and a posts grid

## Quality checks

	npm --prefix client run lint
	npm --prefix client run build
