# Places BA

A cafe discovery web app for Bratislava, Slovakia. Browse cafes by rating, district, and vibe. Full table booking integration is coming in a future release.

## How It Works

The app is split into three services that run together via Docker Compose.

```
Browser → nginx (port 80)
              ├── /         → React SPA (static files)
              └── /api/*    → Django backend (port 8000)
                                  └── PostgreSQL (port 5432)
```

### Frontend

Built with React + Vite + TypeScript. Served as static files by nginx.

Three pages:
- **`/`** — Cafe listing grid. Filter by district, minimum rating, or tags (specialty coffee, wifi, dog friendly, etc.)
- **`/cafe/:id`** — Full detail page: photos, Google rating, opening hours with live open/closed status, address, contacts, and an embedded map. Includes a "Book a Table" button (disabled — coming soon).
- **`/map`** — Full-screen interactive map with a pin for every cafe. Click a pin to see a quick summary and link to the detail page.

All data is fetched from the backend API using React Query, which handles caching and loading states.

### Backend

Built with Django + Django REST Framework (Python). Exposes a REST API consumed by the frontend and a Django Admin UI for content management.

Key endpoints:

| Method | Path | Description |
|---|---|---|
| `GET` | `/cafes` | List published cafes. Supports `?district=`, `?min_rating=`, `?tags=`, `?q=`, `?limit=`, `?offset=` |
| `GET` | `/cafes/map` | Lightweight list (id, name, lat, lng, rating) for map pins |
| `GET` | `/cafes/{slug}` | Full cafe detail, by slug or UUID |
| `POST` | `/bookings` | *(501 — coming soon)* |

The Django Admin panel at `/admin/` provides full CRUD for cafes without writing code.

Database migrations are managed automatically by Django (`manage.py migrate` runs on every container start).

### Database

PostgreSQL 16. Two tables:

- **`cafes_cafe`** — all cafe data: name, slug, address, coordinates, Google rating, opening hours (JSON), photos (JSON array of URLs), tags, and flags for `is_published` and `accepts_bookings`.
- **`cafes_booking`** — guest name, email, phone, party size, scheduled datetime, and status (`pending / confirmed / cancelled / no_show`). Not yet used by the UI.

---

## Running Locally with Docker

**Prerequisites:** Docker Desktop

```bash
# 1. Clone and enter the project
git clone <repo-url>
cd places-ba

# 2. Create the backend env file
cp backend/.env.example backend/.env
# Edit backend/.env — at minimum add your GOOGLE_PLACES_API_KEY if you want Google sync

# 3. Build and start all three services
docker compose up --build

# 4. On first run: create a superuser and seed the database
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py seed_cafes
```

The app is now running at **http://localhost**.

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Django Admin | http://localhost:8001/admin/ |
| API | http://localhost:8001/cafes |
| PostgreSQL | localhost:5434 |

To stop: `docker compose down`
To stop and wipe the database: `docker compose down -v`

---

## Running Locally Without Docker

Useful during development when you want hot-reload.

**Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — set DATABASE_URL to your local Postgres instance
# e.g. DATABASE_URL=postgresql://user:password@localhost:5432/places_ba

python manage.py migrate
python manage.py createsuperuser
python manage.py seed_cafes

python manage.py runserver
# API + Admin running at http://localhost:8000
```

**Frontend**

```bash
cd frontend
npm install

cp .env.example .env.local
# .env.local content: VITE_API_BASE_URL=http://localhost:8000

npm run dev
# App running at http://localhost:5173
```

---

## Project Structure

```
places-ba/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── entrypoint.sh          # runs migrate + collectstatic + gunicorn
│   ├── requirements.txt
│   ├── manage.py
│   ├── places_ba/             # Django project package
│   │   ├── settings.py
│   │   ├── urls.py            # mounts /admin/ and cafes routes
│   │   └── wsgi.py
│   └── cafes/                 # Django app
│       ├── models.py          # Cafe + Booking models
│       ├── admin.py           # Django Admin config (list, fieldsets, Google sync action)
│       ├── serializers.py     # DRF serializers (map pin / list / detail)
│       ├── views.py           # DRF views with filtering
│       ├── urls.py
│       ├── google_places.py   # Google Places API client
│       ├── migrations/
│       └── management/commands/
│           ├── seed_cafes.py      # seeds 8 initial Bratislava cafes
│           └── sync_from_google.py  # bulk-imports cafes from Google Places
└── frontend/
    ├── Dockerfile
    ├── nginx.conf             # serves SPA, proxies /api to backend
    └── src/
        ├── api/cafes.ts       # typed fetch functions
        ├── hooks/useCafes.ts  # React Query hooks
        ├── types/cafe.ts      # TypeScript types mirroring API schemas
        ├── components/        # CafeCard, CafeMap, OpeningHours, PhotoGallery, RatingBadge
        └── pages/             # ListingPage, DetailPage, MapPage
```

---

## Adding and Managing Cafes

### Django Admin (recommended)

Go to **http://localhost:8001/admin/cafes/cafe/** and click **Add cafe**. The slug is auto-filled from the name. Set `is_published` when the cafe is ready to go live.

From the list view you can toggle `is_published` inline without opening each cafe.

### Seed script (initial data)

The repo ships with 8 real Bratislava cafes. Run once after first setup:

```bash
docker compose exec backend python manage.py seed_cafes
```

The command is idempotent — safe to run multiple times.

---

## Google Places Integration

Cafes can be discovered and synced from the Google Places API. This fills in ratings, addresses, opening hours, phone numbers, and links automatically.

### Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Places API (New)**
3. Create an API key and restrict it to your server IP
4. Add it to `backend/.env`:

```
GOOGLE_PLACES_API_KEY=AIza...
```

### Bulk import (management command)

```bash
# Import cafes from Google Places — unpublished by default so you can review first
docker compose exec backend python manage.py sync_from_google

# Options:
#   --query "specialty coffee Bratislava"   custom search query
#   --max 40                                limit number of results (default: 60)
#   --publish                               auto-publish all imported cafes
```

Cafes are matched by `google_place_id` so re-running the command updates existing records instead of creating duplicates.

### Refresh from Admin UI

1. Open **Django Admin → Cafes**
2. Select one or more cafes
3. Actions dropdown → **"Sync selected cafes with Google Places"** → Go

This updates rating, review count, opening hours, phone, and website from Google. It never overwrites your slug or description.

### Billing

Google Places API pricing (as of 2025):
- Text Search: ~$0.017 per request
- Place Details: ~$0.017 per request

Importing 60 cafes costs roughly $1. Running the sync action on existing cafes is one Place Details request per cafe.

---

## Deployment

Everything can be hosted on [Railway](https://railway.app) — no other platform needed for MVP.

### All on Railway (recommended for MVP)

Railway runs Docker containers and has a native managed Postgres service. All three services live in one Railway project and communicate over Railway's private network.

**1. Create a Railway project and add three services:**

| Service | Type | Config |
|---|---|---|
| `db` | Railway Postgres | Created from the Railway dashboard — gives you a `DATABASE_URL` |
| `backend` | Docker (from repo `/backend`) | Set `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, `GOOGLE_PLACES_API_KEY` |
| `frontend` | Docker (from repo `/frontend`) | No env vars needed — nginx proxies `/api` to the backend service |

**2. Link the backend to the database**

In the backend service settings, add the `DATABASE_URL` variable. Copy the internal connection string from the Railway Postgres service (uses `railway.internal` hostname — stays within the private network).

Set `DEBUG=false` and generate a strong `SECRET_KEY` for production.

**3. First deploy**

Migrations run automatically on every deploy via `entrypoint.sh`. After the first deploy, run once via the Railway shell:

```bash
python manage.py createsuperuser
python manage.py seed_cafes      # optional — or add cafes via Admin
```

**4. Connect frontend to backend**

In the nginx config the frontend proxies `/api` to `backend:8000`. On Railway, update `nginx.conf` to use the Railway internal hostname for the backend service.

### Photo storage

Railway has no object storage. For MVP, cafe photos are referenced as external URLs in the database — paste any publicly accessible image URL into the `photos` JSON array for each cafe via the Admin. When you're ready to upload real photos, add [Cloudflare R2](https://developers.cloudflare.com/r2/) (free 10 GB tier, S3-compatible).

### Managing the database

Use any Postgres GUI with the public connection string Railway provides:
- [TablePlus](https://tableplus.com) (Mac/Windows, free tier)
- [DBeaver](https://dbeaver.io) (free, cross-platform)
