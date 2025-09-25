import os
import json
import base64
import tempfile
import subprocess
from flask import Flask, request, jsonify
from git import Repo, GitCommandError, Git
import datetime

from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Clone the repository and fetch the custom ref
def clone_and_fetch_repo(url):
    temp_dir = tempfile.mkdtemp()
    print(f"[INFO] Cloning {url} into {temp_dir}")
    repo = Repo.clone_from(url, temp_dir)
    print("[INFO] Clone complete. Fetching 'refs/gittuf/policy'...")

    try:
        repo.git.fetch("origin", "refs/gittuf/policy:refs/remotes/origin/gittuf/policy")
        print("[INFO] Successfully fetched 'refs/gittuf/policy'")
    except GitCommandError as e:
        print(f"[ERROR] Fetch failed: {e}")
        raise e

    return temp_dir

# Get the list of commits on refs/gittuf/policy
def get_policy_commits(repo_path):
    repo = Repo(repo_path)
    ref = "origin/gittuf/policy"
    try:
        print(f"[DEBUG] Reading commits from '{ref}'")
        commits = list(repo.iter_commits(ref))
        print(f"[INFO] Found {len(commits)} commits")
    except GitCommandError as e:
        print(f"[ERROR] GitCommandError: {e}")
        return []
    return [{
        "hash": c.hexsha,
        "message": c.message.strip(),
        "author": c.author.name,
        "date": c.committed_datetime.isoformat()
    } for c in commits]

# Decode a specific metadata JSON file (root.json, targets.json)
def decode_metadata_blob(repo_path, commit_hash, metadata_filename):
    try:
        print(f"[INFO] Decoding {metadata_filename} at {commit_hash}")
        cmd = ["git", "ls-tree", "-r", commit_hash]
        result = subprocess.run(cmd, cwd=repo_path, capture_output=True, text=True)
        lines = result.stdout.splitlines()

        blob_hash = None
        for line in lines:
            if f"metadata/{metadata_filename}" in line:
                parts = line.split()
                if len(parts) >= 3:
                    blob_hash = parts[2]
                    print(f"[DEBUG] Found blob: {blob_hash}")
                    break

        if not blob_hash:
            return {"error": f"File metadata/{metadata_filename} not found in commit"}, 404

        cmd = ["git", "cat-file", "-p", blob_hash]
        result = subprocess.run(cmd, cwd=repo_path, capture_output=True, text=True)
        envelope = json.loads(result.stdout)
        payload_b64 = envelope.get("payload", "")
        decoded_json = json.loads(base64.b64decode(payload_b64))
        return decoded_json

    except Exception as e:
        print(f"[ERROR] Failed to decode metadata: {e}")
        return {"error": str(e)}, 500

# Route to list commits
@app.route('/commits', methods=['POST'])
def list_commits():
    data = request.json
    url = data.get('url')
    print(f"[REQUEST] /commits - URL: {url}")
    if not url:
        return jsonify({"error": "Missing 'url' in request body"}), 400
    try:
        repo_path = clone_and_fetch_repo(url)
        commits = get_policy_commits(repo_path)
        return jsonify(commits)
    except Exception as e:
        print(f"[ERROR] Exception in /commits: {e}")
        return jsonify({"error": str(e)}), 500

# Route to get metadata
@app.route('/metadata', methods=['POST'])
def metadata():
    data = request.json
    url = data.get('url')
    commit = data.get('commit')
    filename = data.get('file')
    print(f"[REQUEST] /metadata - URL: {url}, Commit: {commit}, File: {filename}")

    if not all([url, commit, filename]):
        return jsonify({"error": "Missing 'url', 'commit', or 'file'"}), 400

    try:
        repo_path = clone_and_fetch_repo(url)
        result = decode_metadata_blob(repo_path, commit, filename)
        return jsonify(result)
    except Exception as e:
        print(f"[ERROR] Exception in /metadata: {e}")
        return jsonify({"error": str(e)}), 500
  
def get_absolute_path(path: str) -> str:
    return os.path.abspath(path)

def is_valid_git_repo(path: str) -> bool:
    return os.path.exists(os.path.join(path, ".git"))

@app.route("/commits-local", methods=["POST"])
def commits_local():
    data = request.get_json()
    path = data.get("path")
    print(path)

    if not path:
        return jsonify({"error": "Missing 'path' in request body"}), 400

    path = get_absolute_path(path)
    print(path)

    if not os.path.exists(path):
        return jsonify({"error": f"Path does not exist: {path}"}), 400

    if not is_valid_git_repo(path):
        return jsonify({"error": f"Not a valid Git repository: {path}"}), 400

    try:
        repo = Repo(path)
        commits = [
            {
                "hash": commit.hexsha,
                "message": commit.message.strip(),
                "author": commit.author.name,
                "date": datetime.datetime.fromtimestamp(commit.committed_date).isoformat(),
            }
            for commit in repo.iter_commits("HEAD")
        ]
        return jsonify(commits)
    except Exception as e:
        return jsonify({"error": f"Failed to load commits: {str(e)}"}), 500


@app.route("/metadata-local", methods=["POST"])
def metadata_local():
    data = request.get_json()
    path = data.get("path")
    commit = data.get("commit")
    file = data.get("file")

    if not all([path, commit, file]):
        return jsonify({"error": "Missing 'path', 'commit', or 'file'"}), 400

    path = get_absolute_path(path)

    if not os.path.exists(path):
        return jsonify({"error": f"Path does not exist: {path}"}), 400

    if not is_valid_git_repo(path):
        return jsonify({"error": f"Not a valid Git repository: {path}"}), 400

    try:
        return jsonify(decode_metadata_blob(path, commit, file))
    except Exception as e:
        return jsonify({"error": f"Failed to fetch metadata: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)