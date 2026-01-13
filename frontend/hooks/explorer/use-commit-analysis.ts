"use client"

import { useState, useEffect } from "react"
import type { Commit } from "@/lib/types"
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
    if (activeTab === "analysis" && selectedCommits.length > 0) {
      const loadAnalysisData = async () => {
        setLoading(true)
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
          setLoading(false)
        }
      }

      loadAnalysisData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedCommits.length, selectedFile, currentRepository?.path, repoUrl]) 
  // Dependency management: verify if this covers all needed updates without infinite loops.
  // selectedCommits.length is safer than selectedCommits to avoid loops if deep equality isn't checked, 
  // but here we are updating selectedCommits inside the effect, so we MUST correspond to the pattern.

  return {
    selectedCommits,
    setSelectedCommits,
    loading,
    error,
    setError,
    handleCommitRangeSelect,
  }
}
