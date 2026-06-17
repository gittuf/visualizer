"use client"

import RepositorySelector from "@/screens/repository/repository-selector"
import VisualizerWorkspace from "@/screens/visualizer/visualizer-workspace"

import Header from "@/components/app/header"
import { useRepositorySession } from "@/hooks/use-repository-session"

export default function Home() {
  const {
    isLoading,
    error,
    currentRepository,
    currentRepositoryData,
    showRepositorySelector,
    handleDisconnect,
    handleTryDemo,
    handleRepositorySelect,
    handleRepositoryRefresh,
  } = useRepositorySession()

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
              workspaceData={currentRepositoryData}
              isLoading={isLoading}
              onReload={handleRepositoryRefresh}
              onDisconnect={handleDisconnect}
            />
          )}
        </div>
      </div>
    </main>
  )
}
