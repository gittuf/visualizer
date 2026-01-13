"use client"

import { useState } from "react"
import type { Commit } from "@/lib/types"
import { mockFetchMetadata } from "@/lib/mock-api"
import type { RepositoryInfo } from "@/lib/repository-handler"

interface CompareCommits {
  base: Commit | null
  compare: Commit | null
}

interface CompareData {
  base: any | null
  compare: any | null
}

export function useCommitComparison() {
  const [compareCommits, setCompareCommits] = useState<CompareCommits>({ base: null, compare: null })
  const [compareData, setCompareData] = useState<CompareData>({ base: null, compare: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCompareSelect = async (
    base: Commit, 
    compare: Commit, 
    repoUrl: string, 
    currentRepository: RepositoryInfo | null,
    selectedFile: string,
    onSuccess?: () => void
  ) => {
    setCompareCommits({ base, compare })
    setLoading(true)
    setError("")

    try {
      const fallbackUrl = currentRepository?.path || repoUrl || "https://github.com/gittuf/gittuf"
      const [baseData, compareData] = await Promise.all([
        mockFetchMetadata(fallbackUrl, base.hash, selectedFile),
        mockFetchMetadata(fallbackUrl, compare.hash, selectedFile),
      ])

      setCompareData({ base: baseData, compare: compareData })
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error("Failed to fetch comparison data:", err)
      setError(`Failed to fetch comparison data: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (
    file: string, 
    repoUrl: string, 
    currentRepository: RepositoryInfo | null
  ) => {
    if (compareCommits.base && compareCommits.compare) {
      setLoading(true)
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
        setLoading(false)
      }
    }
  }

  return {
    compareCommits,
    setCompareCommits,
    compareData,
    setCompareData,
    loading,
    error,
    setError,
    handleCompareSelect,
    handleFileChange,
  }
}
