import type { Commit } from "./types"

export async function mockFetchCommits(pathOrUrl: string): Promise<Commit[]> {
  const isRemote = pathOrUrl.startsWith("http")
  const endpoint = isRemote ? "/commits" : "/commits-local"

  const response = await fetch(`http://localhost:5000${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(isRemote ? { url: pathOrUrl } : { path: pathOrUrl }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch commits")
  }

  return response.json()
}

export async function mockFetchMetadata(
  pathOrUrl: string,
  commit: string,
  file: string
): Promise<any> {
  const isRemote = pathOrUrl.startsWith("http")
  const endpoint = isRemote ? "/metadata" : "/metadata-local"

  const response = await fetch(`http://localhost:5000${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(isRemote
      ? { url: pathOrUrl, commit, file }
      : { path: pathOrUrl, commit, file }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch metadata")
  }

  return response.json()
}
