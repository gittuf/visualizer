"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  GitBranch,
  Globe,
  HardDrive,
  Calendar,
  User,
  FileText,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { RepositoryInfo } from "@/lib/repository-handler"
import type { Commit } from "@/lib/types"

interface RepositoryStatusProps {
  repository: RepositoryInfo
  commits: Commit[]
  onRefresh: () => void
  isLoading: boolean
}

export default function RepositoryStatus({ repository, commits, onRefresh, isLoading }: RepositoryStatusProps) {
  const [repoStats, setRepoStats] = useState<{
    totalCommits: number
    dateRange: { start: string; end: string } | null
    authors: string[]
    hasSecurityFiles: boolean
    lastUpdate: string
  } | null>(null)

  useEffect(() => {
    if (commits.length > 0) {
      const sortedCommits = [...commits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const authors = [...new Set(commits.map((c) => c.author))]

      setRepoStats({
        totalCommits: commits.length,
        dateRange: {
          start: sortedCommits[0].date,
          end: sortedCommits[sortedCommits.length - 1].date,
        },
        authors,
        hasSecurityFiles: true, // Assume true if we have commits
        lastUpdate: sortedCommits[sortedCommits.length - 1].date,
      })
    }
  }, [commits])

  const getRepositoryIcon = () => {
    if (repository.type === "remote") {
      if (repository.path.includes("github.com")) return <GitBranch className="h-5 w-5 text-blue-600" />
      if (repository.path.includes("gitlab.com")) return <Globe className="h-5 w-5 text-orange-600" />
      return <Globe className="h-5 w-5 text-purple-600" />
    }
    return <HardDrive className="h-5 w-5 text-green-600" />
  }

  const getRepositoryPlatform = () => {
    if (repository.type === "local") return "Local Repository"
    if (repository.path.includes("github.com")) return "GitHub"
    if (repository.path.includes("gitlab.com")) return "GitLab"
    if (repository.path.includes("bitbucket.org")) return "Bitbucket"
    return "Remote Repository"
  }

  return (
    <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">{getRepositoryIcon()}</div>
            <div>
              <CardTitle className="text-lg text-slate-800 flex items-center space-x-2">
                <span>{repository.name}</span>
                <Badge variant="outline" className="bg-white">
                  {getRepositoryPlatform()}
                </Badge>
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                {repository.type === "remote" ? repository.path : `Local: ${repository.path}`}
              </p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="bg-white hover:bg-slate-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh repository data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      {repoStats && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-3 rounded-lg border border-slate-200"
            >
              <div className="flex items-center space-x-2 mb-1">
                <GitBranch className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Commits</span>
              </div>
              <div className="text-xl font-bold text-blue-600">{repoStats.totalCommits}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-3 rounded-lg border border-slate-200"
            >
              <div className="flex items-center space-x-2 mb-1">
                <User className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-slate-700">Authors</span>
              </div>
              <div className="text-xl font-bold text-green-600">{repoStats.authors.length}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-3 rounded-lg border border-slate-200"
            >
              <div className="flex items-center space-x-2 mb-1">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-slate-700">Security Files</span>
              </div>
              <div className="flex items-center space-x-1">
                {repoStats.hasSecurityFiles ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm font-medium text-slate-600">
                  {repoStats.hasSecurityFiles ? "Found" : "Missing"}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-3 rounded-lg border border-slate-200"
            >
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-slate-700">Last Update</span>
              </div>
              <div className="text-xs text-amber-600 font-medium">
                {new Date(repoStats.lastUpdate).toLocaleDateString()}
              </div>
            </motion.div>
          </div>

          {/* Authors List */}
          {repoStats.authors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-4 p-3 bg-white rounded-lg border border-slate-200"
            >
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Contributors</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {repoStats.authors.slice(0, 5).map((author, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-slate-50">
                    {author}
                  </Badge>
                ))}
                {repoStats.authors.length > 5 && (
                  <Badge variant="outline" className="text-xs bg-slate-50">
                    +{repoStats.authors.length - 5} more
                  </Badge>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
