import type { Commit, PolicyQueryResult } from "./types"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080"

interface ApiErrorResponse {
  error?: string
  details?: string
}

async function readApiError(response: Response, fallback: string): Promise<Error> {
  try {
    const error = (await response.json()) as ApiErrorResponse
    const message = [error.error, error.details].filter(Boolean).join(": ")
    return new Error(message || fallback)
  } catch {
    const text = await response.text()
    return new Error(text || fallback)
  }
}

export async function fetchCommits(pathOrUrl: string): Promise<Commit[]> {
  const isRemote = pathOrUrl.startsWith("http")
  const endpoint = isRemote ? "/commits" : "/commits-local"

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(isRemote ? { url: pathOrUrl } : { path: pathOrUrl }),
  })

  if (!response.ok) {
    throw await readApiError(response, "Failed to fetch commits")
  }

  return response.json()
}

export async function fetchMetadata(
  pathOrUrl: string,
  commit: string,
  file: string
): Promise<unknown> {
  const isRemote = pathOrUrl.startsWith("http")
  const endpoint = isRemote ? "/metadata" : "/metadata-local"

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(isRemote
      ? { url: pathOrUrl, commit, file }
      : { path: pathOrUrl, commit, file }),
  })

  if (!response.ok) {
    throw await readApiError(response, "Failed to fetch metadata")
  }

  return response.json()
}

export async function queryPolicy(
  pathOrUrl: string,
  commit: string,
  branch: string,
  changedPath: string,
): Promise<PolicyQueryResult> {
  const isRemote = pathOrUrl.startsWith("http")
  const endpoint = isRemote ? "/policy-query" : "/policy-query-local"

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(isRemote
      ? { url: pathOrUrl, commit, branch, changedPath }
      : { path: pathOrUrl, commit, branch, changedPath }),
  })

  if (!response.ok) {
    throw await readApiError(response, "Failed to query policy")
  }

  return response.json()
}
