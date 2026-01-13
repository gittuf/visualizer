"use client"

import type React from "react"
import { useState } from "react"
import { mockFetchCommits } from "@/lib/mock-api"
import type { Commit } from "@/lib/types"
import { RepositoryHandler, type RepositoryInfo } from "@/lib/repository-handler"

export function useRepository() {
  const [repoUrl, setRepoUrl] = useState("")
  const [commits, setCommits] = useState<Commit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentRepository, setCurrentRepository] = useState<RepositoryInfo | null>(null)
  const [showRepositorySelector, setShowRepositorySelector] = useState(true)
  const [repositoryHandler] = useState(() => new RepositoryHandler())

  const handleTryDemo = async (onSuccess?: () => void) => {
    setRepoUrl("https://github.com/gittuf/gittuf")
    setIsLoading(true)
    setError("")

    try {
      const commitsData = await mockFetchCommits("https://github.com/gittuf/gittuf")
      setCommits(commitsData)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError("Failed to load demo data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepositorySelect = async (repoInfo: RepositoryInfo, onSuccess?: () => void) => {
    setCurrentRepository(repoInfo)
    setIsLoading(true)
    setError("")

    try {
      await repositoryHandler.setRepository(repoInfo)
      const commitsData = await repositoryHandler.fetchCommits()
      setCommits(commitsData)
      setShowRepositorySelector(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(`Failed to connect to repository: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepositoryRefresh = async () => {
    if (!currentRepository) return

    setIsLoading(true)
    setError("")

    try {
      const commitsData = await repositoryHandler.fetchCommits()
      setCommits(commitsData)
    } catch (err) {
      setError(`Failed to refresh repository data: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepoSubmit = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault()

    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const commitsData = await mockFetchCommits(repoUrl)
      setCommits(commitsData)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError("Failed to fetch repository data. Please check the URL and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    repoUrl,
    setRepoUrl,
    commits,
    setCommits,
    isLoading,
    error,
    setError, // Exposed to allow other hooks to set error if needed, or clear it
    currentRepository,
    showRepositorySelector,
    setShowRepositorySelector,
    handleTryDemo,
    handleRepositorySelect,
    handleRepositoryRefresh,
    handleRepoSubmit,
  }
}
