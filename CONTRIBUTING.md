# Contributing to Folio

Thanks for your interest in contributing. Folio is a small, focused project and contributions are welcome — bug fixes, feature additions, and improvements to the self-hosting experience are all fair game.

## Before You Start

For anything beyond a small bug fix, open an issue first to describe what you want to do and why. This avoids wasted effort if the change doesn't fit the direction of the project. For bug fixes and obvious improvements, feel free to go straight to a pull request.

## Getting Started

### 1. Fork and clone

```bash
git clone https://github.com/your-username/folio.git
cd folio
```

### 2. Set up the environment

```bash
cp .env.example .env
```

Fill in your `.env` — refer to the README for what each variable does. For local development you'll need a YouTube API key and a Cloudflare R2 bucket, or you can stub those out if you're not working on those features.

### 3. Start the dev environment

```bash
docker-compose up --build
```

The frontend at `http://localhost:5173` and backend at `http://localhost:8000` will both hot-reload on file changes.

## Making Changes

### Backend (Python / FastAPI)

- Routes live in `backend/app/api/v1/routes/`
- Pydantic models in `backend/app/models/`
- Business logic in `backend/app/services/`
- Keep route handlers thin — push logic into services where it makes sense
- All endpoints must be user-scoped. Every DB query that touches user data must filter by `user_id`
- Do not disable authentication on any existing route

### Frontend (React / Vite)

- Pages in `frontend/src/pages/`, reusable components in `frontend/src/components/`
- API calls go in `frontend/src/api/` — one file per domain
- Use inline styles, not Tailwind classes in JSX
- State management via Zustand (`frontend/src/store/`)
- The Axios client in `frontend/src/api/client.js` handles token refresh automatically — don't bypass it

### General

- Don't add dependencies without a strong reason
- Don't add features that are explicitly listed as out of scope in the README (time tracking, analytics, nested folders, multi-user admin, mobile)
- Keep changes focused — one thing per pull request

## Pull Request Guidelines

- **Branch name**: use a short descriptive name, e.g. `fix/continue-button` or `feat/label-colors`
- **Commits**: write clear commit messages that describe what changed and why, not just what files were touched
- **PR description**: explain what the change does, why it's needed, and how you tested it
- **Scope**: keep PRs small and focused — a large PR that touches many unrelated things is harder to review and more likely to be declined

## Reporting Bugs

Open an issue with:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Your environment (OS, Docker version, browser if frontend)

## Code of Conduct

Be straightforward and respectful. Feedback on code is not feedback on you as a person. If a contribution isn't accepted, it's about fit and scope, not about the quality of your effort.
