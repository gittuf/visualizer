"use client"

import Image from "next/image"
import RepositorySelector from "@/screens/repository/repository-selector"
import VisualizerWorkspace from "@/screens/visualizer/visualizer-workspace"

import spinnerIcon from "@/assets/spinner.png"
import Header from "@/components/app/header"
import { useRepositorySession } from "@/hooks/use-repository-session"

export default function Home() {
  const {
    isBootstrapping,
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

  const isWorkspaceView = isBootstrapping || Boolean(currentRepository && !showRepositorySelector)

  return (
    <main className={isWorkspaceView ? "flex h-screen flex-col overflow-hidden bg-white" : "min-h-screen bg-white"}>
      <Header
        hasCommits={false}
        currentStep={0}
        steps={[]}
      />

      <div className={showRepositorySelector ? "mx-auto max-w-7xl" : "min-h-0 flex-1 w-full overflow-hidden"}>
        <div className={showRepositorySelector ? "px-4 py-6 md:px-8 md:py-8" : "h-full overflow-hidden"}>
          {isBootstrapping ? (
            <div className="flex h-full min-h-0 w-full items-center justify-center bg-[linear-gradient(to_right,rgba(4,8,14,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(4,8,14,0.06)_1px,transparent_1px)] bg-[size:24px_24px]">
              <Image src={spinnerIcon} alt="" className="h-10 w-10 animate-spin" draggable={false} />
            </div>
          ) : null}

          {!isBootstrapping && showRepositorySelector && (
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
