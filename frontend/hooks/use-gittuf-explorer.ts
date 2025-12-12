"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { mockFetchCommits, mockFetchMetadata } from "@/lib/mock-api"
import type { Commit } from "@/lib/types"
import { getHiddenFieldsCount, type ViewMode } from "@/lib/view-mode-utils"
import { RepositoryHandler, type RepositoryInfo } from "@/lib/repository-handler"

export function useGittufExplorer() {
  const [repoUrl, setRepoUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [commits, setCommits] = useState<Commit[]>([])
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null)
  const [compareCommits, setCompareCommits] = useState<{
    base: Commit | null
    compare: Commit | null
  }>({ base: null, compare: null })
  const [jsonData, setJsonData] = useState<any>(null)
  const [compareData, setCompareData] = useState<{
    base: any | null
    compare: any | null
  }>({ base: null, compare: null })
  const [activeTab, setActiveTab] = useState("commits")
  const [error, setError] = useState("")
  const [selectedFile, setSelectedFile] = useState("root.json")
  const [selectedCommits, setSelectedCommits] = useState<Commit[]>([])
  const [globalViewMode, setGlobalViewMode] = useState<ViewMode>("normal")
  const [currentStep, setCurrentStep] = useState(0)
  const [repositoryHandler] = useState(() => new RepositoryHandler())
  const [currentRepository, setCurrentRepository] = useState<RepositoryInfo | null>(null)
  const [showRepositorySelector, setShowRepositorySelector] = useState(true)

  const steps = ["Repository", "Commits", "Visualization", "Analysis"]

  const handleTryDemo = async () => {
    setRepoUrl("https://github.com/gittuf/gittuf")
    setCurrentStep(1)

    setIsLoading(true)
    setError("")

    try {
      const commitsData = await mockFetchCommits("https://github.com/gittuf/gittuf")
      setCommits(commitsData)
      setSelectedCommit(null)
      setCompareCommits({ base: null, compare: null })
      setJsonData(null)
      setCompareData({ base: null, compare: null })
      setSelectedCommits([])
      setActiveTab("commits")
      setCurrentStep(2)
    } catch (err) {
      setError("Failed to load demo data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepositorySelect = async (repoInfo: RepositoryInfo) => {
    setCurrentRepository(repoInfo)
    setCurrentStep(1)
    setIsLoading(true)
    setError("")

    try {
      await repositoryHandler.setRepository(repoInfo)
      const commitsData = await repositoryHandler.fetchCommits()
      setCommits(commitsData)
      setSelectedCommit(null)
      setCompareCommits({ base: null, compare: null })
      setJsonData(null)
      setCompareData({ base: null, compare: null })
      setSelectedCommits([])
      setActiveTab("commits")
      setCurrentStep(2)
      setShowRepositorySelector(false)
    } catch (err) {
      setError(`Failed to connect to repository: ${err instanceof Error ? err.message : "Unknown error"}`)
      setCurrentStep(0)
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

  const handleRepoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL")
      return
    }

    setCurrentStep(1)
    setIsLoading(true)
    setError("")

    try {
      const commitsData = await mockFetchCommits(repoUrl)
      setCommits(commitsData)
      setSelectedCommit(null)
      setCompareCommits({ base: null, compare: null })
      setJsonData(null)
      setCompareData({ base: null, compare: null })
      setSelectedCommits([])
      setActiveTab("commits")
      setCurrentStep(2)
    } catch (err) {
      setError("Failed to fetch repository data. Please check the URL and try again.")
      setCurrentStep(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommitSelect = async (commit: Commit) => {
    setSelectedCommit(commit)
    setIsLoading(true)
    setActiveTab("visualization")
    setCurrentStep(3)
    setError("")

    try {
      // Use the mock API directly with proper fallback URL
      const fallbackUrl = currentRepository?.path || repoUrl || "https://github.com/gittuf/gittuf"
      const metadata = await mockFetchMetadata(fallbackUrl, commit.hash, selectedFile)
      setJsonData(metadata)
    } catch (err) {
      console.error("Failed to fetch metadata:", err)
      setError(
        `Failed to fetch ${selectedFile} for this commit: ${err instanceof Error ? err.message : "Unknown error"}`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompareSelect = async (base: Commit, compare: Commit) => {
    setCompareCommits({ base, compare })
    setIsLoading(true)
    setActiveTab("compare")
    setCurrentStep(3)
    setError("")

    try {
      const fallbackUrl = currentRepository?.path || repoUrl || "https://github.com/gittuf/gittuf"
      const [baseData, compareData] = await Promise.all([
        mockFetchMetadata(fallbackUrl, base.hash, selectedFile),
        mockFetchMetadata(fallbackUrl, compare.hash, selectedFile),
      ])

      setCompareData({ base: baseData, compare: compareData })
    } catch (err) {
      console.error("Failed to fetch comparison data:", err)
      setError(`Failed to fetch comparison data: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = async (file: string) => {
    setSelectedFile(file)

    if (selectedCommit && (activeTab === "visualization" || activeTab === "tree")) {
      setIsLoading(true)
      setError("")
      try {
        const fallbackUrl = currentRepository?.path || repoUrl || "https://github.com/gittuf/gittuf"
        const metadata = await mockFetchMetadata(fallbackUrl, selectedCommit.hash, file)
        setJsonData(metadata)
      } catch (err) {
        console.error("Failed to fetch file data:", err)
        setError(`Failed to fetch ${file} for this commit: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setIsLoading(false)
      }
    }

    if (compareCommits.base && compareCommits.compare && activeTab === "compare") {
      setIsLoading(true)
      setError("")
      try {
        const fallbackUrl = currentRepository?.path || repoUrl || "https://github.com/gittuf/gittuf"
        const [baseData, compareData] = await Promise.all([
          mockFetchMetadata(fallbackUrl, compareCommits.base.hash, file),
          mockFetchMetadata(fallbackUrl, compareCommits.compare.hash, file),
        ])

        setCompareData({ base: baseData, compare: compareData })
      } catch (err) {
        console.error("Failed to fetch file comparison data:", err)
        setError(`Failed to fetch comparison data: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCommitRangeSelect = (commits: Commit[]) => {
    setSelectedCommits(commits)
    setActiveTab("analysis")
    setCurrentStep(4)
  }

  useEffect(() => {
    if (activeTab === "analysis" && selectedCommits.length > 0) {
      const loadAnalysisData = async () => {
        setIsLoading(true)
        setError("")

        try {
          const fallbackUrl = currentRepository?.path || repoUrl || "https://github.com/gittuf/gittuf"
          const dataPromises = selectedCommits.map((commit) =>
            mockFetchMetadata(fallbackUrl, commit.hash, selectedFile),
          )
          const results = await Promise.all(dataPromises)
          const commitsWithData = selectedCommits.map((commit, index) => ({
            ...commit,
            data: results[index],
          }))

          setSelectedCommits(commitsWithData)
        } catch (err) {
          console.error("Failed to load analysis data:", err)
          setError("Failed to load analysis data for selected commits. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }

      loadAnalysisData()
    }
  }, [activeTab, selectedCommits.length, selectedFile, currentRepository, repoUrl])

  const hiddenCount = globalViewMode === "normal" && jsonData ? getHiddenFieldsCount(jsonData) : 0

  return {
    repoUrl,
    setRepoUrl,
    isLoading,
    commits,
    selectedCommit,
    compareCommits,
    jsonData,
    compareData,
    activeTab,
    setActiveTab,
    error,
    selectedFile,
    selectedCommits,
    globalViewMode,
    setGlobalViewMode,
    currentStep,
    currentRepository,
    showRepositorySelector,
    setShowRepositorySelector,
    steps,
    handleTryDemo,
    handleRepositorySelect,
    handleRepositoryRefresh,
    handleRepoSubmit,
    handleCommitSelect,
    handleCompareSelect,
    handleFileChange,
    handleCommitRangeSelect,
    hiddenCount,
  }
}
