"use client"

import type React from "react"
import { useState } from "react"
import { getHiddenFieldsCount } from "@/lib/view-mode-utils"
import { useRepository } from "./explorer/use-repository"
import { useCommitSelection } from "./explorer/use-commit-selection"
import { useCommitComparison } from "./explorer/use-commit-comparison"
import { useCommitAnalysis } from "./explorer/use-commit-analysis"
import type { Commit } from "@/lib/types"
import type { RepositoryInfo } from "@/lib/repository-handler"

export function useGittufExplorer() {
  const [activeTab, setActiveTab] = useState("commits")
  const [currentStep, setCurrentStep] = useState(0)

  const steps = ["Repository", "Commits", "Visualization", "Analysis"]

  // Initialize sub-hooks
  const repository = useRepository()
  const selection = useCommitSelection()
  const comparison = useCommitComparison()
  const analysis = useCommitAnalysis(
    activeTab, 
    repository.repoUrl, 
    repository.currentRepository, 
    selection.selectedFile
  )

  // Aggregated state
  const isLoading = repository.isLoading || selection.loading || comparison.loading || analysis.loading
  const error = repository.error || selection.error || comparison.error || analysis.error

  // Wrapped Handlers to coordinate state across hooks
  const handleTryDemo = async () => {
    setCurrentStep(1)
    
    // Reset other states
    selection.setSelectedCommit(null)
    selection.setJsonData(null)
    comparison.setCompareCommits({ base: null, compare: null })
    comparison.setCompareData({ base: null, compare: null })
    analysis.setSelectedCommits([])

    await repository.handleTryDemo(() => {
      setActiveTab("commits")
      setCurrentStep(2)
    })
  }

  const handleRepositorySelect = async (repoInfo: RepositoryInfo) => {
    setCurrentStep(1)
    
    // Reset other states
    selection.setSelectedCommit(null)
    selection.setJsonData(null)
    comparison.setCompareCommits({ base: null, compare: null })
    comparison.setCompareData({ base: null, compare: null })
    analysis.setSelectedCommits([])

    await repository.handleRepositorySelect(repoInfo, () => {
      setActiveTab("commits")
      setCurrentStep(2)
    })
  }

  const handleRepoSubmit = async (e: React.FormEvent) => {
    setCurrentStep(1)
    
    // Reset other states
    selection.setSelectedCommit(null)
    selection.setJsonData(null)
    comparison.setCompareCommits({ base: null, compare: null })
    comparison.setCompareData({ base: null, compare: null })
    analysis.setSelectedCommits([])

    await repository.handleRepoSubmit(e, () => {
      setActiveTab("commits")
      setCurrentStep(2)
    })
  }

  const handleCommitSelect = async (commit: Commit) => {
    setActiveTab("visualization")
    setCurrentStep(3)
    
    await selection.handleCommitSelect(
      commit, 
      repository.repoUrl, 
      repository.currentRepository
    )
  }

  const handleCompareSelect = async (base: Commit, compare: Commit) => {
    setActiveTab("compare")
    setCurrentStep(3)
    
    await comparison.handleCompareSelect(
      base, 
      compare, 
      repository.repoUrl, 
      repository.currentRepository,
      selection.selectedFile
    )
  }

  const handleFileChange = async (file: string) => {
    selection.setSelectedFile(file)

    if (activeTab === "visualization" || activeTab === "tree") {
      await selection.handleFileChange(
        file, 
        repository.repoUrl, 
        repository.currentRepository
      )
    }

    if (activeTab === "compare") {
      await comparison.handleFileChange(
        file, 
        repository.repoUrl, 
        repository.currentRepository
      )
    }
  }

  const handleCommitRangeSelect = (commits: Commit[]) => {
    analysis.handleCommitRangeSelect(commits)
    setActiveTab("analysis")
    setCurrentStep(4)
  }

  const hiddenCount = selection.globalViewMode === "normal" && selection.jsonData 
    ? getHiddenFieldsCount(selection.jsonData) 
    : 0

  return {
    // Repository State
    repoUrl: repository.repoUrl,
    setRepoUrl: repository.setRepoUrl,
    commits: repository.commits,
    currentRepository: repository.currentRepository,
    showRepositorySelector: repository.showRepositorySelector,
    setShowRepositorySelector: repository.setShowRepositorySelector,
    handleRepositoryRefresh: repository.handleRepositoryRefresh,

    // Selection State
    selectedCommit: selection.selectedCommit,
    jsonData: selection.jsonData,
    selectedFile: selection.selectedFile,
    globalViewMode: selection.globalViewMode,
    setGlobalViewMode: selection.setGlobalViewMode,

    // Comparison State
    compareCommits: comparison.compareCommits,
    compareData: comparison.compareData,

    // Analysis State
    selectedCommits: analysis.selectedCommits,

    // Shared / Aggregated State
    isLoading,
    error,
    activeTab,
    setActiveTab,
    currentStep,
    steps,
    hiddenCount,

    // Handlers
    handleTryDemo,
    handleRepositorySelect,
    handleRepoSubmit,
    handleCommitSelect,
    handleCompareSelect,
    handleFileChange,
    handleCommitRangeSelect,
  }
}
