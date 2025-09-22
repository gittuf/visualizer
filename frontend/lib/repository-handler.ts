import type { Commit } from "./types"

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

  async setRepository(info: RepositoryInfo): Promise<void> {
    this.repositoryInfo = info
  }

  async fetchCommits(): Promise<Commit[]> {
    if (!this.repositoryInfo) {
      throw new Error("No repository configured")
    }

    return this.repositoryInfo.type === "remote"
      ? this.fetchRemoteCommits(this.repositoryInfo.path)
      : this.fetchLocalCommits(this.repositoryInfo.path)
  }

  async fetchMetadata(commitHash: string, fileName: string): Promise<any> {
    if (!this.repositoryInfo) {
      throw new Error("No repository configured")
    }

    return this.repositoryInfo.type === "remote"
      ? this.fetchRemoteMetadata(commitHash, fileName)
      : this.fetchLocalMetadata(commitHash, fileName)
  }

  private async fetchRemoteCommits(url: string): Promise<Commit[]> {
    const { mockFetchCommits } = await import("./mock-api")
    return mockFetchCommits(url)
  }

  private async fetchLocalCommits(folderPath: string): Promise<Commit[]> {
    const { mockFetchCommits } = await import("./mock-api")
    return mockFetchCommits(folderPath)
  }

  private async fetchRemoteMetadata(commitHash: string, fileName: string): Promise<any> {
    const { mockFetchMetadata } = await import("./mock-api")
    return mockFetchMetadata(this.repositoryInfo!.path, commitHash, fileName)
  }

  private async fetchLocalMetadata(commitHash: string, fileName: string): Promise<any> {
    const { mockFetchMetadata } = await import("./mock-api")
    return mockFetchMetadata(this.repositoryInfo!.path, commitHash, fileName)
  }

  getRepositoryInfo(): RepositoryInfo | null {
    return this.repositoryInfo
  }
}
