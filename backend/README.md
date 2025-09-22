# Gittuf Metadata Visualizer (Backend)

A Flask-based API backend that powers the Gittuf Metadata Visualizer frontend.  
Handles cloning Git repositories, fetching custom Gittuf refs, and decoding security metadata JSON.

## Features

- **Clone & Fetch**: Clones a Git repository and fetches the `refs/gittuf/policy` branch.
- **List Commits**: Returns a list of commits for the Gittuf policy ref, including hash, message, author, and date.
- **Decode Metadata**: Reads and decodes Base64-encoded Gittuf metadata files (`root.json`, `targets.json`) from a specific commit.
- **CORS Support**: Enabled via `flask-cors` for seamless frontend integration.

## Tech Stack

- **Framework**: Flask
- **Language**: Python 3
- **Git Integration**: GitPython, subprocess for low-level Git commands
- **CORS**: flask-cors

## Prerequisites

- Python ≥3.9
- Git installed and in `PATH`

## Installation

```bash
# Clone the backend repo
git clone https://github.com/BrawlerXull/Gittuf-Visualizer-Backend.git
cd gittuf-visualizer-backend

# Create and activate a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Running Locally

```bash
python main.py
```

The API will be available at `http://localhost:5000`.

## API Endpoints

### POST `/commits`

Fetches commits from the `refs/gittuf/policy` branch.

- **Request Body** (JSON):
  - `url` (string): GitHub repository URL.
- **Response** (JSON): Array of commits:
  ```json
  [
    {
      "hash": "commit_sha",
      "message": "Commit message",
      "author": "Author Name",
      "date": "2025-06-09T12:34:56+00:00"
    },
    ...
  ]
  ```

### POST `/metadata`

Decodes a metadata file for a specific commit.

- **Request Body** (JSON):
  - `url` (string): GitHub repository URL.
  - `commit` (string): Commit SHA.
  - `file` (string): Metadata filename (`root.json` or `targets.json`).
- **Response** (JSON): Decoded metadata JSON or error message.

## Project Structure

```
brawlerxull-gittuf-visualizer-backend/
├── main.py            # Flask application and route handlers
└── requirements.txt   # Python dependencies
```

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

## License

[MIT](LICENSE)
