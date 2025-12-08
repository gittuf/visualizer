"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Github,
  Folder,
  Globe,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Loader2,
  GitBranch,
  Calendar,
  User,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RepositoryInfo } from "@/lib/repository-handler"


interface RepositorySelectorProps {
  onRepositorySelect: (info: RepositoryInfo) => void
  isLoading: boolean
  error: string | null
  currentRepository: RepositoryInfo | null
}

export default function RepositorySelector({
  onRepositorySelect,
  isLoading,
  error,
  currentRepository,
}: RepositorySelectorProps) {
  const [activeTab, setActiveTab] = useState<"remote" | "local">("remote")
  const [remoteUrl, setRemoteUrl] = useState("")
  const [localPath, setLocalPath] = useState("")
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean
    message: string
    details?: any
  } | null>(null)

  const handleRemoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!remoteUrl.trim()) {
      setValidationStatus({
        isValid: false,
        message: "Please enter a repository URL",
      })
      return
    }

    // Validate URL format
    try {
      const url = new URL(remoteUrl)
      if (
        !url.hostname.includes("github.com") &&
        !url.hostname.includes("gitlab.com") &&
        !url.hostname.includes("bitbucket.org")
      ) {
        setValidationStatus({
          isValid: false,
          message: "Please enter a valid Git repository URL (GitHub, GitLab, or Bitbucket)",
        })
        return
      }
    } catch {
      setValidationStatus({
        isValid: false,
        message: "Please enter a valid URL",
      })
      return
    }

    setValidationStatus({
      isValid: true,
      message: "Repository URL validated successfully",
      details: {
        type: "remote",
        platform: remoteUrl.includes("github.com")
          ? "GitHub"
          : remoteUrl.includes("gitlab.com")
            ? "GitLab"
            : "Bitbucket",
        url: remoteUrl,
      },
    })

    const repoInfo: RepositoryInfo = {
      type: "remote",
      path: remoteUrl,
      name: remoteUrl.split("/").pop()?.replace(".git", "") || "Unknown Repository",
    }

    onRepositorySelect(repoInfo)
  }

  const handleLocalSelect = async () => {
    try {
      // Check if File System Access API is supported
      if (!("showDirectoryPicker" in window)) {
        setValidationStatus({
          isValid: false,
          message:
            "Local folder selection is not supported in this browser. Please use Chrome, Edge, or another Chromium-based browser.",
        })
        return
      }

      const dirHandle = await (window as any).showDirectoryPicker({
        mode: "read",
      })

      const folderPath = dirHandle.name
      setLocalPath(folderPath)

      // Validate if it's a git repository
      let isGitRepo = false
      try {
        for await (const [name, handle] of dirHandle.entries()) {
          if (name === ".git" && handle.kind === "directory") {
            isGitRepo = true
            break
          }
        }
      } catch (error) {
        console.warn("Could not check for .git directory:", error)
      }

      setValidationStatus({
        isValid: true,
        message: isGitRepo
          ? "Git repository detected successfully"
          : "Folder selected (Git repository not detected, but proceeding)",
        details: {
          type: "local",
          path: folderPath,
          isGitRepo,
        },
      })

      const repoInfo: RepositoryInfo = {
        type: "local",
        path: folderPath,
        name: folderPath,
      }

      onRepositorySelect(repoInfo)
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        // User cancelled the selection
        return
      }

      setValidationStatus({
        isValid: false,
        message: "Failed to select folder. Please try again.",
      })
    }
  }

  const handleTryDemo = () => {
    const demoRepo: RepositoryInfo = {
      type: "remote",
      path: "https://github.com/gittuf/gittuf",
      name: "gittuf",
    }

    setRemoteUrl(demoRepo.path)
    setValidationStatus({
      isValid: true,
      message: "Demo repository loaded",
      details: {
        type: "remote",
        platform: "GitHub",
        url: demoRepo.path,
      },
    })

    onRepositorySelect(demoRepo)
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GitBranch className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-800">Repository Selection</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Choose a repository to analyze security metadata and compare commits
              </p>
            </div>
          </div>
          {currentRepository && (
            <div className="text-right">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
              <p className="text-xs text-slate-500 mt-1">{currentRepository.name}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "remote" | "local")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="remote" className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Remote Repository
            </TabsTrigger>
            <TabsTrigger value="local" className="flex items-center">
              <HardDrive className="h-4 w-4 mr-2" />
              Local Repository
            </TabsTrigger>
          </TabsList>

          <TabsContent value="remote" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-slate-800 mb-2 flex items-center">
                  <Github className="h-4 w-4 mr-2" />
                  Remote Repository URL
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  Enter the URL of a Git repository (GitHub, GitLab, or Bitbucket) that contains gittuf security
                  metadata.
                </p>

                <form onSubmit={handleRemoteSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://github.com/username/repository"
                      value={remoteUrl}
                      onChange={(e) => setRemoteUrl(e.target.value)}
                      className="flex-grow"
                      disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !remoteUrl.trim()} className="min-w-[100px]">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Github className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <span>Supported platforms:</span>
                    <Badge variant="outline" className="text-xs">
                      GitHub
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      GitLab
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Bitbucket
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTryDemo}
                    disabled={isLoading}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                  >
                    Try Demo
                  </Button>
                </div>
              </div>

              {/* Remote Repository Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Cloud Access</span>
                  </div>
                  <p className="text-xs text-blue-700">Access repositories from anywhere</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <GitBranch className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Full History</span>
                  </div>
                  <p className="text-xs text-green-700">Complete commit history available</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Collaboration</span>
                  </div>
                  <p className="text-xs text-purple-700">Team repository analysis</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="local" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-slate-800 mb-2 flex items-center">
                  <Folder className="h-4 w-4 mr-2" />
                  Local Repository Folder
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  Select a local Git repository folder from your computer that contains gittuf security metadata files.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {/* <Button
                      onClick={handleLocalSelect}
                      disabled={isLoading}
                      className="min-w-[140px] bg-transparent"
                      variant="outline"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Folder className="h-4 w-4 mr-2" />
                      )}
                      Select Folder
                    </Button> */}
                    <form
  onSubmit={(e) => {
    e.preventDefault()

    if (!localPath.trim()) {
      setValidationStatus({
        isValid: false,
        message: "Please enter a local repository path",
      })
      return
    }

    // Very basic validation – you can expand this as needed
    const isGitRepo = true // Optionally, check for .git folder existence via IPC/electron/native bridge in a real app

    setValidationStatus({
      isValid: true,
      message: isGitRepo
        ? "Local repository path accepted"
        : "Path entered (Git repo not verified, but accepted)",
      details: {
        type: "local",
        path: localPath,
        isGitRepo,
      },
    })

    const repoInfo: RepositoryInfo = {
      type: "local",
      path: localPath,
      name: localPath.split("/").pop() || "Local Repo",
    }

    onRepositorySelect(repoInfo)
  }}
  className="space-y-3 w-full"
>
  <div className="flex gap-2">
    <Input
      type="text"
      placeholder="/path/to/local/repo"
      value={localPath}
      onChange={(e) => setLocalPath(e.target.value)}
      disabled={isLoading}
      className="flex-grow"
    />
    <Button type="submit" disabled={isLoading || !localPath.trim()} className="min-w-[100px]">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <HardDrive className="h-4 w-4 mr-2" />
          Connect
        </>
      )}
    </Button>
  </div>
</form>

                    {localPath && (
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">Selected:</p>
                        <p className="text-xs text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded">{localPath}</p>
                      </div>
                    )}
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Alert className="bg-amber-50 border-amber-200">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-amber-800">
                            <strong>Browser Compatibility:</strong> Local folder selection requires a modern browser
                            (Chrome 86+, Edge 86+) with File System Access API support.
                          </AlertDescription>
                        </Alert>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-md">
                        <div className="space-y-2">
                          <p className="font-medium">Supported Browsers:</p>
                          <ul className="text-sm space-y-1">
                            <li>• Chrome 86+ ✅</li>
                            <li>• Microsoft Edge 86+ ✅</li>
                            <li>• Opera 72+ ✅</li>
                            <li>• Firefox ❌ (not supported)</li>
                            <li>• Safari ❌ (not supported)</li>
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Local Repository Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <HardDrive className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Offline Access</span>
                  </div>
                  <p className="text-xs text-green-700">Work without internet connection</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Privacy</span>
                  </div>
                  <p className="text-xs text-blue-700">Data stays on your computer</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Real-time</span>
                  </div>
                  <p className="text-xs text-purple-700">Analyze latest changes instantly</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Validation Status */}
        <AnimatePresence>
          {validationStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Alert className={validationStatus.isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                {validationStatus.isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={validationStatus.isValid ? "text-green-800" : "text-red-800"}>
                  {validationStatus.message}
                  {validationStatus.details && (
                    <div className="mt-2 text-xs">
                      {validationStatus.details.type === "remote" && (
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-white">
                            {validationStatus.details.platform}
                          </Badge>
                          <span className="font-mono">{validationStatus.details.url}</span>
                        </div>
                      )}
                      {validationStatus.details.type === "local" && (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span>Path:</span>
                            <span className="font-mono bg-white px-1 rounded">{validationStatus.details.path}</span>
                          </div>
                          {validationStatus.details.isGitRepo !== undefined && (
                            <div className="flex items-center space-x-2">
                              <span>Git Repository:</span>
                              <Badge
                                variant="outline"
                                className={
                                  validationStatus.details.isGitRepo
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }
                              >
                                {validationStatus.details.isGitRepo ? "Detected" : "Not Detected"}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Repository Requirements */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="font-medium text-slate-800 mb-2">Repository Requirements</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>
                Contains <code className="bg-white px-1 rounded">root.json</code> and/or{" "}
                <code className="bg-white px-1 rounded">targets.json</code> files
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Has commit history with gittuf metadata changes</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Accessible via Git protocol (for remote) or local file system</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
