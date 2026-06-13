"use client"

import { useState } from "react"
import { demoVisualizerData } from "@/lib/demo-visualizer-fixture"
import type { DemoVisualizerData } from "@/lib/demo-visualizer.types"
import { RepositoryHandler, type RepositoryInfo } from "@/lib/repository-handler"

export function useRepositorySession() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentRepository, setCurrentRepository] = useState<RepositoryInfo | null>(null)
  const [currentRepositoryData, setCurrentRepositoryData] = useState<DemoVisualizerData | null>(null)
  const [showRepositorySelector, setShowRepositorySelector] = useState(true)
  const [repositoryHandler] = useState(() => new RepositoryHandler())

  const handleTryDemo = async (onSuccess?: () => void) => {
    const demoRepository: RepositoryInfo = demoVisualizerData.repository

    setCurrentRepository(demoRepository)
    setCurrentRepositoryData(demoVisualizerData)
    setIsLoading(true)
    setError("")

    try {
      await repositoryHandler.setRepository(demoRepository)
      setShowRepositorySelector(false)
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
      await repositoryHandler.fetchCommits()
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
      await repositoryHandler.fetchCommits()
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
  }

  return {
    currentRepositoryData,
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
