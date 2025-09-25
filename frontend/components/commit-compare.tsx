"use client"

import { Loader2, GitCompare, AlertTriangle, Minus, Plus, Edit3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import JsonDiffVisualization from "./json-diff-visualization"
import JsonDiffStats from "./json-diff-stats"
import { Button } from "@/components/ui/button"
import type { Commit } from "@/lib/types"
import { useState } from "react"
import JsonTreeView from "./json-tree-view"
import { compareJsonObjects, countChanges } from "@/lib/json-diff"
import type { ViewMode } from "@/lib/view-mode-utils"
import { motion } from "framer-motion"

interface CommitCompareProps {
  baseCommit: Commit
  compareCommit: Commit
  baseData: any
  compareData: any
  isLoading: boolean
  selectedFile: string
  viewMode?: ViewMode
}

export default function CommitCompare({
  baseCommit,
  compareCommit,
  baseData,
  compareData,
  isLoading,
  selectedFile,
  viewMode = "advanced",
}: CommitCompareProps) {
  const [error, setError] = useState<string | null>(null)

  // Calculate diff statistics
  const diff = baseData && compareData ? compareJsonObjects(baseData, compareData) : null
  const { added, removed, changed, unchanged } = diff
    ? countChanges(diff)
    : { added: 0, removed: 0, changed: 0, unchanged: 0 }
  const totalChanges = added + removed + changed

  // Get time difference between commits
  const getTimeDifference = () => {
    const baseDate = new Date(baseCommit.date)
    const compareDate = new Date(compareCommit.date)
    const diffMs = Math.abs(compareDate.getTime() - baseDate.getTime())
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} apart`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} apart`
    } else {
      return "Less than an hour apart"
    }
  }

  // Get security impact assessment
  const getSecurityImpact = () => {
    if (!diff) return null

    let criticalChanges = 0
    let warningChanges = 0
    let infoChanges = 0

    const assessChange = (path: string, changeType: string) => {
      const pathLower = path.toLowerCase()

      // Critical security changes
      if (pathLower.includes("expire") || pathLower.includes("threshold") || pathLower.includes("trusted")) {
        criticalChanges++
      }
      // Warning level changes
      else if (pathLower.includes("principal") || pathLower.includes("role") || pathLower.includes("rule")) {
        warningChanges++
      }
      // Info level changes
      else {
        infoChanges++
      }
    }

    const traverseChanges = (obj: any, path = "") => {
      if (!obj) return

      Object.entries(obj).forEach(([key, value]: [string, any]) => {
        const currentPath = path ? `${path}.${key}` : key

        if (value.status === "added" || value.status === "removed" || value.status === "changed") {
          assessChange(currentPath, value.status)
        }

        if (value.children) {
          traverseChanges(value.children, currentPath)
        }
      })
    }

    traverseChanges(diff)

    return { criticalChanges, warningChanges, infoChanges }
  }

  const securityImpact = getSecurityImpact()

  return (
    <div className="space-y-6">
      {/* Enhanced Comparison Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <GitCompare className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-800">Security Metadata Comparison</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Analyzing changes in {selectedFile} • {getTimeDifference()}
                </p>
              </div>
            </div>
            {totalChanges > 0 && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-white border-indigo-200">
                  {totalChanges} change{totalChanges !== 1 ? "s" : ""}
                </Badge>
                {securityImpact && securityImpact.criticalChanges > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {securityImpact.criticalChanges} critical
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Commit Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                  Base Commit
                </Badge>
                <code className="bg-blue-100 px-2 py-1 rounded text-xs font-mono border border-blue-200">
                  {baseCommit.hash.substring(0, 8)}
                </code>
              </div>
              <p className="text-sm text-slate-700 mb-2 font-medium">{baseCommit.message}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{baseCommit.author}</span>
                <span>{new Date(baseCommit.date).toLocaleDateString()}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-white rounded-lg border border-green-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  Compare Commit
                </Badge>
                <code className="bg-green-100 px-2 py-1 rounded text-xs font-mono border border-green-200">
                  {compareCommit.hash.substring(0, 8)}
                </code>
              </div>
              <p className="text-sm text-slate-700 mb-2 font-medium">{compareCommit.message}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{compareCommit.author}</span>
                <span>{new Date(compareCommit.date).toLocaleDateString()}</span>
              </div>
            </motion.div>
          </div>

          {/* Quick Stats */}
          {totalChanges > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              <div className="bg-white p-3 rounded-lg border border-green-200 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Plus className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-lg font-bold text-green-600">{added}</span>
                </div>
                <p className="text-xs text-slate-600">Added</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-red-200 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Minus className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-lg font-bold text-red-600">{removed}</span>
                </div>
                <p className="text-xs text-slate-600">Removed</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-amber-200 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Edit3 className="h-4 w-4 text-amber-600 mr-1" />
                  <span className="text-lg font-bold text-amber-600">{changed}</span>
                </div>
                <p className="text-xs text-slate-600">Modified</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-lg font-bold text-slate-600">{unchanged}</span>
                </div>
                <p className="text-xs text-slate-600">Unchanged</p>
              </div>
            </motion.div>
          )}

          {/* Security Impact Assessment */}
          {securityImpact && (securityImpact.criticalChanges > 0 || securityImpact.warningChanges > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg border border-amber-200"
            >
              <h4 className="font-medium text-slate-800 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
                Security Impact Assessment
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                {securityImpact.criticalChanges > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 font-medium">
                      {securityImpact.criticalChanges} critical security change
                      {securityImpact.criticalChanges !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {securityImpact.warningChanges > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-amber-700 font-medium">
                      {securityImpact.warningChanges} policy change{securityImpact.warningChanges !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {securityImpact.infoChanges > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-700">
                      {securityImpact.infoChanges} other change{securityImpact.infoChanges !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="visualization" className="w-full">
        <TabsList className="mb-4 bg-white/80 backdrop-blur-sm">
          <TabsTrigger
            value="visualization"
            className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
          >
            Visual Diff
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            Change Analysis
          </TabsTrigger>
          <TabsTrigger value="tree" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            Side-by-Side
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Change Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="mt-0">
          <div className="h-[600px] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <span className="ml-2">Loading security metadata comparison...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-red-500">
                <AlertTriangle className="h-16 w-16 mb-4 text-red-400" />
                <p>{error}</p>
                <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setError(null)}>
                  Try Again
                </Button>
              </div>
            ) : baseData && compareData ? (
              <JsonDiffVisualization baseData={baseData} compareData={compareData} viewMode={viewMode} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <GitCompare className="h-16 w-16 mb-4 text-slate-300" />
                <p>Select two commits to compare security metadata</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-0">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <span className="ml-2">Loading security metadata comparison...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-red-500">
                <AlertTriangle className="h-16 w-16 mb-4 text-red-400" />
                <p>{error}</p>
                <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setError(null)}>
                  Try Again
                </Button>
              </div>
            ) : baseData && compareData ? (
              <JsonDiffStats baseData={baseData} compareData={compareData} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
                <GitCompare className="h-16 w-16 mb-4 text-slate-300" />
                <p>Select two commits to compare security metadata</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tree" className="mt-0">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
            {isLoading ? (
              <div className="flex items-center justify-center h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <span className="ml-2">Loading tree comparison...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-[600px] text-red-500">
                <AlertTriangle className="h-16 w-16 mb-4 text-red-400" />
                <p>{error}</p>
                <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setError(null)}>
                  Try Again
                </Button>
              </div>
            ) : baseData && compareData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border border-blue-200">
                    <Badge variant="outline" className="bg-white text-blue-700 border-blue-300">
                      Base
                    </Badge>
                    <code className="text-xs font-mono">{baseCommit.hash.substring(0, 8)}</code>
                    <span className="text-xs text-slate-600 ml-auto">
                      {new Date(baseCommit.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="border rounded-lg max-h-[500px] overflow-auto">
                    <JsonTreeView jsonData={baseData} viewMode={viewMode} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
                    <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                      Compare
                    </Badge>
                    <code className="text-xs font-mono">{compareCommit.hash.substring(0, 8)}</code>
                    <span className="text-xs text-slate-600 ml-auto">
                      {new Date(compareCommit.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="border rounded-lg max-h-[500px] overflow-auto">
                    <JsonTreeView jsonData={compareData} viewMode={viewMode} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[600px] text-slate-500">
                <GitCompare className="h-16 w-16 mb-4 text-slate-300" />
                <p>Select two commits to compare in tree view</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-0">
          <ChangeTimeline
            baseCommit={baseCommit}
            compareCommit={compareCommit}
            baseData={baseData}
            compareData={compareData}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// New component for change timeline
function ChangeTimeline({
  baseCommit,
  compareCommit,
  baseData,
  compareData,
  isLoading,
}: {
  baseCommit: Commit
  compareCommit: Commit
  baseData: any
  compareData: any
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading change timeline...</span>
      </div>
    )
  }

  if (!baseData || !compareData) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
        <GitCompare className="h-16 w-16 mb-4 text-slate-300" />
        <p>Select two commits to view change timeline</p>
      </div>
    )
  }

  const diff = compareJsonObjects(baseData, compareData)
  const changes: Array<{
    path: string
    type: "added" | "removed" | "changed"
    oldValue?: any
    newValue?: any
    impact: "critical" | "warning" | "info"
  }> = []

  const getImpactLevel = (path: string): "critical" | "warning" | "info" => {
    const pathLower = path.toLowerCase()
    if (pathLower.includes("expire") || pathLower.includes("threshold") || pathLower.includes("trusted")) {
      return "critical"
    } else if (pathLower.includes("principal") || pathLower.includes("role") || pathLower.includes("rule")) {
      return "warning"
    }
    return "info"
  }

  const traverseChanges = (obj: any, path = "") => {
    if (!obj) return

    Object.entries(obj).forEach(([key, value]: [string, any]) => {
      const currentPath = path ? `${path}.${key}` : key

      if (value.status === "added") {
        changes.push({
          path: currentPath,
          type: "added",
          newValue: value.value,
          impact: getImpactLevel(currentPath),
        })
      } else if (value.status === "removed") {
        changes.push({
          path: currentPath,
          type: "removed",
          oldValue: value.value,
          impact: getImpactLevel(currentPath),
        })
      } else if (value.status === "changed") {
        changes.push({
          path: currentPath,
          type: "changed",
          oldValue: value.oldValue,
          newValue: value.value,
          impact: getImpactLevel(currentPath),
        })
      }

      if (value.children) {
        traverseChanges(value.children, currentPath)
      }
    })
  }

  traverseChanges(diff)

  // Sort changes by impact level
  const sortedChanges = changes.sort((a, b) => {
    const impactOrder = { critical: 0, warning: 1, info: 2 }
    return impactOrder[a.impact] - impactOrder[b.impact]
  })

  // Enhanced change analysis with outcome descriptions
  const getChangeOutcome = (change: any): string => {
    const pathLower = change.path.toLowerCase()

    if (pathLower.includes("expires")) {
      if (change.type === "changed") {
        const oldDate = new Date(change.oldValue)
        const newDate = new Date(change.newValue)
        const extended = newDate > oldDate
        return extended
          ? `Security metadata validity extended until ${newDate.toLocaleDateString()}. This gives more time before renewal is required.`
          : `Security metadata validity shortened to ${newDate.toLocaleDateString()}. Renewal will be required sooner.`
      }
      return change.type === "added"
        ? `New expiration date set. Security metadata will need renewal by ${new Date(change.newValue).toLocaleDateString()}.`
        : "Expiration date removed. This may indicate a configuration error or security risk."
    }

    if (pathLower.includes("threshold")) {
      if (change.type === "changed") {
        const increased = change.newValue > change.oldValue
        return increased
          ? `Security threshold increased from ${change.oldValue} to ${change.newValue} signatures. This makes the repository more secure but requires more approvals.`
          : `Security threshold decreased from ${change.oldValue} to ${change.newValue} signatures. This makes operations easier but potentially less secure.`
      }
      return change.type === "added"
        ? `New security threshold of ${change.newValue} signature(s) required. Operations now need multiple approvals.`
        : "Security threshold removed. This may allow unauthorized operations."
    }

    if (pathLower.includes("principals")) {
      if (change.type === "added") {
        return "New security principal added. This person/key can now sign and validate repository operations."
      }
      if (change.type === "removed") {
        return "Security principal removed. This person/key can no longer sign or validate operations."
      }
      return "Security principal modified. The cryptographic identity or permissions have been updated."
    }

    if (pathLower.includes("roles")) {
      if (change.type === "added") {
        return "New access role created. This defines a new set of permissions and responsibilities."
      }
      if (change.type === "removed") {
        return "Access role removed. Users previously assigned to this role may lose permissions."
      }
      return "Access role modified. The permissions or assigned principals have been updated."
    }

    if (pathLower.includes("rules")) {
      if (change.type === "added") {
        return "New security rule added. This creates additional protection for specific repository paths or actions."
      }
      if (change.type === "removed") {
        return "Security rule removed. Protection for certain paths or actions has been lifted."
      }
      return "Security rule modified. The protection scope or requirements have been updated."
    }

    if (pathLower.includes("trusted")) {
      if (change.type === "changed") {
        return change.newValue
          ? "Component marked as trusted. This grants it special privileges in the security framework."
          : "Component trust revoked. It no longer has special privileges and may be restricted."
      }
      return change.type === "added"
        ? "New trusted component added. This grants special security privileges."
        : "Trusted component removed. Special privileges have been revoked."
    }

    if (pathLower.includes("github")) {
      if (change.type === "added") {
        return "GitHub App integration added. This allows automated operations through GitHub workflows."
      }
      if (change.type === "removed") {
        return "GitHub App integration removed. Automated operations through GitHub are no longer possible."
      }
      return "GitHub App integration modified. The permissions or configuration have been updated."
    }

    if (pathLower.includes("pattern")) {
      return change.type === "added"
        ? `New protection pattern "${change.newValue}" added. This defines which repository paths are protected.`
        : change.type === "removed"
          ? `Protection pattern "${change.oldValue}" removed. These paths are no longer protected.`
          : `Protection pattern changed from "${change.oldValue}" to "${change.newValue}". Different paths are now protected.`
    }

    if (pathLower.includes("action")) {
      return change.type === "added"
        ? `New protected action "${change.newValue}" defined. This operation now requires authorization.`
        : change.type === "removed"
          ? `Protected action "${change.oldValue}" removed. This operation no longer requires authorization.`
          : `Protected action changed from "${change.oldValue}" to "${change.newValue}". Different operations are now controlled.`
    }

    if (pathLower.includes("identity")) {
      return change.type === "added"
        ? `New identity "${change.newValue}" added. This person can now be authenticated for repository operations.`
        : change.type === "removed"
          ? `Identity "${change.oldValue}" removed. This person can no longer be authenticated.`
          : `Identity changed from "${change.oldValue}" to "${change.newValue}". The authentication details have been updated.`
    }

    if (pathLower.includes("keytype")) {
      return change.type === "changed"
        ? `Key algorithm changed from ${change.oldValue} to ${change.newValue}. This affects how signatures are created and verified.`
        : change.type === "added"
          ? `Key algorithm ${change.newValue} specified. This determines the cryptographic method used.`
          : "Key algorithm specification removed. This may cause signature verification issues."
    }

    if (pathLower.includes("schemaversion")) {
      return change.type === "changed"
        ? `Schema version updated from ${change.oldValue} to ${change.newValue}. The metadata structure has been modernized.`
        : "Schema version specification updated. This affects how the metadata is interpreted."
    }

    // Generic outcomes based on change type
    switch (change.type) {
      case "added":
        return "New configuration element added. This extends the security framework with additional settings."
      case "removed":
        return "Configuration element removed. This simplifies the setup but may reduce security coverage."
      case "changed":
        return "Configuration element modified. The security behavior has been adjusted."
      default:
        return "Security configuration updated."
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-slate-800">Change Timeline</h3>
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <span>From</span>
          <code className="bg-slate-100 px-2 py-1 rounded">{baseCommit.hash.substring(0, 8)}</code>
          <span>to</span>
          <code className="bg-slate-100 px-2 py-1 rounded">{compareCommit.hash.substring(0, 8)}</code>
        </div>
      </div>

      {sortedChanges.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p>No changes detected between these commits</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedChanges.map((change, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${
                change.impact === "critical"
                  ? "border-red-500 bg-red-50"
                  : change.impact === "warning"
                    ? "border-amber-500 bg-amber-50"
                    : "border-blue-500 bg-blue-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {change.type === "added" ? (
                      <Plus className="h-4 w-4 text-green-600" />
                    ) : change.type === "removed" ? (
                      <Minus className="h-4 w-4 text-red-600" />
                    ) : (
                      <Edit3 className="h-4 w-4 text-amber-600" />
                    )}
                    <code className="text-sm font-mono bg-white px-2 py-1 rounded border">{change.path}</code>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        change.impact === "critical"
                          ? "bg-red-100 text-red-700 border-red-200"
                          : change.impact === "warning"
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                      }`}
                    >
                      {change.impact}
                    </Badge>
                  </div>

                  <div className="text-sm">
                    {change.type === "changed" && (
                      <div className="space-y-2">
                        <p className="text-amber-700 font-medium">Modified field</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="bg-white p-2 rounded border border-red-200">
                            <p className="text-xs text-red-600 font-medium mb-1">Before:</p>
                            <code className="text-xs">{JSON.stringify(change.oldValue, null, 2)}</code>
                          </div>
                          <div className="bg-white p-2 rounded border border-green-200">
                            <p className="text-xs text-green-600 font-medium mb-1">After:</p>
                            <code className="text-xs">{JSON.stringify(change.newValue, null, 2)}</code>
                          </div>
                        </div>
                        {/* Add outcome description */}
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                          <p className="text-xs text-blue-800 font-medium mb-1">Outcome:</p>
                          <p className="text-xs text-blue-700">{getChangeOutcome(change)}</p>
                        </div>
                      </div>
                    )}

                    {change.type === "added" && (
                      <div className="space-y-2">
                        <p className="text-green-700 font-medium">Added new field</p>
                        <div className="bg-white p-2 rounded border border-green-200">
                          <code className="text-xs">{JSON.stringify(change.newValue, null, 2)}</code>
                        </div>
                        {/* Add outcome description */}
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                          <p className="text-xs text-blue-800 font-medium mb-1">Outcome:</p>
                          <p className="text-xs text-blue-700">{getChangeOutcome(change)}</p>
                        </div>
                      </div>
                    )}

                    {change.type === "removed" && (
                      <div className="space-y-2">
                        <p className="text-red-700 font-medium">Removed field</p>
                        <div className="bg-white p-2 rounded border border-red-200">
                          <code className="text-xs line-through">{JSON.stringify(change.oldValue, null, 2)}</code>
                        </div>
                        {/* Add outcome description */}
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                          <p className="text-xs text-blue-800 font-medium mb-1">Outcome:</p>
                          <p className="text-xs text-blue-700">{getChangeOutcome(change)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
