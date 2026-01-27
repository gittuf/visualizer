"use client"

import { FileJson } from "lucide-react"
import { FILENAMES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import EnhancedViewModeToggle from "@/components/shared/enhanced-view-mode-toggle"
import type { ViewMode } from "@/lib/view-mode-utils"

interface FileSelectorProps {
  selectedFile: string
  onFileChange: (file: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  hiddenCount: number
  showViewToggle: boolean
}

export default function FileSelector({
  selectedFile,
  onFileChange,
  viewMode,
  onViewModeChange,
  hiddenCount,
  showViewToggle,
}: FileSelectorProps) {
  return (
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
                  onClick={() => onFileChange(FILENAMES.ROOT)}
                  className={selectedFile === FILENAMES.ROOT ? "bg-blue-50 border-blue-200 text-blue-700" : ""}
                >
                  {FILENAMES.ROOT}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  <p className="font-medium">Root Security Policy</p>
                  <p className="text-sm">
                    Contains trust anchors, keys, and role definitions that form the foundation of repository security.
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
                  onClick={() => onFileChange(FILENAMES.TARGETS)}
                  className={selectedFile === FILENAMES.TARGETS ? "bg-blue-50 border-blue-200 text-blue-700" : ""}
                >
                  {FILENAMES.TARGETS}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  <p className="font-medium">Target Security Rules</p>
                  <p className="text-sm">
                    Contains specific security policies and rules that control who can modify different parts of the
                    repository.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {showViewToggle && (
        <EnhancedViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} hiddenCount={hiddenCount} />
      )}
    </div>
  )
}
