"use client"

import { FileJson, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Commit } from "@/lib/types"
import type { ViewMode } from "@/lib/view-mode-utils"
import dynamic from "next/dynamic"

const JsonTreeVisualization = dynamic(() => import("@/components/features/json/json-tree-visualization"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] w-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading visualization...</span>
    </div>
  ),
})

interface VisualizationTabProps {
  selectedCommit: Commit | null
  selectedFile: string
  isLoading: boolean
  error: string
  jsonData: any
  viewMode: ViewMode
  onRetry: () => void
}

export default function VisualizationTab({
  selectedCommit,
  selectedFile,
  isLoading,
  error,
  jsonData,
  viewMode,
  onRetry,
}: VisualizationTabProps) {
  return (
    <>
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
                <Badge variant="outline" className="text-slate-500 whitespace-nowrap bg-white border-green-200">
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
            <Button variant="outline" onClick={onRetry} className="bg-transparent">
              Try Again
            </Button>
          </div>
        ) : jsonData && selectedCommit ? (
          <JsonTreeVisualization jsonData={jsonData} viewMode={viewMode} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <FileJson className="h-16 w-16 mb-4 text-slate-300" />
            <p className="text-lg font-medium mb-2">Ready to Visualize!</p>
            <p className="text-center max-w-md">
              Select a commit from the "Browse Commits" tab to see an interactive graph of the security metadata
            </p>
          </div>
        )}
      </div>
    </>
  )
}
