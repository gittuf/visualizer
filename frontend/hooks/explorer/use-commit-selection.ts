"use client"

import { useState } from "react"
import type { Commit, JsonValue } from "@/lib/types"
import { mockFetchMetadata } from "@/lib/mock-api"
import type { ViewMode } from "@/lib/view-mode-utils"
import type { RepositoryInfo } from "@/lib/repository-handler"

import { FILENAMES, REPOSITORY } from "@/lib/constants"

export function useCommitSelection() {
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null)
  const [jsonData, setJsonData] = useState<JsonValue>(null)
  const [selectedFile, setSelectedFile] = useState<string>(FILENAMES.ROOT)
  const [globalViewMode, setGlobalViewMode] = useState<ViewMode>("normal")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCommitSelect = async (
    commit: Commit, 
    repoUrl: string, 
    currentRepository: RepositoryInfo | null,
    onSuccess?: () => void
  ) => {
    setSelectedCommit(commit)
    setLoading(true)
    setError("")

    try {
      const fallbackUrl = currentRepository?.path || repoUrl || "https://github.com/gittuf/gittuf"
      const metadata = await mockFetchMetadata(fallbackUrl, commit.hash, selectedFile)
      setJsonData(metadata as JsonValue)
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error("Failed to fetch metadata:", err)
      setError(
        `Failed to fetch ${selectedFile} for this commit: ${err instanceof Error ? err.message : "Unknown error"}`,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (
    file: string, 
    repoUrl: string, 
    currentRepository: RepositoryInfo | null
  ) => {
    setSelectedFile(file)

    if (selectedCommit) {
      setLoading(true)
      setError("")
      try {
        const fallbackUrl = currentRepository?.path || repoUrl || REPOSITORY.GITTUF_URL
        const metadata = await mockFetchMetadata(fallbackUrl, selectedCommit.hash, file)
        setJsonData(metadata as JsonValue)
      } catch (err) {
        console.error("Failed to fetch file data:", err)
        setError(`Failed to fetch ${file} for this commit: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }
  }

  return {
    selectedCommit,
    setSelectedCommit,
    jsonData,
    setJsonData,
    selectedFile,
    setSelectedFile,
    globalViewMode,
    setGlobalViewMode,
    loading,
    error,
    setError,
    handleCommitSelect,
    handleFileChange,
  }
}
