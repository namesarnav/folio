# Folio

## The Problem

Learning resources are scattered everywhere. You save a YouTube playlist to watch later, bookmark a few research papers, buy a book, and enroll in an online course — then lose track of all of it. There's no single place that handles the full range of what people actually learn from: videos, PDFs, books, papers, and structured courses all live in different apps with no unified view of your progress.

Generic tools like Notion or spreadsheets can be forced into this role, but they require constant manual upkeep and offer no real integration with the content itself — you're just maintaining a list, not actually tracking learning. Purpose-built apps either lock you into one content type (read-it-later apps, Kindle, Coursera) or are too heavyweight, adding time tracking, spaced repetition, and social features that get in the way.

The result: most people have a graveyard of saved resources they never return to, and no honest picture of what they're actually making progress on.

## What Folio Does

Folio is a self-hosted personal learning tracker that treats your time and attention as the scarce resource. It gives you one place to manage everything you're learning from, with just enough structure to stay on top of it — without turning progress tracking into a second job.

**YouTube Playlists** are imported directly from a URL. Folio fetches the full playlist via the YouTube API, stores it locally, and turns it into an interactive course tracker with a video list grouped by section, an embedded player, per-video completion toggles, and timestamped notes. You never lose your place.

**PDFs and Books** track reading progress by page. PDFs open in a built-in viewer that restores your last page automatically. Books track current page against total pages.

**Research Papers** store full metadata — authors, abstract, venue, year, DOI — alongside the PDF if you have it.

**External Courses** (Udemy, Coursera, etc.) let you track progress manually with a platform label and estimated hours.

Everything is organized with **folders** and **color-coded labels**, filterable from the sidebar. A dashboard shows what you're actively working on and what you recently added.

## Self-Hosting with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed
- A [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com) key (for playlist imports)
- A [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket (for PDF/file uploads) — the free tier is more than enough for personal use

### 1. Clone the repository

```bash
git clone https://github.com/arnavvtiwari/folio.git
cd folio
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in every value:

```env
# MongoDB
MONGO_URI=mongodb://mongo:27017
MONGO_DB_NAME=folio

# Auth
JWT_SECRET=your-secret-key-here

# YouTube Data API v3
YOUTUBE_API_KEY=your-youtube-api-key

# Cloudflare R2
R2_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-bucket-name
```

**Notes:**
- `JWT_SECRET` should be a long random string. You can generate one with `openssl rand -hex 32`.
- `MONGO_URI` should stay as `mongodb://mongo:27017` when running via Docker Compose — this points to the bundled MongoDB container.
- For R2, create a bucket and an API token with Object Read & Write permissions from the [Cloudflare dashboard](https://dash.cloudflare.com/).

### 3. Build and start

```bash
docker-compose up --build
```

This starts three containers: MongoDB, the FastAPI backend, and the React frontend served via nginx.

| Service | URL |
|---|---|
| App | http://localhost:5173 |
| API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |

### 4. Create your account

Open http://localhost:5173, click **Sign up**, and create an account. All data is scoped to your user — you can create multiple accounts on the same instance.

### Stopping and restarting

```bash
# Stop
docker-compose down

# Restart (no rebuild needed unless you change code)
docker-compose up
```

### Persisting data

MongoDB data is stored in a named Docker volume (`mongo_data`). It persists across restarts and `docker-compose down`. To wipe all data:

```bash
docker-compose down -v
```

### Updating

```bash
git pull
docker-compose up --build
```

## Stack

- **Frontend** — React + Vite, Zustand, Axios
- **Backend** — Python 3.12, FastAPI, Motor (async MongoDB driver)
- **Database** — MongoDB 7
- **File Storage** — Cloudflare R2 (S3-compatible)
- **Auth** — JWT access tokens (in-memory) + httpOnly refresh cookie
