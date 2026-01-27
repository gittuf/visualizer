"use client"

import { useState, useEffect } from "react"
import type { Commit, JsonObject } from "@/lib/types"
import { REPOSITORY } from "@/lib/constants"
import { mockFetchMetadata } from "@/lib/mock-api"
import type { RepositoryInfo } from "@/lib/repository-handler"

export function useCommitAnalysis(
  activeTab: string, 
  repoUrl: string, 
  currentRepository: RepositoryInfo | null,
  selectedFile: string
) {
  const [selectedCommits, setSelectedCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCommitRangeSelect = (commits: Commit[]) => {
    setSelectedCommits(commits)
  }

  useEffect(() => {
    // Only fetch if we have selected commits and any of them are missing data
    const needsData = selectedCommits.some(commit => !commit.data)
    
    if (activeTab === "analysis" && selectedCommits.length > 0 && needsData) {
      const loadAnalysisData = async () => {
        setLoading(true)
        setError("")

        try {
          const fallbackUrl = currentRepository?.path || repoUrl || REPOSITORY.GITTUF_URL
          const dataPromises = selectedCommits.map((commit) =>
            mockFetchMetadata(fallbackUrl, commit.hash, selectedFile),
          )
          const results = await Promise.all(dataPromises)
          const commitsWithData = selectedCommits.map((commit, index) => ({
            ...commit,
            data: results[index] as JsonObject,
          }))

          setSelectedCommits(commitsWithData)
        } catch (err) {
          console.error("Failed to load analysis data:", err)
          setError("Failed to load analysis data for selected commits. Please try again.")
        } finally {
          setLoading(false)
        }
      }

      loadAnalysisData()
    }

  }, [activeTab, selectedCommits.length, selectedFile, currentRepository?.path, repoUrl, selectedCommits]) 

  return {
    selectedCommits,
    setSelectedCommits,
    loading,
    error,
    setError,
    handleCommitRangeSelect,
  }
}
