"use client"

import RepositorySelector from "@/page-components/repository/repository-selector"
import VisualizerWorkspace from "@/page-components/visualizer/visualizer-workspace"

import Header from "@/components/app/header"
import { useGittufExplorer } from "@/hooks/use-gittuf-explorer"

export default function Home() {
  const {
    isLoading,
    error,
    currentRepository,
    showRepositorySelector,
    setShowRepositorySelector,
    handleTryDemo,
    handleRepositorySelect,
    handleRepositoryRefresh,
  } = useGittufExplorer()

  const isWorkspaceView = Boolean(currentRepository && !showRepositorySelector)

  return (
    <main className={isWorkspaceView ? "flex h-screen flex-col overflow-hidden bg-white" : "min-h-screen bg-white"}>
      <Header
        hasCommits={false}
        currentStep={0}
        steps={[]}
      />

      <div className={showRepositorySelector ? "mx-auto max-w-7xl" : "min-h-0 flex-1 w-full overflow-hidden"}>
        <div className={showRepositorySelector ? "px-4 py-6 md:px-8 md:py-8" : "h-full overflow-hidden"}>
          {showRepositorySelector && (
            <RepositorySelector
              onRepositorySelect={handleRepositorySelect}
              onTryDemo={handleTryDemo}
              isLoading={isLoading}
              error={error}
              currentRepository={currentRepository}
            />
          )}

          {currentRepository && !showRepositorySelector && (
            <VisualizerWorkspace
              repository={currentRepository}
              isLoading={isLoading}
              onReload={handleRepositoryRefresh}
              onDisconnect={() => setShowRepositorySelector(true)}
            />
          )}
        </div>
      </div>
    </main>
  )
}
