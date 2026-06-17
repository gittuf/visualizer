"use client"

import { useState, useMemo } from "react"
import {
  Loader2,
  TrendingUp,
  GitCommit,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { compareJsonObjects, type DiffResult, type DiffEntry } from "@/lib/json-diff"
import type { Commit, SecurityEvent, SecurityTrend } from "@/lib/types"
import { motion } from "framer-motion"
import { SecurityInsights } from "./security-insights"
import { SecurityRecommendations } from "./security-recommendations"

interface CommitAnalysisProps {
  commits: Commit[]
  isLoading: boolean
  selectedFile: string
}

export default function CommitAnalysis({ commits, isLoading, selectedFile }: CommitAnalysisProps) {
  const [activeTab, setActiveTab] = useState("timeline")
  const [error] = useState<string | null>(null)

  const analyzeSecurityEvents = (diff: DiffResult | DiffEntry | null, commit: Commit): SecurityEvent[] => {
    const events: SecurityEvent[] = []

    // If diff is null or singular DiffEntry (root change), we might need to handle it.
    // Assuming structure is mostly Record<string, DiffEntry> for traversal.
    
    const traverseChanges = (obj: Record<string, DiffEntry> | undefined, path = "") => {
      if (!obj) return

      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key
        const pathLower = currentPath.toLowerCase()

        if (value.status === "added" || value.status === "removed" || value.status === "changed") {
          let event: SecurityEvent | null = null

          // Expiration changes
          if (pathLower.includes("expires")) {
            if (value.status === "changed") {
              const oldDate = new Date(String(value.oldValue))
              const newDate = new Date(String(value.value))
              const extended = newDate > oldDate

              event = {
                commit: commit.hash.substring(0, 8),
                date: commit.date,
                author: commit.author,
                message: commit.message,
                type: "expiration_change",
                severity: extended ? "medium" : "high",
                description: extended ? "Security validity extended" : "Security validity shortened",
                details: `Expiration ${extended ? "extended" : "shortened"} from ${oldDate.toLocaleDateString()} to ${newDate.toLocaleDateString()}`,
                impact: extended
                  ? "Positive: More time before renewal required"
                  : "Negative: Earlier renewal required, potential service disruption risk",
              }
            }
          }

          // Threshold changes
          else if (pathLower.includes("threshold")) {
            if (value.status === "changed" && typeof value.value === 'number' && typeof value.oldValue === 'number') {
              const increased = value.value > value.oldValue
              event = {
                commit: commit.hash.substring(0, 8),
                date: commit.date,
                author: commit.author,
                message: commit.message,
                type: increased ? "security_enhancement" : "security_degradation",
                severity: increased ? "medium" : "high",
                description: `Security threshold ${increased ? "increased" : "decreased"}`,
                details: `Threshold changed from ${value.oldValue} to ${value.value} required signatures`,
                impact: increased
                  ? "Positive: Enhanced security, requires more approvals"
                  : "Negative: Reduced security, fewer approvals needed",
              }
            }
          }

          // Principal changes
          else if (pathLower.includes("principals") || pathLower.includes("principalids")) {
            event = {
              commit: commit.hash.substring(0, 8),
              date: commit.date,
              author: commit.author,
              message: commit.message,
              type: "principal_change",
              severity: value.status === "removed" ? "high" : "medium",
              description: `Security principal ${value.status}`,
              details: `Principal access ${value.status === "added" ? "granted" : value.status === "removed" ? "revoked" : "modified"}`,
              impact:
                value.status === "added"
                  ? "Neutral: New authorized user added"
                  : value.status === "removed"
                    ? "Negative: User access revoked, may impact operations"
                    : "Neutral: User permissions modified",
            }
          }

          // Trust changes
          else if (pathLower.includes("trusted")) {
            if (value.status === "changed") {
              const nowTrusted = value.value === true
              event = {
                commit: commit.hash.substring(0, 8),
                date: commit.date,
                author: commit.author,
                message: commit.message,
                type: nowTrusted ? "security_enhancement" : "security_degradation",
                severity: "medium",
                description: `Component trust ${nowTrusted ? "granted" : "revoked"}`,
                details: `Trust status changed to ${value.value}`,
                impact: nowTrusted
                  ? "Positive: Component granted special privileges"
                  : "Negative: Component privileges revoked",
              }
            }
          }

          // Rule changes
          else if (pathLower.includes("rules")) {
            event = {
              commit: commit.hash.substring(0, 8),
              date: commit.date,
              author: commit.author,
              message: commit.message,
              type: "policy_change",
              severity: value.status === "removed" ? "high" : "medium",
              description: `Security rule ${value.status}`,
              details: `Protection rule ${value.status === "added" ? "created" : value.status === "removed" ? "removed" : "modified"}`,
              impact:
                value.status === "added"
                  ? "Positive: New protection rule added"
                  : value.status === "removed"
                    ? "Negative: Protection rule removed, reduced security"
                    : "Neutral: Protection rule updated",
            }
          }

          if (event) {
            events.push(event)
          }
        }

        if (value.children) {
          traverseChanges(value.children, currentPath)
        }
      })
    }

    if (diff && !('status' in diff)) {
        traverseChanges(diff as DiffResult)
    } else if (diff && 'status' in diff && (diff as DiffEntry).children) {
        // If root is a DiffEntry with children
        traverseChanges((diff as DiffEntry).children)
    }
    
    return events
  }



  const calculateSecurityTrends = (commits: Commit[]): SecurityTrend[] => {
    const trends: SecurityTrend[] = []

    if (commits.length < 2) return trends

    const firstCommit = commits[0]
    const lastCommit = commits[commits.length - 1]

    // Principal count trend
    const firstPrincipals = firstCommit.data?.principals && typeof firstCommit.data.principals === 'object' && !Array.isArray(firstCommit.data.principals) ? Object.keys(firstCommit.data.principals).length : 0
    const lastPrincipals = lastCommit.data?.principals && typeof lastCommit.data.principals === 'object' && !Array.isArray(lastCommit.data.principals) ? Object.keys(lastCommit.data.principals).length : 0

    trends.push({
      metric: "Security Principals",
      trend: lastPrincipals > firstPrincipals ? "improving" : lastPrincipals < firstPrincipals ? "declining" : "stable",
      current: lastPrincipals,
      previous: firstPrincipals,
      description: "Number of authorized security principals",
    })

    // Rules count trend
    const firstRules = firstCommit.data?.rules && typeof firstCommit.data.rules === 'object' && !Array.isArray(firstCommit.data.rules) ? Object.keys(firstCommit.data.rules).length : 0
    const lastRules = lastCommit.data?.rules && typeof lastCommit.data.rules === 'object' && !Array.isArray(lastCommit.data.rules) ? Object.keys(lastCommit.data.rules).length : 0

    trends.push({
      metric: "Security Rules",
      trend: lastRules > firstRules ? "improving" : lastRules < firstRules ? "declining" : "stable",
      current: lastRules,
      previous: firstRules,
      description: "Number of active security rules",
    })

    // Expiration health
    if (lastCommit.data?.expires && typeof lastCommit.data.expires === 'string') {
      const expiryDate = new Date(lastCommit.data.expires)
      const now = new Date()
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      trends.push({
        metric: "Expiration Health",
        trend: daysUntilExpiry > 90 ? "improving" : daysUntilExpiry > 30 ? "stable" : "declining",
        current: daysUntilExpiry,
        previous: 0, // We don't track historical expiration health
        description: "Days until security metadata expires",
      })
    }

    return trends
  }

  // Process commits data for comprehensive analysis using useMemo
  const { securityEvents, securityTrends } = useMemo(() => {
    if (!commits || commits.length < 2) {
      return { securityEvents: [] as SecurityEvent[], securityTrends: [] as SecurityTrend[] }
    }

    try {
      // Sort commits by date
      const sortedCommits = [...commits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      const events: SecurityEvent[] = []
      const trends: SecurityTrend[] = []

      // Analyze each commit transition
      for (let i = 1; i < sortedCommits.length; i++) {
        const prevCommit = sortedCommits[i - 1]
        const currentCommit = sortedCommits[i]

        if (prevCommit.data && currentCommit.data) {
          const diff = compareJsonObjects(prevCommit.data, currentCommit.data)
          const commitEvents = analyzeSecurityEvents(diff, currentCommit)
          events.push(...commitEvents)
        }
      }

      // Calculate trends
      const calculatedTrends = calculateSecurityTrends(sortedCommits)
      trends.push(...calculatedTrends)

      return { securityEvents: events, securityTrends: trends }
    } catch (err) {
      console.error("Error processing analysis data:", err)
      return { securityEvents: [] as SecurityEvent[], securityTrends: [] as SecurityTrend[] }
    }
  }, [commits])





  return (
    <div className="space-y-6">
      {/* Security Overview Dashboard */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-800">Security Analysis Dashboard</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Analyzing {commits.length} commits across {selectedFile}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <GitCommit className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Commits Analyzed</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{commits.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-slate-700">Security Events</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{securityEvents.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-slate-700">Active Trends</span>
              </div>
              <div className="text-2xl font-bold text-amber-600">{securityTrends.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-slate-700">Time Span</span>
              </div>
              <div className="text-sm font-bold text-purple-600">
                {commits.length > 1
                  ? `${Math.ceil((new Date(commits[commits.length - 1].date).getTime() - new Date(commits[0].date).getTime()) / (1000 * 60 * 60 * 24))} days`
                  : "N/A"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="timeline" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Security Timeline
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            Trends Analysis
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            Security Insights
          </TabsTrigger>
          <TabsTrigger
            value="recommendations"
            className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
          >
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-0">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Security Events Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2">Analyzing security events...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-400" />
                  <p>{error}</p>
                </div>
              ) : securityEvents.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {securityEvents.map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 ${
                        event.severity === "critical"
                          ? "border-red-500 bg-red-50"
                          : event.severity === "high"
                            ? "border-orange-500 bg-orange-50"
                            : event.severity === "medium"
                              ? "border-yellow-500 bg-yellow-50"
                              : "border-blue-500 bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {event.commit}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                event.severity === "critical"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : event.severity === "high"
                                    ? "bg-orange-100 text-orange-700 border-orange-200"
                                    : event.severity === "medium"
                                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                      : "bg-blue-100 text-blue-700 border-blue-200"
                              }`}
                            >
                              {event.severity}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {new Date(event.date).toLocaleDateString()} by {event.author}
                            </span>
                          </div>
                          <h4 className="font-medium text-slate-800 mb-1">{event.description}</h4>
                          <p className="text-sm text-slate-600 mb-2">{event.details}</p>
                          <div className="bg-white p-2 rounded border border-slate-200">
                            <p className="text-xs text-slate-700">
                              <span className="font-medium">Impact:</span> {event.impact}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p>No significant security events detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-0">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Security Trends Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                  <span className="ml-2">Analyzing security trends...</span>
                </div>
              ) : securityTrends.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {securityTrends.map((trend, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-800">{trend.metric}</h4>
                        <Badge
                          variant="outline"
                          className={`${
                            trend.trend === "improving"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : trend.trend === "declining"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {trend.trend}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="text-2xl font-bold text-slate-800">{trend.current}</div>
                        {trend.previous !== undefined && (
                          <div className="text-sm text-slate-500">from {trend.previous}</div>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{trend.description}</p>
                      {trend.metric === "Expiration Health" && (
                        <div className="mt-3">
                          <Progress value={Math.max(0, Math.min(100, (trend.current / 365) * 100))} className="h-2" />
                          <p className="text-xs text-slate-500 mt-1">
                            {trend.current > 0 ? `${trend.current} days remaining` : "Expired"}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p>No trends available with current data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-0">
          <SecurityInsights
            commits={commits}
            securityEvents={securityEvents}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-0">
          <SecurityRecommendations
            commits={commits}
            securityEvents={securityEvents}
            securityTrends={securityTrends}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
