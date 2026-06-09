"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { GitCommit, ChevronRight, Search, GitCompare, BarChart3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Commit } from "@/lib/types"

interface CommitListProps {
  commits: Commit[]
  onSelectCommit: (commit: Commit) => void
  selectedCommit: Commit | null
  onCompareSelect: (base: Commit, compare: Commit) => void
  compareCommits: { base: Commit | null; compare: Commit | null }
  onRangeSelect: (commits: Commit[]) => void
}

export default function CommitList({
  commits,
  onSelectCommit,
  selectedCommit,
  onCompareSelect,
  compareCommits,
  onRangeSelect,
}: CommitListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectionMode, setSelectionMode] = useState<"single" | "compare" | "range">("single")
  const [selectedCommits, setSelectedCommits] = useState<Record<string, boolean>>({})

  const filteredCommits = commits.filter(
    (commit) =>
      commit.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commit.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commit.author.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCommitClick = (commit: Commit) => {
    if (selectionMode === "single") {
      onSelectCommit(commit)
    } else if (selectionMode === "compare") {
      if (!compareCommits.base) {
        onCompareSelect(commit, compareCommits.compare || commits[0])
      } else if (!compareCommits.compare) {
        onCompareSelect(compareCommits.base, commit)
      } else {
        // If both are already selected, replace the compare commit
        onCompareSelect(compareCommits.base, commit)
      }
    } else if (selectionMode === "range") {
      // Toggle selection for range mode
      setSelectedCommits((prev) => ({
        ...prev,
        [commit.hash]: !prev[commit.hash],
      }))
    }
  }

  const handleApplyRange = () => {
    const selected = commits.filter((commit) => selectedCommits[commit.hash])
    if (selected.length >= 2) {
      onRangeSelect(selected)
    }
  }

  const resetSelection = () => {
    if (selectionMode === "compare") {
      onCompareSelect(null as unknown as Commit, null as unknown as Commit)
    } else if (selectionMode === "range") {
      setSelectedCommits({})
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search commits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={selectionMode === "single" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectionMode("single")
                    resetSelection()
                  }}
                >
                  <GitCommit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Single commit selection</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={selectionMode === "compare" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectionMode("compare")
                    resetSelection()
                  }}
                >
                  <GitCompare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compare two commits</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={selectionMode === "range" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectionMode("range")
                    resetSelection()
                  }}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select multiple commits for analysis</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {selectionMode === "compare" && (
        <div className="flex flex-col sm:flex-row gap-2 p-3 bg-blue-50 rounded-md border border-blue-100">
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-700 mb-1">Base:</p>
            {compareCommits.base ? (
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-1 rounded text-xs font-mono border border-blue-200">
                  {compareCommits.base.hash.substring(0, 8)}
                </code>
                <span className="text-xs text-blue-600 truncate">{compareCommits.base.message}</span>
              </div>
            ) : (
              <span className="text-xs text-blue-500">Select a base commit</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-700 mb-1">Compare:</p>
            {compareCommits.compare ? (
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-1 rounded text-xs font-mono border border-blue-200">
                  {compareCommits.compare.hash.substring(0, 8)}
                </code>
                <span className="text-xs text-blue-600 truncate">{compareCommits.compare.message}</span>
              </div>
            ) : (
              <span className="text-xs text-blue-500">Select a compare commit</span>
            )}
          </div>
        </div>
      )}

      {selectionMode === "range" && (
        <div className="p-3 bg-indigo-50 rounded-md border border-indigo-100">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-indigo-700">
              Select multiple commits for security metadata analysis
            </p>
            <Badge variant="outline" className="bg-white">
              {Object.values(selectedCommits).filter(Boolean).length} selected
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleApplyRange}
              disabled={Object.values(selectedCommits).filter(Boolean).length < 2}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Analyze Selected
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelectedCommits({})}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {filteredCommits.length > 0 ? (
          filteredCommits.map((commit) => (
            <motion.div
              key={commit.hash}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleCommitClick(commit)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                (selectionMode === "single" && selectedCommit?.hash === commit.hash) ||
                (selectionMode === "compare" &&
                  (compareCommits.base?.hash === commit.hash || compareCommits.compare?.hash === commit.hash)) ||
                (selectionMode === "range" && selectedCommits[commit.hash])
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                {selectionMode === "range" && (
                  <div className="mt-1 mr-2">
                    <Checkbox
                      checked={!!selectedCommits[commit.hash]}
                      onCheckedChange={() => {
                        setSelectedCommits((prev) => ({
                          ...prev,
                          [commit.hash]: !prev[commit.hash],
                        }))
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}

                <div className="flex items-start space-x-3 flex-grow">
                  <div className="mt-1">
                    <GitCommit className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-slate-800 line-clamp-1">{commit.message}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                      <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                        {commit.hash.substring(0, 8)}
                      </code>
                      <span className="text-xs text-slate-500">
                        {commit.author} • {new Date(commit.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {selectionMode === "compare" && (
                  <div className="flex flex-col gap-1">
                    {compareCommits.base?.hash === commit.hash && (
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        Base
                      </Badge>
                    )}
                    {compareCommits.compare?.hash === commit.hash && (
                      <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                        Compare
                      </Badge>
                    )}
                  </div>
                )}

                {selectionMode === "single" && (
                  <ChevronRight
                    className={`h-5 w-5 transition-colors ${
                      selectedCommit?.hash === commit.hash ? "text-blue-500" : "text-slate-300"
                    }`}
                  />
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>No commits match your search</p>
          </div>
        )}
      </div>
    </div>
  )
}
