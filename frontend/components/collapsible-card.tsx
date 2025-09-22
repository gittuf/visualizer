"use client"

import type React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface CollapsibleCardProps {
  title: string
  children: React.ReactNode
  isOpen?: boolean
  onToggle?: () => void
  borderColor?: string
  isExpanded?: boolean
  badgeText?: string
  badgeColor?: string
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  children,
  isOpen = true,
  onToggle,
  borderColor = "border-blue-500",
  isExpanded,
  badgeText,
  badgeColor,
}) => {
  const colorMap: Record<string, string> = {
    "border-blue-500": "text-blue-600",
    "border-purple-500": "text-purple-600",
    "border-green-500": "text-green-600",
    "border-red-500": "text-red-600",
    "border-amber-500": "text-amber-600",
    "border-slate-300": "text-slate-600",
    "border-indigo-500": "text-indigo-600",
    "border-cyan-500": "text-cyan-600",
  }

  const titleColor = colorMap[borderColor] || "text-gray-700"

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`bg-white border-2 ${borderColor} rounded-lg p-3 w-full shadow-md`}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <div className={`font-semibold text-sm ${titleColor} truncate max-w-[160px]`}>{title}</div>
          {badgeText && (
            <Badge variant="outline" className={`ml-2 text-xs ${badgeColor || ""}`}>
              {badgeText}
            </Badge>
          )}
        </div>
        {onToggle && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            className="text-gray-500 hover:text-gray-700"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </motion.button>
        )}
      </div>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.2 }}
          className="text-gray-800 text-sm"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  )
}
