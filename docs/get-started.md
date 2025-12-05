# Quick start

1) Start the backend

Go (Gin) on port 5000:
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

## Future plans
We plan to host the visualiser on GCP soon!