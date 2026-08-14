import { fetchCommits, fetchMetadata, queryPolicy } from "./api"
import type { Commit, JsonObject, PolicyQueryResult } from "./types"

export interface RepositoryInfo {
  type: "remote" | "local"
  path: string // For remote, it's the URL. For local, it's the absolute folder path.
  name: string
  branch?: string
}

export interface LocalFile {
  name: string
  path: string
  content: string
  lastModified: Date
}

export class RepositoryHandler {
  private repositoryInfo: RepositoryInfo | null = null
  private commitsCache = new Map<string, Commit[]>()
  private metadataCache = new Map<string, unknown>()

  async setRepository(info: RepositoryInfo): Promise<void> {
    if (
      !this.repositoryInfo ||
      this.repositoryInfo.type !== info.type ||
      this.repositoryInfo.path !== info.path
    ) {
      this.clearCache()
    }

    this.repositoryInfo = info
  }

  clearCache() {
    this.commitsCache.clear()
    this.metadataCache.clear()
  }

  async fetchCommits(): Promise<Commit[]> {
    if (!this.repositoryInfo) {
      throw new Error("No repository configured")
    }

    return this.repositoryInfo.type === "remote"
      ? this.fetchRemoteCommits(this.repositoryInfo.path)
      : this.fetchLocalCommits(this.repositoryInfo.path)
  }

  async fetchMetadata(commitHash: string, fileName: string): Promise<unknown> {
    if (!this.repositoryInfo) {
      throw new Error("No repository configured")
    }

    return this.repositoryInfo.type === "remote"
      ? this.fetchRemoteMetadata(commitHash, fileName)
      : this.fetchLocalMetadata(commitHash, fileName)
  }

  async fetchPolicySnapshot(commitHash: string): Promise<{ root: JsonObject; targets: JsonObject }> {
    return {
      targets: (await this.fetchMetadata(commitHash, "targets.json")) as JsonObject,
      root: (await this.fetchMetadata(commitHash, "root.json")) as JsonObject,
    }
  }

  async queryPolicy(
    commitHash: string,
    branch: string,
    changedPath: string,
  ): Promise<PolicyQueryResult> {
    if (!this.repositoryInfo) {
      throw new Error("No repository configured")
    }

    return queryPolicy(this.repositoryInfo.path, commitHash, branch, changedPath)
  }

  private async fetchRemoteCommits(url: string): Promise<Commit[]> {
    const cacheKey = `commits:${url}`
    const cached = this.commitsCache.get(cacheKey)
    if (cached) return cached

    const commits = await fetchCommits(url)
    this.commitsCache.set(cacheKey, commits)
    return commits
  }

  private async fetchLocalCommits(folderPath: string): Promise<Commit[]> {
    const cacheKey = `commits:${folderPath}`
    const cached = this.commitsCache.get(cacheKey)
    if (cached) return cached

    const commits = await fetchCommits(folderPath)
    this.commitsCache.set(cacheKey, commits)
    return commits
  }

  private async fetchRemoteMetadata(commitHash: string, fileName: string): Promise<unknown> {
    const cacheKey = `metadata:${this.repositoryInfo!.path}:${commitHash}:${fileName}`
    const cached = this.metadataCache.get(cacheKey)
    if (cached) return cached

    const metadata = await fetchMetadata(this.repositoryInfo!.path, commitHash, fileName)
    this.metadataCache.set(cacheKey, metadata)
    return metadata
  }

  private async fetchLocalMetadata(commitHash: string, fileName: string): Promise<unknown> {
    const cacheKey = `metadata:${this.repositoryInfo!.path}:${commitHash}:${fileName}`
    const cached = this.metadataCache.get(cacheKey)
    if (cached) return cached

    const metadata = await fetchMetadata(this.repositoryInfo!.path, commitHash, fileName)
    this.metadataCache.set(cacheKey, metadata)
    return metadata
  }

  getRepositoryInfo(): RepositoryInfo | null {
    return this.repositoryInfo
  }
}
