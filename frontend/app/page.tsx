"use client"

import { GitCommit, GitCompare, BarChart3, FileJson } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CommitList from "@/components/features/commit/commit-list"
import CommitCompare from "@/components/features/commit/commit-compare"
import CommitAnalysis from "@/components/features/commit/commit-analysis"
import QuickStartGuide from "@/components/shared/quick-start-guide"

import RepositoryStatus from "@/components/features/repository/repository-status"
import RepositorySelector from "@/components/features/repository/repository-selector"

// New extracted components
import Header from "@/components/layout/header"
import WelcomeScreen from "@/components/shared/welcome-screen"
import FileSelector from "@/components/features/visualization/file-selector"
import VisualizationTab from "@/components/features/visualization/visualization-tab"
import TreeViewTab from "@/components/features/json/tree-view-tab"

// Custom Hook
import { useGittufExplorer } from "@/hooks/use-gittuf-explorer"

export default function Home() {
  const {
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
    handleCommitSelect,
    handleCompareSelect,
    handleFileChange,
    handleCommitRangeSelect,
    hiddenCount,
  } = useGittufExplorer()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <Header
          currentRepository={currentRepository}
          showRepositorySelector={showRepositorySelector}
          onToggleSelector={() => setShowRepositorySelector(!showRepositorySelector)}
          hasCommits={commits.length > 0}
          currentStep={currentStep}
          steps={steps}
        />

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
            <FileSelector
              selectedFile={selectedFile}
              onFileChange={handleFileChange}
              viewMode={globalViewMode}
              onViewModeChange={setGlobalViewMode}
              hiddenCount={hiddenCount}
              showViewToggle={(activeTab === "visualization" || activeTab === "tree") && !!jsonData}
            />

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
                <VisualizationTab
                  selectedCommit={selectedCommit}
                  selectedFile={selectedFile}
                  isLoading={isLoading}
                  error={error}
                  jsonData={jsonData}
                  viewMode={globalViewMode}
                  onRetry={() => selectedCommit && handleCommitSelect(selectedCommit)}
                />
              </TabsContent>

              <TabsContent value="tree" className="mt-0">
                <TreeViewTab
                  selectedCommit={selectedCommit}
                  selectedFile={selectedFile}
                  isLoading={isLoading}
                  error={error}
                  jsonData={jsonData}
                  viewMode={globalViewMode}
                  onRetry={() => selectedCommit && handleCommitSelect(selectedCommit)}
                />
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

        {commits.length === 0 && !isLoading && <WelcomeScreen onTryDemo={handleTryDemo} />}
      </div>
    </main>
  )
}
