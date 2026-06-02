"use client"

import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import type { Commit, SecurityEvent, SecurityTrend, JsonValue } from "@/lib/types"

interface SecurityRecommendationsProps {
  commits: Commit[]
  securityEvents: SecurityEvent[]
  securityTrends: SecurityTrend[]
  isLoading: boolean
}

interface Recommendation {
  priority: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  action: string
}

export function SecurityRecommendations({
  commits,
  securityEvents,
  securityTrends,
  isLoading,
}: SecurityRecommendationsProps) {

  const getRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = []

    // Check expiration
    const latestCommit = commits[commits.length - 1]
    if (latestCommit?.data?.expires && typeof latestCommit.data.expires === 'string') {
      const expiryDate = new Date(latestCommit.data.expires)
      const now = new Date()
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry < 30) {
        recommendations.push({
          priority: "high",
          title: "Renew Security Metadata",
          description: `Security metadata expires in ${daysUntilExpiry} days. Plan renewal soon.`,
          action: "Update expiration date and refresh security keys",
        })
      }
    }

    // Check thresholds
    if (latestCommit?.data?.roles && typeof latestCommit.data.roles === 'object') {
      Object.entries(latestCommit.data.roles).forEach(([role, config]) => {
        if (config && typeof config === 'object' && !Array.isArray(config)) {
          const configObj = config as Record<string, JsonValue>
          if (configObj.threshold === 1) {
            recommendations.push({
              priority: "medium",
              title: "Increase Security Threshold",
              description: `Role "${role}" only requires 1 signature. Consider increasing for better security.`,
              action: "Increase threshold to 2 or more signatures",
            })
          }
        }
      })
    }

    // Check for declining trends
    securityTrends.forEach((trend) => {
      if (trend.trend === "declining") {
        recommendations.push({
          priority: "medium",
          title: `Address Declining ${trend.metric}`,
          description: `${trend.metric} has decreased from ${trend.previous} to ${trend.current}.`,
          action: "Review and restore security measures",
        })
      }
    })

    // Critical events
    const criticalEvents = securityEvents.filter((e) => e.severity === "critical")
    if (criticalEvents.length > 0) {
      recommendations.push({
        priority: "critical",
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
