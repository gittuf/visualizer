"use client"

import { Eye, EyeOff, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ViewMode } from "@/lib/view-mode-utils"

interface ViewModeToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  hiddenCount?: number
  className?: string
}

export default function ViewModeToggle({
  viewMode,
  onViewModeChange,
  hiddenCount,
  className = "",
}: ViewModeToggleProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">View Mode:</span>
        <div className="flex rounded-md shadow-sm">
          <Button
            variant={viewMode === "normal" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("normal")}
            className="rounded-r-none"
          >
            <Eye className="h-3 w-3 mr-1" />
            Normal
          </Button>
          <Button
            variant={viewMode === "advanced" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("advanced")}
            className="rounded-l-none border-l-0"
          >
            <EyeOff className="h-3 w-3 mr-1" />
            Advanced
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Info className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {viewMode === "normal" ? "Security essentials only" : "All technical details"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-2">
                <div className="font-medium">{viewMode === "normal" ? "Normal Mode" : "Advanced Mode"}</div>
                <div className="text-sm">
                  {viewMode === "normal"
                    ? "Shows only critical security fields like expiration dates, thresholds, principals, roles, and policies. Hides technical implementation details."
                    : "Shows all fields including technical details like schema versions, key algorithms, and raw cryptographic data."}
                </div>
                {viewMode === "normal" && hiddenCount && hiddenCount > 0 && (
                  <div className="text-xs text-gray-500">{hiddenCount} technical fields hidden</div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {viewMode === "normal" && hiddenCount && hiddenCount > 0 && (
          <Badge variant="outline" className="text-xs bg-gray-50">
            {hiddenCount} hidden
          </Badge>
        )}
      </div>
    </div>
  )
}
