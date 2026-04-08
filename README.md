# Spots BA

A cafe discovery web app for Bratislava, Slovakia. Browse cafes by rating, district, and vibe. Full table booking integration is coming in a future release.

## How It Works

The app is split into three services that run together via Docker Compose.

```
Browser → nginx (port 80)
              ├── /         → React SPA (static files)
              └── /api/*    → Django backend (port 8000)
                                  └── PostgreSQL (port 5432)
```

On Railway, the frontend calls the backend directly via its public URL — nginx is used only for serving the SPA and local Docker proxying.

### Frontend

Built with React + Vite + TypeScript. Served as static files by nginx.

Three pages:
- **`/`** — Cafe listing grid with pagination (9 per page). Filter by district, minimum rating, or tags (specialty coffee, wifi, dog friendly, etc.)
- **`/cafe/:id`** — Full detail page: photos, Google rating, opening hours, address, contacts, and an embedded map. Includes a "Book a Table" button (disabled — coming soon).
- **`/map`** — Full-screen interactive map with a pin for every cafe. Click a pin to see a quick summary and link to the detail page.

All data is fetched from the backend API using React Query, which handles caching and loading states.

### Backend

Built with Django + Django REST Framework (Python). Exposes a REST API consumed by the frontend and a Django Admin UI for content management.

Key endpoints:

| Method | Path | Description |
|---|---|---|
| `GET` | `/cafes` | List published cafes. Supports `?district=`, `?min_rating=`, `?tags=`, `?q=`, `?limit=`, `?offset=`. Returns `{total, results}`. |
| `GET` | `/cafes/map` | Lightweight list (id, name, lat, lng, rating) for map pins |
| `GET` | `/cafes/{slug}` | Full cafe detail, by slug or UUID |
| `POST` | `/bookings` | *(501 — coming soon)* |

The Django Admin panel at `/admin/` provides full CRUD for cafes without writing code.

Database migrations are managed automatically by Django (`manage.py migrate` runs on every container start).

### Database

PostgreSQL 16. Two tables:

- **`cafes_cafe`** — all cafe data: name, slug, address, coordinates, Google rating, opening hours (JSON), photos (JSON array of CDN URLs), tags, and flags for `is_published` and `accepts_bookings`.
- **`cafes_booking`** — guest name, email, phone, party size, scheduled datetime, and status (`pending / confirmed / cancelled / no_show`). Not yet used by the UI.

---

## Running Locally with Docker

**Prerequisites:** Docker Desktop

```bash
# 1. Clone and enter the project
git clone <repo-url>
cd spots-ba

# 2. Create the backend env file
cp backend/.env.example backend/.env
# Edit backend/.env — at minimum add your GOOGLE_PLACES_API_KEY

# 3. Build and start all three services
docker compose up --build

# 4. On first run: create a superuser
docker compose exec backend python manage.py createsuperuser
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
spots-ba/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── entrypoint.sh              # runs migrate + seed + collectstatic + gunicorn
│   ├── sync_all.sh                # runs all Google Places sync queries in sequence
│   ├── requirements.txt
│   ├── manage.py
│   ├── places_ba/                 # Django project package
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── cafes/                     # Django app
│       ├── models.py              # Cafe + Booking models
│       ├── admin.py               # Django Admin config
│       ├── serializers.py         # DRF serializers (map pin / list / detail)
│       ├── views.py               # DRF views with filtering + pagination
│       ├── urls.py
│       ├── google_places.py       # Google Places API client + photo fetching
│       ├── tests.py               # Backend test suite
│       ├── migrations/
│       └── management/commands/
│           ├── seed_cafes.py          # seeds 8 initial cafes
│           └── sync_from_google.py    # bulk-imports cafes from Google Places
└── frontend/
    ├── Dockerfile
    ├── nginx.conf                 # serves SPA, proxies /api to backend (local only)
    └── src/
        ├── api/cafes.ts           # typed fetch functions
        ├── hooks/useCafes.ts      # React Query hooks
        ├── types/cafe.ts          # TypeScript types mirroring API schemas
        ├── components/            # CafeCard, CafeMap, OpeningHours, PhotoGallery, RatingBadge
        ├── pages/                 # ListingPage, DetailPage, MapPage
        └── test/setup.ts          # Vitest + Testing Library setup
```

---

## Adding and Managing Cafes

### Django Admin (recommended)

Go to **http://localhost:8001/admin/cafes/cafe/** and click **Add cafe**. The slug is auto-filled from the name. Set `is_published` when the cafe is ready to go live.

### Seed script (initial data)

The repo ships with 8 real Bratislava cafes. Run once after first setup:

```bash
docker compose exec backend python manage.py seed_cafes
```

The command is idempotent — safe to run multiple times.

---

## Google Places Integration

Cafes can be discovered and synced from the Google Places API. This fills in ratings, addresses, opening hours, phone numbers, links, and **photos** automatically.

### Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Places API (New)**
3. Create an API key
4. Add it to `backend/.env`:

```
GOOGLE_PLACES_API_KEY=AIza...
```

### Bulk import

Run multiple queries to maximize coverage (Google caps each query at 60 results):

```bash
# Run all queries at once using the sync script
docker compose exec backend sh sync_all.sh

# Or run individual queries
docker compose exec backend python manage.py sync_from_google \
  --query "specialty coffee Bratislava" --max 60 --publish
```

Options:
- `--query` — custom search query (default: `"cafes in Bratislava Slovakia"`)
- `--max` — limit results (default: 60, max per query is 60)
- `--publish` — auto-publish all imported cafes

Cafes are matched by `google_place_id` — re-running updates existing records instead of creating duplicates.

### Photos

During sync, up to 5 photos per cafe are fetched from Google Places and stored as CDN URLs in the `photos` JSON field. These URLs can expire over time. For permanent storage, upload photos to Cloudinary or S3 and replace the URLs.

### Billing

Google Places API (as of 2025) — $200/month free credit applies:
- Text Search: ~$0.032 per request
- Place Details: ~$0.017 per request
- Photo URL: ~$0.007 per request

Syncing 60 cafes with 5 photos each costs roughly $2.

---

## Tests

**Frontend** (Vitest + Testing Library):

```bash
cd frontend
npm test
```

Covers: `RatingBadge`, `CafeCard`, and `api/cafes` fetch functions.

**Backend** (Django test runner):

```bash
docker compose exec backend python manage.py test cafes
```

Covers: list filtering, pagination, published-only enforcement, detail by slug/UUID, and map pins.

---

## Deployment (Railway)

### Services

Deploy as two Railway services from the same GitHub repo:

| Service | Root Dir | Key Variables |
|---|---|---|
| backend | `backend` | `SECRET_KEY`, `DATABASE_URL` (link from Postgres plugin), `ALLOWED_HOSTS`, `CORS_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `GOOGLE_PLACES_API_KEY` |
| frontend | `frontend` | `VITE_API_BASE_URL` (full backend URL), `BACKEND_HOST=localhost` |

### Steps

1. Create a Railway project → **+ New** → GitHub repo → set root dir to `backend`
2. Add a PostgreSQL plugin — Railway injects `DATABASE_URL` automatically
3. Add a second service for the frontend with root dir `frontend`
4. Generate a domain for both services (**Settings → Networking → Generate Domain**)
5. Set `VITE_API_BASE_URL=https://your-backend.up.railway.app` in the frontend Variables
6. Set `CORS_ORIGINS` and `CSRF_TRUSTED_ORIGINS` to your frontend domain in the backend Variables
7. Push to GitHub — both services deploy automatically

Migrations and seeding run automatically on every deploy via `entrypoint.sh`.

### Run management commands on Railway

Use the Railway dashboard: **Settings → Deploy → Start Command**, set the command, redeploy, then clear it and redeploy again to restore normal startup.

### Database GUI

Connect to Railway Postgres using the public connection string:
- [TablePlus](https://tableplus.com) (Mac/Windows, free tier)
- [DBeaver](https://dbeaver.io) (free, cross-platform)
