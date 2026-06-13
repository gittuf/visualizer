"use client"

import { Target, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import type { Commit, SecurityEvent } from "@/lib/types"

interface SecurityInsightsProps {
  commits: Commit[]
  securityEvents: SecurityEvent[]
  isLoading: boolean
}

export function SecurityInsights({
  commits,
  securityEvents,
  isLoading,
}: SecurityInsightsProps) {
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
                  insight.type === "warning"
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
