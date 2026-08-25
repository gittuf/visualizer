"use client"

import { useCallback, useEffect, useState } from "react"
import { buildVisualizerDataFromBackend } from "@/lib/backend-visualizer-data"
import { demoVisualizerData } from "@/lib/demo-visualizer-fixture"
import type { DemoVisualizerData } from "@/lib/demo-visualizer.types"
import { RepositoryHandler, type RepositoryInfo } from "@/lib/repository-handler"

const repositorySessionKey = "visualizer:repository-session"

export function useRepositorySession() {
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [pendingRepository, setPendingRepository] = useState<RepositoryInfo | null>(null)
  const [currentRepository, setCurrentRepository] = useState<RepositoryInfo | null>(null)
  const [currentRepositoryData, setCurrentRepositoryData] = useState<DemoVisualizerData | null>(null)
  const [repositoryHandler] = useState(() => new RepositoryHandler())
  const showRepositorySelector = !isBootstrapping && !currentRepositoryData

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

    setPendingRepository(demoRepository)
    setCurrentRepository(demoRepository)
    setCurrentRepositoryData(demoVisualizerData)
    setIsLoading(true)
    setError("")

    try {
      await repositoryHandler.setRepository(demoRepository)
      persistRepositorySession(demoRepository)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(`Failed to load demo data: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setPendingRepository(null)
      setIsLoading(false)
    }
  }

  const handleRepositorySelect = useCallback(async (repoInfo: RepositoryInfo, onSuccess?: () => void) => {
    setPendingRepository(repoInfo)
    setCurrentRepository(null)
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
      setCurrentRepository(repoInfo)
      setCurrentRepositoryData(workspaceData)
      persistRepositorySession(repoInfo)
      if (onSuccess) onSuccess()
    } catch (err) {
      setCurrentRepository(null)
      setCurrentRepositoryData(null)
      setError(`Failed to connect to repository: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setPendingRepository(null)
      setIsLoading(false)
    }
  }, [repositoryHandler])

  const handleRepositoryRefresh = async () => {
    if (!currentRepository) return

    setIsLoading(true)
    setError("")

    try {
      repositoryHandler.clearCommitsCache()
      const commits = await repositoryHandler.fetchCommits()
      const workspaceData = await buildVisualizerDataFromBackend(
        currentRepository,
        commits,
        (commitHash) => repositoryHandler.fetchPolicySnapshot(commitHash),
        currentRepositoryData?.metadataByCommit,
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
    setPendingRepository(null)
    setCurrentRepository(null)
    setCurrentRepositoryData(null)
    persistRepositorySession(null)
  }

  useEffect(() => {
    const savedRepository = window.localStorage.getItem(repositorySessionKey)

    if (!savedRepository) {
      queueMicrotask(() => {
        setIsBootstrapping(false)
      })
      return
    }

    try {
      const repository = JSON.parse(savedRepository) as RepositoryInfo

      queueMicrotask(() => {
        void handleRepositorySelect(repository).finally(() => {
          setIsBootstrapping(false)
        })
      })
    } catch {
      window.localStorage.removeItem(repositorySessionKey)
      queueMicrotask(() => {
        setIsBootstrapping(false)
      })
    }
  }, [handleRepositorySelect])

  return {
    currentRepositoryData,
    isBootstrapping,
    isLoading,
    error,
    pendingRepository,
    currentRepository,
    showRepositorySelector,
    handleDisconnect,
    handleTryDemo,
    handleRepositorySelect,
    handleRepositoryRefresh,
  }
}
