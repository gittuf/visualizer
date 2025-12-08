"use client"

import { motion } from "framer-motion"
import { CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface StatusCardProps {
  result: "allowed" | "blocked"
  reasons: string[]
  className?: string
}

export function StatusCard({ result, reasons, className = "" }: StatusCardProps) {
  const [explainLikeIm5, setExplainLikeIm5] = useState(false)

  const getSimpleExplanation = () => {
    if (result === "allowed") {
      return "✅ Good to go! Everyone who needed to approve this change has signed off."
    } else {
      return "⛔ Hold on! This change needs more approvals before it can go through."
    }
  }

  const getDetailedExplanation = () => {
    return reasons.join(" ")
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card
        className={`border-2 ${
          result === "allowed"
            ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
            : "border-red-200 bg-gradient-to-br from-red-50 to-rose-50"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {result === "allowed" ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
            </motion.div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`text-2xl font-bold capitalize ${
                    result === "allowed" ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {result}
                </motion.h2>
                <Badge variant={result === "allowed" ? "default" : "destructive"} className="text-sm">
                  {result === "allowed" ? "Safe to proceed" : "Needs attention"}
                </Badge>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExplainLikeIm5(!explainLikeIm5)}
                    className="text-xs h-6 px-2"
                  >
                    {explainLikeIm5 ? "Show Details" : "Explain like I'm 5"}
                  </Button>
                </div>

                <motion.p
                  key={explainLikeIm5 ? "simple" : "detailed"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`${
                    result === "allowed" ? "text-green-700" : "text-red-700"
                  } leading-relaxed ${explainLikeIm5 ? "text-base" : "text-sm"}`}
                >
                  {explainLikeIm5 ? getSimpleExplanation() : getDetailedExplanation()}
                </motion.p>
              </motion.div>

              {/* Pulse animation for blocked status */}
              {result === "blocked" && (
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(239, 68, 68, 0.4)",
                      "0 0 0 10px rgba(239, 68, 68, 0)",
                      "0 0 0 0 rgba(239, 68, 68, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 1,
                  }}
                  className="absolute inset-0 rounded-lg pointer-events-none"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
