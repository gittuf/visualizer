"use client"

import type React from "react"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Loader2, Github, GitCommit, FileJson, GitCompare, BarChart3, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import CommitList from "@/components/commit-list"
import CommitCompare from "@/components/commit-compare"
import CommitAnalysis from "@/components/commit-analysis"
import QuickStartGuide from "@/components/quick-start-guide"
import EnhancedViewModeToggle from "@/components/enhanced-view-mode-toggle"
import ProgressIndicator from "@/components/progress-indicator"
import { mockFetchCommits, mockFetchMetadata } from "@/lib/mock-api"
import type { Commit } from "@/lib/types"
import JsonTreeView from "@/components/json-tree-view"
import { getHiddenFieldsCount, type ViewMode } from "@/lib/view-mode-utils"

import RepositoryStatus from "@/components/repository-status"
import { RepositoryHandler, type RepositoryInfo } from "@/lib/repository-handler"
import RepositorySelector from "@/components/repository-selector"

// Dynamically import the JsonTreeVisualization component to avoid SSR issues with ReactFlow
const JsonTreeVisualization = dynamic(() => import("@/components/json-tree-visualization"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] w-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading visualization...</span>
    </div>
  ),
})

// Dynamically import the JsonDiffVisualization component
const JsonDiffVisualization = dynamic(() => import("@/components/json-diff-visualization"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] w-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading diff visualization...</span>
    </div>
  ),
})

export default function Home() {
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <Github className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  gittuf Security Explorer
                </h1>
                <p className="text-slate-600">Interactive tool to understand Git repository security metadata</p>
              </div>
            </div>
            {currentRepository && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRepositorySelector(!showRepositorySelector)}
                className="ml-4"
              >
                {showRepositorySelector ? "Hide" : "Change"} Repository
              </Button>
            )}
          </div>

          {commits.length > 0 && <ProgressIndicator currentStep={currentStep} steps={steps} />}
        </header>

        <QuickStartGuide />

        {showRepositorySelector && (
          <RepositorySelector
            onRepositorySelect={handleRepositorySelect}
            isLoading={isLoading}
            error={error}
            currentRepository={currentRepository}
          />
        )}

        {currentRepository && !showRepositorySelector && (
          <RepositoryStatus
            repository={currentRepository}
            commits={commits}
            onRefresh={handleRepositoryRefresh}
            isLoading={isLoading}
          />
        )}

        {commits.length > 0 && (
          <>
            <div className="flex flex-col space-y-4 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-2 mr-4">
                    <FileJson className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Security Files:</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFileChange("root.json")}
                          className={selectedFile === "root.json" ? "bg-blue-50 border-blue-200 text-blue-700" : ""}
                        >
                          root.json
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p className="font-medium">Root Security Policy</p>
                          <p className="text-sm">
                            Contains trust anchors, keys, and role definitions that form the foundation of repository
                            security.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFileChange("targets.json")}
                          className={selectedFile === "targets.json" ? "bg-blue-50 border-blue-200 text-blue-700" : ""}
                        >
                          targets.json
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p className="font-medium">Target Security Rules</p>
                          <p className="text-sm">
                            Contains specific security policies and rules that control who can modify different parts of
                            the repository.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {(activeTab === "visualization" || activeTab === "tree") && jsonData && (
                <EnhancedViewModeToggle
                  viewMode={globalViewMode}
                  onViewModeChange={setGlobalViewMode}
                  hiddenCount={hiddenCount}
                />
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                <TabsTrigger
                  value="commits"
                  className="flex items-center data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  <GitCommit className="h-4 w-4 mr-2" />
                  Browse Commits
                </TabsTrigger>
                <TabsTrigger
                  value="visualization"
                  disabled={!selectedCommit}
                  className="flex items-center data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  Graph View
                </TabsTrigger>
                <TabsTrigger
                  value="tree"
                  disabled={!selectedCommit}
                  className="flex items-center data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  Tree View
                </TabsTrigger>
                <TabsTrigger
                  value="compare"
                  disabled={!compareCommits.base || !compareCommits.compare}
                  className="flex items-center data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare
                </TabsTrigger>
                <TabsTrigger
                  value="analysis"
                  disabled={selectedCommits.length < 2}
                  className="flex items-center data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="commits" className="mt-0">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <GitCommit className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium text-slate-800">Step 2: Select Commits to Analyze</h3>
                    </div>
                    <CommitList
                      commits={commits}
                      onSelectCommit={handleCommitSelect}
                      selectedCommit={selectedCommit}
                      onCompareSelect={handleCompareSelect}
                      compareCommits={compareCommits}
                      onRangeSelect={handleCommitRangeSelect}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="visualization" className="mt-0">
                {selectedCommit && (
                  <div className="mb-4">
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-slate-800 flex items-center">
                              <FileJson className="h-4 w-4 mr-2 text-green-600" />
                              Interactive Graph View: {selectedFile}
                            </h3>
                            <div className="mt-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                              <code className="bg-white px-2 py-1 rounded text-sm font-mono border border-green-200">
                                {selectedCommit.hash.substring(0, 8)}
                              </code>
                              <p className="text-slate-600">{selectedCommit.message}</p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-slate-500 whitespace-nowrap bg-white border-green-200"
                          >
                            {new Date(selectedCommit.date).toLocaleDateString()} by {selectedCommit.author}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="h-[600px] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                      <span className="ml-2">Loading security metadata visualization...</span>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-red-500 p-4">
                      <FileJson className="h-16 w-16 mb-4 text-red-400" />
                      <p className="text-lg font-medium mb-2">Error Loading Visualization</p>
                      <p className="text-center max-w-md mb-4 text-sm">{error}</p>
                      <Button
                        variant="outline"
                        onClick={() => selectedCommit && handleCommitSelect(selectedCommit)}
                        className="bg-transparent"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : jsonData && selectedCommit ? (
                    <JsonTreeVisualization jsonData={jsonData} viewMode={globalViewMode} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <FileJson className="h-16 w-16 mb-4 text-slate-300" />
                      <p className="text-lg font-medium mb-2">Ready to Visualize!</p>
                      <p className="text-center max-w-md">
                        Select a commit from the "Browse Commits" tab to see an interactive graph of the security
                        metadata
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tree" className="mt-0">
                {selectedCommit && (
                  <div className="mb-4">
                    <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-slate-800 flex items-center">
                              <FileJson className="h-4 w-4 mr-2 text-purple-600" />
                              Structured Tree View: {selectedFile}
                            </h3>
                            <div className="mt-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                              <code className="bg-white px-2 py-1 rounded text-sm font-mono border border-purple-200">
                                {selectedCommit.hash.substring(0, 8)}
                              </code>
                              <p className="text-slate-600">{selectedCommit.message}</p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-slate-500 whitespace-nowrap bg-white border-purple-200"
                          >
                            {new Date(selectedCommit.date).toLocaleDateString()} by {selectedCommit.author}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-[600px]">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                      <span className="ml-2">Loading tree structure...</span>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-[600px] text-red-500 p-4">
                      <FileJson className="h-16 w-16 mb-4 text-red-400" />
                      <p className="text-lg font-medium mb-2">Error Loading Tree View</p>
                      <p className="text-center max-w-md mb-4 text-sm">{error}</p>
                      <Button
                        variant="outline"
                        onClick={() => selectedCommit && handleCommitSelect(selectedCommit)}
                        className="bg-transparent"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : jsonData && selectedCommit ? (
                    <JsonTreeView jsonData={jsonData} viewMode={globalViewMode} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[600px] text-slate-500">
                      <FileJson className="h-16 w-16 mb-4 text-slate-300" />
                      <p className="text-lg font-medium mb-2">Tree View Ready!</p>
                      <p className="text-center max-w-md">
                        Select a commit to explore the security metadata in a familiar tree structure - perfect for
                        beginners!
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="compare" className="mt-0">
                {compareCommits.base && compareCommits.compare && (
                  <CommitCompare
                    baseCommit={compareCommits.base}
                    compareCommit={compareCommits.compare}
                    baseData={compareData.base}
                    compareData={compareData.compare}
                    isLoading={isLoading}
                    selectedFile={selectedFile}
                    viewMode={globalViewMode}
                  />
                )}
              </TabsContent>

              <TabsContent value="analysis" className="mt-0">
                {selectedCommits.length >= 2 && (
                  <CommitAnalysis commits={selectedCommits} isLoading={isLoading} selectedFile={selectedFile} />
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {commits.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-[400px] bg-white/80 backdrop-blur-sm rounded-lg border border-dashed border-slate-300 shadow-lg">
            <Github className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-medium text-slate-700 mb-2">Ready to Explore Security Metadata</h3>
            <p className="text-slate-500 text-center max-w-md mb-4">
              Enter a GitHub repository URL above or try our interactive demo to start learning about gittuf security
              policies
            </p>
            <Button onClick={handleTryDemo} className="bg-blue-600 hover:bg-blue-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Try Interactive Demo
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
