"use client"

import { FileJson, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import JsonTreeView from "@/components/features/json/json-tree-view"
import type { Commit } from "@/lib/types"
import type { ViewMode } from "@/lib/view-mode-utils"

interface TreeViewTabProps {
  selectedCommit: Commit | null
  selectedFile: string
  isLoading: boolean
  error: string
  jsonData: any
  viewMode: ViewMode
  onRetry: () => void
}

export default function TreeViewTab({
  selectedCommit,
  selectedFile,
  isLoading,
  error,
  jsonData,
  viewMode,
  onRetry,
}: TreeViewTabProps) {
  return (
    <>
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
                <Badge variant="outline" className="text-slate-500 whitespace-nowrap bg-white border-purple-200">
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
            <Button variant="outline" onClick={onRetry} className="bg-transparent">
              Try Again
            </Button>
          </div>
        ) : jsonData && selectedCommit ? (
          <JsonTreeView jsonData={jsonData} viewMode={viewMode} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[600px] text-slate-500">
            <FileJson className="h-16 w-16 mb-4 text-slate-300" />
            <p className="text-lg font-medium mb-2">Tree View Ready!</p>
            <p className="text-center max-w-md">
              Select a commit to explore the security metadata in a familiar tree structure - perfect for beginners!
            </p>
          </div>
        )}
      </div>
    </>
  )
}
