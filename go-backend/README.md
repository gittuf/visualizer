# gittuf Metadata Visualizer (Backend)

A Golang API backend that powers the gittuf Metadata Visualizer frontend using the gin framework.  
Handles cloning Git repositories, fetching custom gittuf refs, and decoding
security metadata JSON.
## Features

- **Clone & Fetch**: Clones a Git repository and fetches the
  `refs/gittuf/policy` branch.
- **List Commits**: Returns a list of commits for the Gittuf policy ref,
  including hash, message, author, and date.
- **Decode Metadata**: Reads and decodes Base64-encoded Gittuf metadata files
  (`root.json`, `targets.json`) from a specific commit.

## Tech Stack

- **Framework**: Gin Web Framework
- **Language**: Go 1.25+
- **Git Integration**: go-git/v5
- **CORS**: gin-contrib/cors
- **Environment**: godotenv for configuration

## Prerequisites

- Go ≥1.25
- Git installed and in `PATH`

## Installation

```bash
# Clone the backend repo
git clone https://github.com/gittuf/visualizer.git
cd visualizer/go-backend

# Install dependencies
go mod download
```

## Running Locally

Configure the port in your env (defaults to 8080)

```bash
go run cmd/server/main.go
```

## API Endpoints

### GET `/health`

Health check endpoint to verify the server is running.

- **Response** (JSON):
  ```json
  {
    "status": "Looks good!"
  }
  ```

---

### Remote Repository Endpoints

#### POST `/commits`

Fetches commits from the `refs/gittuf/policy` branch of a remote repository.

- **Request Body** (JSON):
  ```json
  {
    "url": "https://github.com/user/repo.git"
  }
  ```
- **Response** (200 OK):
  ```json
  [
    {
      "hash": "abc123...",
      "message": "Commit message",
      "author": "Author Name",
      "date": "2025-01-09T12:00:00Z"
    }
  ]
  ```
- **Error Response** (400/500):
  ```json
  {
    "error": "Error message",
    "code": 400,
    "details": "Detailed error information"
  }
  ```

#### POST `/metadata`

Retrieves and decodes a metadata blob from a specific commit in a remote repository.

- **Request Body** (JSON):
  ```json
  {
    "url": "https://github.com/user/repo.git",
    "commit": "abc123...",
    "file": "root.json"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    // Decoded metadata object
  }
  ```
- **Error Response** (400/500):
  ```json
  {
    "error": "Error message",
    "code": 400,
    "details": "Detailed error information"
  }
  ```

---

### Local Repository Endpoints

#### POST `/commits-local`

Lists commits from the HEAD of a local Git repository.

- **Request Body** (JSON):
  ```json
  {
    "path": "/path/to/local/repo"
  }
  ```
- **Response** (200 OK):
  ```json
  [
    {
      "hash": "abc123...",
      "message": "Commit message",
      "author": "Author Name",
      "date": "2025-01-09T12:00:00Z"
    }
  ]
  ```
- **Error Response** (400/500):
  ```json
  {
    "error": "Error message",
    "code": 400,
    "details": "Detailed error information"
  }
  ```

#### POST `/metadata-local`

Retrieves and decodes a metadata blob from a specific commit in a local repository.

- **Request Body** (JSON):
  ```json
  {
    "path": "/path/to/local/repo",
    "commit": "abc123...",
    "file": "targets.json"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    // Decoded metadata object
  }
  ```
- **Error Response** (400/500):
  ```json
  {
    "error": "Error message",
    "code": 400,
    "details": "Detailed error information"
  }
  ```

## Project Structure

```
go-backend/
├── cmd/
│   └── server/           # Main application entry point
├── internal/
│   ├── handlers/         # HTTP request handlers
│   ├── models/          # Data models and types
│   ├── services/        # Business logic and Git operations
│   └── utils/           # Helper functions and utilities
├── tests/               # Test files
├── go.mod              # Go module definition and dependencies
├── go.sum              # Dependencies checksums
└── .env                # Environment configuration
```