# gittuf Metadata Visualizer

An interactive web application to explore and understand gittuf repository policy metadata over time. Point it at a repository and visualize gittuf’s policy, inspect decoded metadata, compare versions across commits, and view change statistics.

Status: alpha (work-in-progress).

## What’s inside

This is a multi-project repo:

```
visualizer/
├── frontend/         # Next.js app (UI, visualizations)
├── backend/          # Python (Flask) API backend (this is now deprecated, use go-backend instead)
└── go-backend/       # Go (Gin) API backend
```

- The UI (Next.js) talks to an API backend which:
  - Clones a repository (remote) or reads a local repository
  - Lists commits
  - Fetches and decodes gittuf metadata blobs (e.g., metadata/root.json, metadata/targets.json)
- Two interchangeable backends are provided:
  - `backend/` Python (Flask) — default port 5000
  - `go-backend/` Go (Gin) — default port 8080 (configurable via `PORT`)

The frontend expects the backend at `http://localhost:5000` by default. If you choose the Go backend, start it on port 5000 (set `PORT=5000`) or update the frontend API base URL (see details below).

## Quick start

1) Start a backend

Option A — Python (Flask) on port 5000:
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py             # serves on http://localhost:5000
```

Option B — Go (Gin) on port 5000:
```bash
cd go-backend
go mod download
PORT=5000 go run cmd/server/main.go
```

2) Start the frontend
```bash
cd frontend
npm install
npm run dev                # http://localhost:3000
```

Open http://localhost:3000 and follow the UI to fetch a repository, browse commits, view/compare metadata, and analyze changes.

## Repository layout

- `frontend/` — Next.js 16, Tailwind CSS, shadcn, Radix UI; ReactFlow/Chart.js for visualizations
- `backend/` — Flask, subprocess calls to `git` for low-level operations
- `go-backend/` — Gin, go-git/v5, structured logging, CORS configuration

## Backend API

Both backends expose the same core endpoints. The Go backend also includes a `/health` endpoint.

- Remote repository (by URL)
  - `POST /commits`
    - body: `{ "url": "https://github.com/user/repo.git" }`
    - returns: array of commits `[{ hash, message, author, date }]`
  - `POST /metadata`
    - body: `{ "url": "...", "commit": "<sha>", "file": "root.json|targets.json" }`
    - returns: decoded metadata JSON from `metadata/<file>` at the specified commit

- Local repository (by folder path)
  - `POST /commits-local`
    - body: `{ "path": "/absolute/path/to/local/repo" }`
    - returns: array of commits from `HEAD`
  - `POST /metadata-local`
    - body: `{ "path": "...", "commit": "<sha>", "file": "root.json|targets.json" }`
    - returns: decoded metadata JSON from `metadata/<file>` at the specified commit

- Health (Go backend only)
  - `GET /health` → `{ "status": "Looks good!" }`

Notes:
- The Python backend fetches commits from the `refs/gittuf/policy` ref for remote repositories.
- Metadata blobs are expected under `metadata/root.json` or `metadata/targets.json` in the tree of the given commit.

## Frontend usage

From the home page:
1. Enter a repository:
   - Remote: full Git URL (e.g., `https://github.com/gittuf/gittuf.git`)
   - Local: absolute path to a local Git repo
2. Click “Fetch Repository” to load commits.
3. Explore tabs:
   - Commits — browse commit list
   - Visualization — interactive JSON tree
   - Compare — diff metadata between two commits
   - Analysis — summary charts of changes over time
4. Switch between `root.json` and `targets.json` when supported.

## Running with Docker

Frontend:
```bash
docker build -t visualizer-frontend -f frontend/Dockerfile .
docker run --rm -p 3000:3000 visualizer-frontend
# App at http://localhost:3000
```

Go backend:
```bash
docker build -t visualizer-go-backend -f go-backend/Dockerfile .
# Option A: keep default internal 8080 and map to host 5000 to match frontend defaults
docker run --rm -p 5000:8080 visualizer-go-backend
# Option B: run on port 5000 inside the container (uses PORT)
docker run --rm -e PORT=5000 -p 5000:5000 visualizer-go-backend
```

Python backend (note):
- The provided `backend/Dockerfile` is not currently aligned with the Flask app entrypoint and binds. For now, prefer running the Python backend locally using `python main.py` (as above).

## Configuration and CORS

- Frontend API base URL
  - By default, the frontend calls `http://localhost:5000` from `frontend/lib/mock-api.ts`.
  - If you use the Go backend on a different port, either:
    - Start it on port 5000 (`PORT=5000`) or
    - Update the base URL in `frontend/lib/mock-api.ts` (and, if used, `frontend/mock-api.ts`) to your backend address.
- CORS
  - Python backend: CORS is enabled for all origins in development.
  - Go backend: default allowed origins include `http://localhost:3000` and `http://localhost:5173`. Update in `cmd/server/main.go` if needed.

## Development scripts

Frontend:
```bash
npm run dev      # start Next.js dev server
npm run build    # build for production
npm start        # start production server
npm run lint     # lint
```

Backends:
- Python: `python main.py` (see `backend/README.md`), ensure Python ≥3.9 and Git are installed.
- Go: `go run cmd/server/main.go` (see `go-backend/README.md`), ensure Go ≥1.25 and Git are installed.

## Troubleshooting

- “Failed to fetch commits/metadata”
  - Verify the backend is running and reachable at the configured URL.
  - Confirm the repository contains gittuf metadata under `metadata/root.json` or `metadata/targets.json` at the selected commit(s).
  - For local repositories, ensure the path is absolute and points to a valid `.git` repo.

## Additional docs

- Backend (Go): `go-backend/README.md`
- Frontend: `frontend/README.md`

## License

Apache-2.0. See `LICENSE`.
