"use client"

import { Lightbulb, Cog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ViewMode } from "@/lib/view-mode-utils"

interface EnhancedViewModeToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  hiddenCount?: number
  className?: string
}

export default function EnhancedViewModeToggle({
  viewMode,
  onViewModeChange,
  hiddenCount,
  className = "",
}: EnhancedViewModeToggleProps) {
  return (
    <Card
      className={`${className} ${viewMode === "normal" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${viewMode === "normal" ? "bg-green-100" : "bg-blue-100"}`}>
              {viewMode === "normal" ? (
                <Lightbulb className="h-5 w-5 text-green-600" />
              ) : (
                <Cog className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-slate-800">
                  {viewMode === "normal" ? "Beginner Mode" : "Advanced Mode"}
                </span>
                <Badge
                  variant="outline"
                  className={
                    viewMode === "normal"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : "bg-blue-100 text-blue-700 border-blue-300"
                  }
                >
                  {viewMode === "normal" ? "Simplified" : "Technical"}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {viewMode === "normal"
                  ? "Shows only security essentials - perfect for learning gittuf basics"
                  : "Shows all technical details - for experienced users and developers"}
              </p>
              {viewMode === "normal" && hiddenCount && hiddenCount > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  ✨ {hiddenCount} technical fields hidden to keep things simple
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "normal" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onViewModeChange("normal")}
                    className={`${viewMode === "normal" ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}`}
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Beginner
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-2">
                    <div className="font-medium">Beginner Mode</div>
                    <div className="text-sm">
                      Perfect for learning gittuf! Shows only the most important security information:
                    </div>
                    <ul className="text-xs space-y-1 ml-2">
                      <li>• Expiration dates and security status</li>
                      <li>• User roles and permissions</li>
                      <li>• Security policies and rules</li>
                      <li>• Trust relationships</li>
                    </ul>
                    <div className="text-xs text-green-600 font-medium">Hides technical details</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "advanced" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onViewModeChange("advanced")}
                    className={`${viewMode === "advanced" ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"}`}
                  >
                    <Cog className="h-3 w-3 mr-1" />
                    Advanced
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-2">
                    <div className="font-medium">Advanced Mode</div>
                    <div className="text-sm">For experienced users and developers. Shows everything including:</div>
                    <ul className="text-xs space-y-1 ml-2">
                      <li>• All security information from Beginner mode</li>
                      <li>• Schema versions and metadata types</li>
                      <li>• Key details and technical fields</li>
                      <li>• Raw data structures</li>
                    </ul>
                    <div className="text-xs text-blue-600 font-medium">Complete technical view</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
