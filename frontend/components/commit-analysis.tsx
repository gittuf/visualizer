"use client"

import { useState, useEffect } from "react"
import {
  Loader2,
  TrendingUp,
  GitCommit,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { compareJsonObjects, countChanges } from "@/lib/json-diff"
import type { Commit } from "@/lib/types"
import { motion } from "framer-motion"

interface CommitAnalysisProps {
  commits: Commit[]
  isLoading: boolean
  selectedFile: string
}

interface SecurityEvent {
  commit: string
  date: string
  author: string
  message: string
  type: "security_enhancement" | "security_degradation" | "policy_change" | "principal_change" | "expiration_change"
  severity: "critical" | "high" | "medium" | "low"
  description: string
  details: string
  impact: string
}

interface SecurityTrend {
  metric: string
  trend: "improving" | "declining" | "stable"
  current: number
  previous: number
  description: string
}

export default function CommitAnalysis({ commits, isLoading, selectedFile }: CommitAnalysisProps) {
  const [activeTab, setActiveTab] = useState("timeline")
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [securityTrends, setSecurityTrends] = useState<SecurityTrend[]>([])
  const [overallScore, setOverallScore] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  // Process commits data for comprehensive analysis
  useEffect(() => {
    if (!commits || commits.length < 2) {
      return
    }

    try {
      // Sort commits by date
      const sortedCommits = [...commits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      const events: SecurityEvent[] = []
      const trends: SecurityTrend[] = []
      let totalSecurityScore = 0

      // Analyze each commit transition
      for (let i = 1; i < sortedCommits.length; i++) {
        const prevCommit = sortedCommits[i - 1]
        const currentCommit = sortedCommits[i]

        if (prevCommit.data && currentCommit.data) {
          const diff = compareJsonObjects(prevCommit.data, currentCommit.data)
          const { added, removed, changed } = countChanges(diff)

          // Analyze security events
          const commitEvents = analyzeSecurityEvents(diff, currentCommit)
          events.push(...commitEvents)

          // Calculate security score for this commit
          const commitScore = calculateSecurityScore(currentCommit.data, diff)
          totalSecurityScore += commitScore
        }
      }

      // Calculate trends
      const calculatedTrends = calculateSecurityTrends(sortedCommits)
      trends.push(...calculatedTrends)

      // Calculate overall security score
      const avgScore = Math.round(totalSecurityScore / (sortedCommits.length - 1))

      setSecurityEvents(events)
      setSecurityTrends(trends)
      setOverallScore(avgScore)
      setError(null)
    } catch (err) {
      console.error("Error processing analysis data:", err)
      setError("Failed to process analysis data. Please try again.")
    }
  }, [commits])

  const analyzeSecurityEvents = (diff: any, commit: Commit): SecurityEvent[] => {
    const events: SecurityEvent[] = []

    const traverseChanges = (obj: any, path = "") => {
      if (!obj) return

      Object.entries(obj).forEach(([key, value]: [string, any]) => {
        const currentPath = path ? `${path}.${key}` : key
        const pathLower = currentPath.toLowerCase()

        if (value.status === "added" || value.status === "removed" || value.status === "changed") {
          let event: SecurityEvent | null = null

          // Expiration changes
          if (pathLower.includes("expires")) {
            if (value.status === "changed") {
              const oldDate = new Date(value.oldValue)
              const newDate = new Date(value.value)
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
            if (value.status === "changed") {
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

    traverseChanges(diff)
    return events
  }

  const calculateSecurityScore = (data: any, diff: any): number => {
    let score = 50 // Base score

    // Positive factors
    if (data.expires) {
      const expiryDate = new Date(data.expires)
      const now = new Date()
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry > 90) score += 20
      else if (daysUntilExpiry > 30) score += 10
      else if (daysUntilExpiry < 0) score -= 30
    }

    // Threshold analysis
    if (data.roles) {
      Object.values(data.roles).forEach((role: any) => {
        if (role.threshold) {
          if (role.threshold >= 2) score += 15
          else if (role.threshold === 1) score += 5
        }
      })
    }

    // Rules analysis
    if (data.rules) {
      const ruleCount = Object.keys(data.rules).length
      score += Math.min(ruleCount * 5, 25) // Max 25 points for rules
    }

    // Principal diversity
    if (data.principals) {
      const principalCount = Object.keys(data.principals).length
      score += Math.min(principalCount * 3, 15) // Max 15 points for principals
    }

    return Math.max(0, Math.min(100, score))
  }

  const calculateSecurityTrends = (commits: Commit[]): SecurityTrend[] => {
    const trends: SecurityTrend[] = []

    if (commits.length < 2) return trends

    const firstCommit = commits[0]
    const lastCommit = commits[commits.length - 1]

    // Principal count trend
    const firstPrincipals = firstCommit.data?.principals ? Object.keys(firstCommit.data.principals).length : 0
    const lastPrincipals = lastCommit.data?.principals ? Object.keys(lastCommit.data.principals).length : 0

    trends.push({
      metric: "Security Principals",
      trend: lastPrincipals > firstPrincipals ? "improving" : lastPrincipals < firstPrincipals ? "declining" : "stable",
      current: lastPrincipals,
      previous: firstPrincipals,
      description: "Number of authorized security principals",
    })

    // Rules count trend
    const firstRules = firstCommit.data?.rules ? Object.keys(firstCommit.data.rules).length : 0
    const lastRules = lastCommit.data?.rules ? Object.keys(lastCommit.data.rules).length : 0

    trends.push({
      metric: "Security Rules",
      trend: lastRules > firstRules ? "improving" : lastRules < firstRules ? "declining" : "stable",
      current: lastRules,
      previous: firstRules,
      description: "Number of active security rules",
    })

    // Expiration health
    if (lastCommit.data?.expires) {
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreDescription = (score: number) => {
    if (score >= 80) return "Excellent security posture"
    if (score >= 60) return "Good security with room for improvement"
    if (score >= 40) return "Moderate security, needs attention"
    return "Poor security, immediate action required"
  }

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
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}/100</div>
              <p className="text-sm text-slate-600">{getScoreDescription(overallScore)}</p>
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
            overallScore={overallScore}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-0">
          <SecurityRecommendations
            commits={commits}
            securityEvents={securityEvents}
            securityTrends={securityTrends}
            overallScore={overallScore}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Security Insights Component
function SecurityInsights({
  commits,
  securityEvents,
  overallScore,
  isLoading,
}: {
  commits: Commit[]
  securityEvents: SecurityEvent[]
  overallScore: number
  isLoading: boolean
}) {
  const getInsights = () => {
    const insights = []

    // Most active author
    const authorCounts = commits.reduce(
      (acc, commit) => {
        acc[commit.author] = (acc[commit.author] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const mostActiveAuthor = Object.entries(authorCounts).sort(([, a], [, b]) => b - a)[0]

    if (mostActiveAuthor) {
      insights.push({
        title: "Most Active Contributor",
        description: `${mostActiveAuthor[0]} made ${mostActiveAuthor[1]} security-related commits`,
        type: "info" as const,
      })
    }

    // Security event patterns
    const eventTypes = securityEvents.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const mostCommonEvent = Object.entries(eventTypes).sort(([, a], [, b]) => b - a)[0]

    if (mostCommonEvent) {
      insights.push({
        title: "Most Common Security Change",
        description: `${mostCommonEvent[1]} ${mostCommonEvent[0].replace("_", " ")} events detected`,
        type: "warning" as const,
      })
    }

    // Critical events
    const criticalEvents = securityEvents.filter((e) => e.severity === "critical")
    if (criticalEvents.length > 0) {
      insights.push({
        title: "Critical Security Events",
        description: `${criticalEvents.length} critical security events require immediate attention`,
        type: "error" as const,
      })
    }

    // Overall health
    if (overallScore >= 80) {
      insights.push({
        title: "Strong Security Posture",
        description: "Your repository maintains excellent security practices",
        type: "success" as const,
      })
    } else if (overallScore < 50) {
      insights.push({
        title: "Security Concerns",
        description: "Multiple security issues detected that need addressing",
        type: "error" as const,
      })
    }

    return insights
  }

  const insights = getInsights()

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2 text-purple-600" />
          Security Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2">Generating insights...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === "success"
                    ? "border-green-500 bg-green-50"
                    : insight.type === "warning"
                      ? "border-yellow-500 bg-yellow-50"
                      : insight.type === "error"
                        ? "border-red-500 bg-red-50"
                        : "border-blue-500 bg-blue-50"
                }`}
              >
                <h4 className="font-medium text-slate-800 mb-2">{insight.title}</h4>
                <p className="text-sm text-slate-600">{insight.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Security Recommendations Component
function SecurityRecommendations({
  commits,
  securityEvents,
  securityTrends,
  overallScore,
  isLoading,
}: {
  commits: Commit[]
  securityEvents: SecurityEvent[]
  securityTrends: SecurityTrend[]
  overallScore: number
  isLoading: boolean
}) {
  const getRecommendations = () => {
    const recommendations = []

    // Check expiration
    const latestCommit = commits[commits.length - 1]
    if (latestCommit?.data?.expires) {
      const expiryDate = new Date(latestCommit.data.expires)
      const now = new Date()
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry < 30) {
        recommendations.push({
          priority: "high" as const,
          title: "Renew Security Metadata",
          description: `Security metadata expires in ${daysUntilExpiry} days. Plan renewal soon.`,
          action: "Update expiration date and refresh security keys",
        })
      }
    }

    // Check thresholds
    if (latestCommit?.data?.roles) {
      Object.entries(latestCommit.data.roles).forEach(([role, config]: [string, any]) => {
        if (config.threshold === 1) {
          recommendations.push({
            priority: "medium" as const,
            title: "Increase Security Threshold",
            description: `Role "${role}" only requires 1 signature. Consider increasing for better security.`,
            action: "Increase threshold to 2 or more signatures",
          })
        }
      })
    }

    // Check for declining trends
    securityTrends.forEach((trend) => {
      if (trend.trend === "declining") {
        recommendations.push({
          priority: "medium" as const,
          title: `Address Declining ${trend.metric}`,
          description: `${trend.metric} has decreased from ${trend.previous} to ${trend.current}.`,
          action: "Review and restore security measures",
        })
      }
    })

    // Overall score recommendations
    if (overallScore < 60) {
      recommendations.push({
        priority: "high" as const,
        title: "Improve Overall Security",
        description: "Security score is below recommended levels.",
        action: "Review all security policies and implement missing protections",
      })
    }

    // Critical events
    const criticalEvents = securityEvents.filter((e) => e.severity === "critical")
    if (criticalEvents.length > 0) {
      recommendations.push({
        priority: "critical" as const,
        title: "Address Critical Security Events",
        description: `${criticalEvents.length} critical security events detected.`,
        action: "Review and remediate all critical security changes",
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  const recommendations = getRecommendations()

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-indigo-600" />
          Security Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <span className="ml-2">Generating recommendations...</span>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === "critical"
                    ? "border-red-600 bg-red-50"
                    : rec.priority === "high"
                      ? "border-red-500 bg-red-50"
                      : rec.priority === "medium"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-blue-500 bg-blue-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          rec.priority === "critical"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : rec.priority === "high"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : rec.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : "bg-blue-100 text-blue-700 border-blue-200"
                        }`}
                      >
                        {rec.priority} priority
                      </Badge>
                    </div>
                    <h4 className="font-medium text-slate-800 mb-1">{rec.title}</h4>
                    <p className="text-sm text-slate-600 mb-2">{rec.description}</p>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <p className="text-xs text-slate-700">
                        <span className="font-medium">Recommended Action:</span> {rec.action}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
            <p>No recommendations needed - your security looks good!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
