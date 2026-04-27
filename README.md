# FlowCast

## Overview
FlowCast is a personal finance management application that helps users track income, expenses, and financial health over time. Users can log transactions, set up recurring rules, run what-if scenarios, set savings goals, and view cash flow forecasts up to 2 years ahead — all with per-user account authentication and cloud-synced data.

**Live app:** https://fehmaanalikhan.github.io/FlowCast

## How to Run

### Local development
```bash
# 1. Clone the repo
git clone https://github.com/FehmaanAliKhan/FlowCast.git
cd FlowCast

# 2. Start the backend
cd backend
pip install -r requirements.txt
python app.py
# Runs on http://localhost:3001 with SQLite (no setup needed)

# 3. Serve the frontend
cd ..
python3 -m http.server 8000
# Open http://localhost:8000
```

### Environment variables (production)
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Supabase) |
| `JWT_SECRET` | Secret key for signing JWT tokens |

## Tech Stack
- **Frontend:** HTML, CSS (Tailwind via CDN), React 18 (UMD/CDN), Babel standalone, Recharts
- **Backend:** Python 3, Flask, Flask-CORS, SQLAlchemy
- **Auth:** JWT (PyJWT), bcrypt password hashing
- **Database:** SQLite (local dev), PostgreSQL via Supabase (production)
- **Hosting:** GitHub Pages (frontend), Railway (backend)

## Architecture

```
FlowCast/
├── index.html          # Entry point, loads all scripts
├── lib.js              # Utility helpers (Money, Dates, Storage)
├── engine.js           # Forecast engine (pure JS, no React)
├── seed.js             # Sample data generator
├── api.js              # Frontend API client (fetch wrapper)
├── state.jsx           # React context + useReducer store
├── ui.jsx              # Shared UI components (Card, Button, Input…)
├── nav.jsx             # Sidebar + bottom tab navigation
├── auth.jsx            # Login / register screen
├── welcome.jsx         # Onboarding screen
├── dashboard.jsx       # Main dashboard with charts and KPIs
├── transactions.jsx    # Transaction list and form
├── recurring.jsx       # Recurring rules management
├── scenarios.jsx       # What-if scenario planner
├── goals.jsx           # Savings goals tracker
├── settings.jsx        # App settings + change password
└── backend/
    ├── app.py          # Flask REST API
    └── requirements.txt
```

The frontend is a single-page app using React loaded via CDN (no build step). Global state is managed with `useReducer` + Context. The backend is a stateless REST API; all app state is stored as a JSON blob per user in PostgreSQL.

## AI Tools Used

- **Tool:** Claude (via Claude Code)
- **How I used it:** Scaffolded the full application architecture, built all React components, designed the Flask REST API with JWT auth and SQLAlchemy, debugged deployment issues on Railway and Supabase, implemented features like global search overlay, password strength validation, and financial health scoring.
- **Prompts that worked well:**
  - *"Build a Flask backend with JWT auth, bcrypt passwords, and SQLAlchemy supporting both SQLite locally and PostgreSQL in production"*
  - *"Add a global search overlay that searches across transactions, recurring rules, scenarios and goals with keyboard navigation"*
  - *"The Railway deployment shows 502 — here are the deploy logs, what's wrong?"*

## Key Design Decisions

- **No build step:** React and Babel are loaded via CDN so the frontend is plain HTML/JS files. This keeps local development simple (just open a file server) and makes GitHub Pages deployment trivial.
- **Single JSON blob per user:** Instead of normalising every entity into separate tables, the entire app state is stored as one JSON blob per user. This makes schema changes zero-effort and keeps the backend simple.
- **SQLite locally, PostgreSQL in production:** SQLAlchemy abstracts the database so the same code runs on both. Developers don't need to set up Postgres to run locally.
- **localStorage as cache:** Every state change writes to localStorage immediately and debounces an API save by 1 second. This makes the UI feel instant while still persisting to the server.

## Challenges & How You Solved Them

- **Railway serving wrong port:** Flask defaulted to port 3001 but Railway set `PORT=8080`. Fixed by reading `os.environ.get('PORT', 3001)` and updating the Railway domain to point at port 8080.
- **Cross-origin requests blocked:** The frontend on GitHub Pages couldn't call the Railway API until `flask-cors` was configured with `origins='*'`.
- **New user data bleeding from localStorage:** When a second user logged in on the same browser, they saw the previous user's cached data. Fixed by clearing localStorage when the API returns no data for a new user, so only localStorage-offline fallback uses the cache.
- **JWT subject type error:** PyJWT 2.x requires the `sub` claim to be a string. Fixed by casting the integer user ID to `str()` on token creation and back to `int()` on verification.
- **AI limitations:** Claude couldn't push to GitHub directly (no credentials), so commits were made via terminal and pushed through GitHub Desktop.

## What I'd Improve With More Time
- Add email verification on registration
- Add forgot password / password reset via email
- Add budget categories with monthly spending limits and alerts
- Add CSV import for bank statement transactions
- Replace the Flask dev server with Gunicorn for production
- Add end-to-end tests with Playwright
