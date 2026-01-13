"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { PlusCircle, MinusCircle, RefreshCw, Info, AlertTriangle, Shield, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { compareJsonObjects, countChanges } from "@/lib/json-diff"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface JsonDiffStatsProps {
  baseData: any
  compareData: any
}

export default function JsonDiffStats({ baseData, compareData }: JsonDiffStatsProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "details" | "security">("summary")

  // Compare the two JSON objects
  const diff = compareJsonObjects(baseData, compareData)
  const { added, removed, changed, unchanged } = countChanges(diff)

  const total = added + removed + changed + unchanged
  const addedPercent = Math.round((added / total) * 100) || 0
  const removedPercent = Math.round((removed / total) * 100) || 0
  const changedPercent = Math.round((changed / total) * 100) || 0
  const unchangedPercent = Math.round((unchanged / total) * 100) || 0

  // Enhanced security analysis
  const getSecurityAnalysis = () => {
    const securityChanges = {
      expiration: [],
      principals: [],
      roles: [],
      rules: [],
      thresholds: [],
      trust: [],
      other: [],
    } as any

    const analyzeChange = (path: string, changeType: string, oldValue?: any, newValue?: any) => {
      const pathLower = path.toLowerCase()
      const change = { path, type: changeType, oldValue, newValue }

      if (pathLower.includes("expire")) {
        securityChanges.expiration.push(change)
      } else if (pathLower.includes("principal")) {
        securityChanges.principals.push(change)
      } else if (pathLower.includes("role")) {
        securityChanges.roles.push(change)
      } else if (pathLower.includes("rule")) {
        securityChanges.rules.push(change)
      } else if (pathLower.includes("threshold")) {
        securityChanges.thresholds.push(change)
      } else if (pathLower.includes("trusted")) {
        securityChanges.trust.push(change)
      } else {
        securityChanges.other.push(change)
      }
    }

    const traverse = (obj: any, path = "") => {
      if (!obj) return

      Object.entries(obj).forEach(([key, value]: [string, any]) => {
        const currentPath = path ? `${path}.${key}` : key

        if (value.status === "added") {
          analyzeChange(currentPath, "added", undefined, value.value)
        } else if (value.status === "removed") {
          analyzeChange(currentPath, "removed", value.value, undefined)
        } else if (value.status === "changed") {
          analyzeChange(currentPath, "changed", value.oldValue, value.value)
        }

        if (value.children) {
          traverse(value.children, currentPath)
        }
      })
    }

    traverse(diff)
    return securityChanges
  }

  const securityAnalysis = getSecurityAnalysis()

  // Find the most significant changes with enhanced categorization
  const findSignificantChanges = () => {
    const changes: {
      path: string
      type: string
      oldValue?: any
      newValue?: any
      category: string
      impact: "high" | "medium" | "low"
    }[] = []

    const getCategory = (path: string) => {
      const pathLower = path.toLowerCase()
      if (pathLower.includes("expire")) return "Security Expiration"
      if (pathLower.includes("principal")) return "Security Principals"
      if (pathLower.includes("role")) return "Access Roles"
      if (pathLower.includes("rule")) return "Security Rules"
      if (pathLower.includes("threshold")) return "Security Thresholds"
      if (pathLower.includes("trusted")) return "Trust Settings"
      if (pathLower.includes("github")) return "GitHub Integration"
      return "Other"
    }

    const getImpact = (path: string, type: string) => {
      const pathLower = path.toLowerCase()
      if (pathLower.includes("expire") || pathLower.includes("threshold") || pathLower.includes("trusted")) {
        return "high" as const
      }
      if (pathLower.includes("principal") || pathLower.includes("role") || pathLower.includes("rule")) {
        return "medium" as const
      }
      return "low" as const
    }

    const traverse = (obj: any, path = "") => {
      if (!obj) return

      Object.entries(obj).forEach(([key, value]: [string, any]) => {
        const currentPath = path ? `${path}.${key}` : key

        if (value.status === "added") {
          changes.push({
            path: currentPath,
            type: "added",
            newValue: typeof value.value === "object" ? "Complex object" : value.value,
            category: getCategory(currentPath),
            impact: getImpact(currentPath, "added"),
          })
        } else if (value.status === "removed") {
          changes.push({
            path: currentPath,
            type: "removed",
            oldValue: typeof value.value === "object" ? "Complex object" : value.value,
            category: getCategory(currentPath),
            impact: getImpact(currentPath, "removed"),
          })
        } else if (value.status === "changed") {
          changes.push({
            path: currentPath,
            type: "changed",
            oldValue: value.oldValue,
            newValue: value.value,
            category: getCategory(currentPath),
            impact: getImpact(currentPath, "changed"),
          })
        }

        if (value.children) {
          traverse(value.children, currentPath)
        }
      })
    }

    traverse(diff)

    // Sort by impact level, then by category
    return changes
      .sort((a, b) => {
        const impactOrder = { high: 0, medium: 1, low: 2 }
        if (impactOrder[a.impact] !== impactOrder[b.impact]) {
          return impactOrder[a.impact] - impactOrder[b.impact]
        }
        return a.category.localeCompare(b.category)
      })
      .slice(0, 15) // Show top 15 changes
  }

  const significantChanges = findSignificantChanges()

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md shadow-sm bg-white">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
              activeTab === "summary"
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 text-sm font-medium border-t border-b ${
              activeTab === "security"
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
            }`}
          >
            Security Impact
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
              activeTab === "details"
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
            }`}
          >
            Detailed Changes
          </button>
        </div>
      </div>

      {activeTab === "summary" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="hover:shadow-md transition-shadow duration-200 border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-600 flex items-center">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Added
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{added}</div>
                    <div className="text-sm text-gray-500">elements ({addedPercent}%)</div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${addedPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-green-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Added Elements</h4>
                  <p className="text-sm">{added} new elements were added to the security metadata.</p>
                  {added > 0 && (
                    <div className="text-xs bg-green-50 p-2 rounded border border-green-200">
                      <span className="font-medium">Impact:</span> New elements may introduce new security policies or
                      principals.
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="hover:shadow-md transition-shadow duration-200 border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-600 flex items-center">
                      <MinusCircle className="h-4 w-4 mr-2" />
                      Removed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{removed}</div>
                    <div className="text-sm text-gray-500">elements ({removedPercent}%)</div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${removedPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-red-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Removed Elements</h4>
                  <p className="text-sm">{removed} elements were removed from the security metadata.</p>
                  {removed > 0 && (
                    <div className="text-xs bg-red-50 p-2 rounded border border-red-200">
                      <span className="font-medium">Impact:</span> Removed elements may affect security policies or
                      remove trusted principals.
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="hover:shadow-md transition-shadow duration-200 border-amber-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-600 flex items-center">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Changed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">{changed}</div>
                    <div className="text-sm text-gray-500">elements ({changedPercent}%)</div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${changedPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-amber-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Changed Elements</h4>
                  <p className="text-sm">{changed} elements were modified in the security metadata.</p>
                  {changed > 0 && (
                    <div className="text-xs bg-amber-50 p-2 rounded border border-amber-200">
                      <span className="font-medium">Impact:</span> Modified elements may change security behavior. Pay
                      attention to threshold and expiry changes.
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="hover:shadow-md transition-shadow duration-200 border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Unchanged</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-600">{unchanged}</div>
                    <div className="text-sm text-gray-500">elements ({unchangedPercent}%)</div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${unchangedPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gray-400"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Unchanged Elements</h4>
                  <p className="text-sm">{unchanged} elements remained the same between versions.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-indigo-600" />
            Security Impact Analysis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(securityAnalysis).map(([category, changes]: [string, any[]]) => {
              if (changes.length === 0) return null

              const categoryNames = {
                expiration: "Security Expiration",
                principals: "Security Principals",
                roles: "Access Roles",
                rules: "Security Rules",
                thresholds: "Security Thresholds",
                trust: "Trust Settings",
                other: "Other Changes",
              } as any

              const categoryIcons = {
                expiration: <AlertTriangle className="h-4 w-4 text-red-500" />,
                principals: <Shield className="h-4 w-4 text-blue-500" />,
                roles: <TrendingUp className="h-4 w-4 text-purple-500" />,
                rules: <Info className="h-4 w-4 text-green-500" />,
                thresholds: <RefreshCw className="h-4 w-4 text-amber-500" />,
                trust: <Shield className="h-4 w-4 text-indigo-500" />,
                other: <Info className="h-4 w-4 text-gray-500" />,
              } as any

              return (
                <Card key={category} className="border-l-4 border-l-indigo-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      {categoryIcons[category]}
                      <span className="ml-2">{categoryNames[category]}</span>
                      <Badge variant="outline" className="ml-auto">
                        {changes.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {changes.slice(0, 3).map((change, index) => (
                        <div key={index} className="text-xs p-2 bg-gray-50 rounded border">
                          <div className="font-mono text-gray-700">{change.path}</div>
                          <div
                            className={`text-xs mt-1 ${
                              change.type === "added"
                                ? "text-green-600"
                                : change.type === "removed"
                                  ? "text-red-600"
                                  : "text-amber-600"
                            }`}
                          >
                            {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                          </div>
                        </div>
                      ))}
                      {changes.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">+{changes.length - 3} more changes</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === "details" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Detailed Change Analysis</h3>

          {significantChanges.length > 0 ? (
            <div className="space-y-3">
              {significantChanges.map((change, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    change.impact === "high"
                      ? "border-red-500 bg-red-50"
                      : change.impact === "medium"
                        ? "border-amber-500 bg-amber-50"
                        : "border-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {change.type === "added" ? (
                          <PlusCircle className="h-4 w-4 text-green-600" />
                        ) : change.type === "removed" ? (
                          <MinusCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <RefreshCw className="h-4 w-4 text-amber-600" />
                        )}
                        <code className="text-sm font-mono bg-white px-2 py-1 rounded border">{change.path}</code>
                        <Badge variant="outline" className="text-xs">
                          {change.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            change.impact === "high"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : change.impact === "medium"
                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                : "bg-blue-100 text-blue-700 border-blue-200"
                          }`}
                        >
                          {change.impact} impact
                        </Badge>
                      </div>

                      <div className="text-sm">
                        {change.type === "changed" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="bg-white p-2 rounded border border-red-200">
                              <p className="text-xs text-red-600 font-medium mb-1">Before:</p>
                              <code className="text-xs break-all">{String(change.oldValue)}</code>
                            </div>
                            <div className="bg-white p-2 rounded border border-green-200">
                              <p className="text-xs text-green-600 font-medium mb-1">After:</p>
                              <code className="text-xs break-all">{String(change.newValue)}</code>
                            </div>
                          </div>
                        )}
                        {change.type === "added" && (
                          <div className="bg-white p-2 rounded border border-green-200">
                            <p className="text-xs text-green-600 font-medium mb-1">Added:</p>
                            <code className="text-xs break-all">{String(change.newValue)}</code>
                          </div>
                        )}
                        {change.type === "removed" && (
                          <div className="bg-white p-2 rounded border border-red-200">
                            <p className="text-xs text-red-600 font-medium mb-1">Removed:</p>
                            <code className="text-xs break-all">{String(change.oldValue)}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No significant changes found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
