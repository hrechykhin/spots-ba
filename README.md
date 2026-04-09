# Spots BA

A cafe discovery app for Bratislava. Browse, filter, and map specialty coffee spots across the city.

**Live:** [talented-emotion-production.up.railway.app](https://talented-emotion-production.up.railway.app) &nbsp;·&nbsp; **Stack:** React · Django · PostgreSQL · Docker

---

## Features

- Listing grid with filters: district, minimum rating, tags, and full-text search
- Full detail pages: photos, opening hours, Google rating, address, and contacts
- Interactive map with pins for every cafe and a "locate me" button
- Cafe data synced from the Google Places API (ratings, photos, hours, links)
- Django Admin for content management without writing code

## Tech

| Layer | Tech |
|---|---|
| Frontend | React, TypeScript, Vite, React Query, Leaflet, Tailwind CSS |
| Backend | Django, Django REST Framework |
| Database | PostgreSQL 16 |
| Infra | Docker Compose (local), Railway (production) |

## Architecture

```
Browser → nginx (port 80)
              ├── /        → React SPA (static files)
              └── /api/*   → Django REST API
                                 └── PostgreSQL
```

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/cafes` | List cafes. Supports `?district=`, `?min_rating=`, `?tags=`, `?q=`, `?limit=`, `?offset=` |
| `GET` | `/cafes/map` | Lightweight list (id, name, lat/lng, rating) for map pins |
| `GET` | `/cafes/{slug}` | Full cafe detail by slug or UUID |

## Run locally

**Prerequisites:** Docker Desktop

```bash
git clone <repo-url> && cd spots-ba
cp backend/.env.example backend/.env
docker compose up --build
```

| Service | URL |
|---|---|
| App | http://localhost |
| Django Admin | http://localhost:8001/admin/ |
| API | http://localhost:8001/cafes |

On first run, create an admin user:

```bash
docker compose exec backend python manage.py createsuperuser
```

## Tests

```bash
# Frontend (Vitest + Testing Library)
cd frontend && npm test

# Backend (Django)
docker compose exec backend python manage.py test cafes
```
