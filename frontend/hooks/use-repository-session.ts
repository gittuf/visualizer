"use client"

import { useEffect, useState } from "react"
import { buildVisualizerDataFromBackend } from "@/lib/backend-visualizer-data"
import { demoVisualizerData } from "@/lib/demo-visualizer-fixture"
import type { DemoVisualizerData } from "@/lib/demo-visualizer.types"
import { RepositoryHandler, type RepositoryInfo } from "@/lib/repository-handler"

const repositorySessionKey = "visualizer:repository-session"

export function useRepositorySession() {
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentRepository, setCurrentRepository] = useState<RepositoryInfo | null>(null)
  const [currentRepositoryData, setCurrentRepositoryData] = useState<DemoVisualizerData | null>(null)
  const [showRepositorySelector, setShowRepositorySelector] = useState(false)
  const [repositoryHandler] = useState(() => new RepositoryHandler())

  const persistRepositorySession = (repository: RepositoryInfo | null) => {
    if (typeof window === "undefined") return

    if (!repository) {
      window.localStorage.removeItem(repositorySessionKey)
      return
    }

    window.localStorage.setItem(repositorySessionKey, JSON.stringify(repository))
  }

  const handleTryDemo = async (onSuccess?: () => void) => {
    const demoRepository: RepositoryInfo = demoVisualizerData.repository

    setCurrentRepository(demoRepository)
    setCurrentRepositoryData(demoVisualizerData)
    setIsLoading(true)
    setError("")

    try {
      await repositoryHandler.setRepository(demoRepository)
      setShowRepositorySelector(false)
      persistRepositorySession(demoRepository)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(`Failed to load demo data: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepositorySelect = async (repoInfo: RepositoryInfo, onSuccess?: () => void) => {
    setCurrentRepository(repoInfo)
    setCurrentRepositoryData(null)
    setIsLoading(true)
    setError("")

    try {
      await repositoryHandler.setRepository(repoInfo)
      const commits = await repositoryHandler.fetchCommits()
      const workspaceData = await buildVisualizerDataFromBackend(
        repoInfo,
        commits,
        (commitHash) => repositoryHandler.fetchPolicySnapshot(commitHash),
      )
      setCurrentRepositoryData(workspaceData)
      setShowRepositorySelector(false)
      persistRepositorySession(repoInfo)
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
      repositoryHandler.clearCache()
      const commits = await repositoryHandler.fetchCommits()
      const workspaceData = await buildVisualizerDataFromBackend(
        currentRepository,
        commits,
        (commitHash) => repositoryHandler.fetchPolicySnapshot(commitHash),
      )
      setCurrentRepositoryData(workspaceData)
    } catch (err) {
      setError(`Failed to refresh repository data: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    setIsLoading(false)
    setError("")
    setCurrentRepository(null)
    setCurrentRepositoryData(null)
    setShowRepositorySelector(true)
    persistRepositorySession(null)
  }

  useEffect(() => {
    const savedRepository = window.localStorage.getItem(repositorySessionKey)

    if (!savedRepository) {
      setShowRepositorySelector(true)
      setIsBootstrapping(false)
      return
    }

    try {
      const repository = JSON.parse(savedRepository) as RepositoryInfo

      void handleRepositorySelect(repository).finally(() => {
        setIsBootstrapping(false)
      })
    } catch {
      window.localStorage.removeItem(repositorySessionKey)
      setShowRepositorySelector(true)
      setIsBootstrapping(false)
    }
  }, [])

  return {
    currentRepositoryData,
    isBootstrapping,
    isLoading,
    error,
    currentRepository,
    showRepositorySelector,
    handleDisconnect,
    handleTryDemo,
    handleRepositorySelect,
    handleRepositoryRefresh,
  }
}
