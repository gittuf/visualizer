"use client"

import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProgressIndicator from "@/components/shared/progress-indicator"
import type { RepositoryInfo } from "@/lib/repository-handler"

interface HeaderProps {
  currentRepository: RepositoryInfo | null
  showRepositorySelector: boolean
  onToggleSelector: () => void
  hasCommits: boolean
  currentStep: number
  steps: string[]
}

export default function Header({
  currentRepository,
  showRepositorySelector,
  onToggleSelector,
  hasCommits,
  currentStep,
  steps,
}: HeaderProps) {
  return (
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
          <Button variant="outline" size="sm" onClick={onToggleSelector} className="ml-4">
            {showRepositorySelector ? "Hide" : "Change"} Repository
          </Button>
        )}
      </div>

      {hasCommits && <ProgressIndicator currentStep={currentStep} steps={steps} />}
    </header>
  )
}
