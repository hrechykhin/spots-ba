# Spots BA

A cafe discovery app for Bratislava. Browse, filter, and map specialty coffee spots across the city.

**Live:** [spots-ba.up.railway.app](https://spots-ba.up.railway.app) &nbsp;·&nbsp; **Stack:** React · Django · PostgreSQL · Docker

---

## Features

- Listing grid with filters: district, minimum rating, tags, and full-text search
- Full detail pages: photos, opening hours, Google rating, address, and contacts
- Interactive map with pins for every cafe and a "locate me" button
- Cafe data synced from Google Places API (ratings, photos, hours, links)
- Django Admin for content management

## Tech

| Layer | Tech |
|---|---|
| Frontend | React, TypeScript, Vite, React Query, Leaflet, Tailwind CSS |
| Backend | Django, Django REST Framework, PostgreSQL |
| Infra | Docker Compose (local), Railway (production) |

## Run locally

```bash
git clone <repo-url> && cd spots-ba
cp backend/.env.example backend/.env   # add GOOGLE_PLACES_API_KEY if needed
docker compose up --build
```

App at **http://localhost** · Admin at **http://localhost:8001/admin/**

See [DEVELOPMENT.md](DEVELOPMENT.md) for backend/frontend setup without Docker, Google Places sync, deployment notes, and test instructions.
