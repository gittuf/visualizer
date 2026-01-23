# gittuf Visualizer Development

This document contains details on the visualizer's structure and backend API,
intended for aiding development. 

## Repository layout

- `frontend/` — Next.js 16, Tailwind CSS, shadcn, Radix UI; ReactFlow/Chart.js
  for visualizations
- `go-backend/` — Gin, go-git/v5, structured logging, CORS configuration

- The UI (Next.js) talks to an API backend which:
  - Clones a repository (remote) or reads a local repository
  - Lists commits
  - Fetches and decodes gittuf metadata blobs (e.g., metadata/root.json,
    metadata/targets.json)
  - `go-backend/` Go (Gin) — default port 5000 (configurable via `PORT`)

## Backend API

Both backends expose the same core endpoints. The Go backend also includes a
`/health` endpoint.

- Remote repository (by URL)
  - `POST /commits`
    - body: `{ "url": "https://github.com/user/repo.git" }`
    - returns: array of commits `[{ hash, message, author, date }]`
  - `POST /metadata`
    - body: `{ "url": "...", "commit": "<sha>", "file": "root.json|targets.json" }`
    - returns: decoded metadata JSON from `metadata/<file>` at the specified
      commit

- Local repository (by folder path)
  - `POST /commits-local`
    - body: `{ "path": "/absolute/path/to/local/repo" }`
    - returns: array of commits from `HEAD`
  - `POST /metadata-local`
    - body: `{ "path": "...", "commit": "<sha>", "file": "root.json|targets.json" }`
    - returns: decoded metadata JSON from `metadata/<file>` at the specified
      commit

- Health (Go backend only)
  - `GET /health` → `{ "status": "Looks good!" }`

Notes:
- The backend fetches commits from the `refs/gittuf/policy` ref for
  remote repositories.
- Metadata blobs are expected under `metadata/root.json` or
  `metadata/targets.json` in the tree of the given commit.

## Configuration and CORS

- CORS
  - Go backend: default allowed origins include `http://localhost:3000` and
    `http://localhost:5173`. Update in `cmd/server/main.go` if needed.

## Development scripts

Frontend:
```bash
npm run dev      # start Next.js dev server
npm run build    # build for production
npm start        # start production server
npm run lint     # lint
```

Backend:
- Go: `go run cmd/server/main.go` (see `go-backend/README.md`), ensure Go ≥1.25
  and Git are installed.

## Troubleshooting

- “Failed to fetch commits/metadata”
  - Verify the backend is running and reachable at the configured URL.
  - Confirm the repository contains gittuf metadata under `metadata/root.json`
    or `metadata/targets.json` at the selected commit(s).
  - For local repositories, ensure the path is absolute and points to a valid
    `.git` repo.
