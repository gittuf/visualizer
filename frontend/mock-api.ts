import type { Commit } from "./types"

export async function mockFetchCommits(url: string): Promise<Commit[]> {
  const response = await fetch("http://localhost:5000/commits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch commits");
  }

  const data = await response.json();
  return data;
}

export async function mockFetchMetadata(
  url: string,
  commit: string,
  file: string
): Promise<any> {
  const response = await fetch("http://localhost:5000/metadata", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, commit, file }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch metadata");
  }

  const data = await response.json();
  return data;
}
