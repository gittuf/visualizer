"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronRight, Calendar, Key, Users, Shield, Clock, FileText, Hash, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { shouldShowInNormalMode, type ViewMode } from "@/lib/view-mode-utils"

interface JsonTreeViewProps {
  jsonData: any
  viewMode?: ViewMode
}

interface TreeNodeProps {
  data: any
  keyName?: string
  level?: number
  isLast?: boolean
  parentPath?: string
  viewMode?: ViewMode
}

const getValueColor = (value: any): string => {
  if (typeof value === "string") return "text-green-600"
  if (typeof value === "number") return "text-orange-600"
  if (typeof value === "boolean") return "text-blue-600"
  if (value === null) return "text-gray-500"
  return "text-gray-800"
}

const getValueIcon = (key: string, value: any) => {
  const keyLower = key.toLowerCase()

  if (keyLower.includes("expire")) return <Calendar className="h-3 w-3 text-blue-500" />
  if (keyLower.includes("key") || keyLower === "principals") return <Key className="h-3 w-3 text-yellow-600" />
  if (keyLower.includes("role")) return <Users className="h-3 w-3 text-purple-600" />
  if (keyLower.includes("security") || keyLower.includes("trusted"))
    return <Shield className="h-3 w-3 text-green-600" />
  if (keyLower.includes("version")) return <Hash className="h-3 w-3 text-indigo-600" />
  if (keyLower.includes("url") || keyLower.includes("issuer")) return <Globe className="h-3 w-3 text-cyan-600" />
  if (keyLower.includes("time") || keyLower.includes("date")) return <Clock className="h-3 w-3 text-blue-500" />

  return <FileText className="h-3 w-3 text-gray-400" />
}

const getSecurityBadge = (key: string, value: any) => {
  // Removed all security badges to clean up the UI
  return null
}

const formatValue = (value: any): string => {
  if (value === null) return "null"
  if (value === undefined) return "undefined"
  if (typeof value === "string") return `"${value}"`
  return String(value)
}

const getTooltipContent = (key: string, value: any, path: string) => {
  const keyLower = key.toLowerCase()

  // Root-level metadata fields
  if (keyLower === "type") {
    return (
      <div className="space-y-2 max-w-sm">
        <div>
          <strong>Metadata Type</strong>
        </div>
        <div>Value: {value}</div>
        <div className="text-sm text-gray-600">
          Specifies the type of gittuf metadata. "root" contains trust anchors and role definitions, while "targets"
          contains security policies and rules.
        </div>
        <div className="text-xs text-gray-500">Path: {path}</div>
      </div>
    )
  }

  if (keyLower === "schemaversion") {
    return (
      <div className="space-y-2 max-w-sm">
        <div>
          <strong>Schema Version</strong>
        </div>
        <div>Version: {value}</div>
        <div className="text-sm text-gray-600">Defines the structure and validation rules for this metadata.</div>
        <div className="text-xs text-gray-500">Path: {path}</div>
      </div>
    )
  }

  if (keyLower.includes("expire")) {
    const expiryDate = new Date(value)
    const now = new Date()
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isExpired = expiryDate < now

    return (
      <div className="space-y-2 max-w-sm">
        <div>
          <strong>Expiration Date</strong>
        </div>
        <div>Date: {expiryDate.toLocaleDateString()}</div>
        <div>Time: {expiryDate.toLocaleTimeString()}</div>
        <div className={isExpired ? "text-red-600 font-medium" : "text-green-600"}>
          Status: {isExpired ? "EXPIRED" : `${daysUntilExpiry} days remaining`}
        </div>
        <div className="text-sm text-gray-600">Security metadata must be refreshed before this date.</div>
        <div className="text-xs text-gray-500">Path: {path}</div>
      </div>
    )
  }

  // Principal-related fields
  if (keyLower === "principals") {
    const count = typeof value === "object" ? Object.keys(value).length : 0
    return (
      <div className="space-y-2 max-w-sm">
        <div>
          <strong>Security Principals</strong>
        </div>
        <div>Count: {count} principals</div>
        <div className="text-sm text-gray-600">
          Contains keys and identities that can sign and validate repository operations.
        </div>
        <div className="text-xs text-gray-500">Path: {path}</div>
      </div>
    )
  }

  if (keyLower === "keytype") {
    return (
      <div className="space-y-2 max-w-sm">
        <div>
          <strong>Key Type</strong>
        </div>
        <div>Type: {value}</div>
        <div className="text-sm text-gray-600">Specifies the key algorithm used for signing.</div>
        <div className="text-xs text-gray-500">Path: {path}</div>
      </div>
    )
  }

  if (keyLower === "threshold") {
    return (
      <div className="space-y-2 max-w-sm">
        <div>
          <strong>Signature Threshold</strong>
        </div>
        <div>Required signatures: {value}</div>
        <div className="text-sm text-gray-600">
          Minimum number of valid signatures required from the authorized principals.
        </div>
        <div className="text-xs text-gray-500">Path: {path}</div>
      </div>
    )
  }

  // Generic fallback with simplified context
  const getGenericDescription = (key: string, value: any) => {
    if (typeof value === "object" && value !== null) {
      const isArray = Array.isArray(value)
      const count = isArray ? value.length : Object.keys(value).length
      return `${isArray ? "Array" : "Object"} containing ${count} ${isArray ? "items" : "properties"}.`
    }

    if (typeof value === "string" && value.startsWith("https://")) {
      return "URL reference to an external resource."
    }

    if (typeof value === "number") {
      return "Numeric value."
    }

    if (typeof value === "boolean") {
      return "Boolean flag controlling a security feature."
    }

    return "Security metadata field used by gittuf."
  }

  return (
    <div className="space-y-2 max-w-sm">
      <div>
        <strong>{key}</strong>
      </div>
      <div>Value: {formatValue(value)}</div>
      <div>Type: {typeof value}</div>
      <div className="text-sm text-gray-600">{getGenericDescription(key, value)}</div>
      <div className="text-xs text-gray-500">Path: {path}</div>
    </div>
  )
}

const TreeNode: React.FC<TreeNodeProps> = ({
  data,
  keyName,
  level = 0,
  isLast = true,
  parentPath = "",
  viewMode = "advanced",
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels

  const currentPath = parentPath ? `${parentPath}.${keyName}` : keyName || "root"
  const isObject = typeof data === "object" && data !== null && !Array.isArray(data)
  const isArray = Array.isArray(data)
  const isPrimitive = !isObject && !isArray

  // Check if this node should be shown in normal mode
  const shouldShow = viewMode === "advanced" || !keyName || shouldShowInNormalMode(keyName, data, level)

  if (!shouldShow) {
    return null
  }

  const toggleExpanded = () => {
    if (!isPrimitive) {
      setIsExpanded(!isExpanded)
    }
  }

  const renderConnector = () => {
    if (level === 0) return null

    return (
      <div className="flex items-center mr-2">
        {Array.from({ length: level }).map((_, i) => (
          <div key={i} className="w-4 flex justify-center">
            {i === level - 1 ? <div className="w-px h-6 bg-gray-300" /> : <div className="w-px h-6 bg-gray-300" />}
          </div>
        ))}
      </div>
    )
  }

  const renderValue = () => {
    if (isPrimitive) {
      const securityBadge = keyName ? getSecurityBadge(keyName, data) : null
      const icon = keyName ? getValueIcon(keyName, data) : null

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 py-1 hover:bg-gray-50 rounded px-2 -mx-2">
                {icon}
                <span className="text-gray-700 font-medium">{keyName}:</span>
                <span className={`font-mono text-sm ${getValueColor(data)}`}>{formatValue(data)}</span>
                {securityBadge}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              {keyName && getTooltipContent(keyName, data, currentPath)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    const objectKeys = isObject ? Object.keys(data) : []
    const arrayLength = isArray ? data.length : 0
    const count = isObject ? objectKeys.length : arrayLength
    const securityBadge = keyName ? getSecurityBadge(keyName, data) : null
    const icon = keyName ? getValueIcon(keyName, data) : <FileText className="h-3 w-3 text-gray-400" />

    // In normal mode, count only visible children
    let visibleCount = count
    if (viewMode === "normal" && isObject) {
      visibleCount = objectKeys.filter((key) => shouldShowInNormalMode(key, data[key], level + 1)).length
    }

    return (
      <div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex items-center gap-2 py-1 hover:bg-gray-50 rounded px-2 -mx-2 cursor-pointer"
                onClick={toggleExpanded}
              >
                <div className="flex items-center">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                {icon}
                <span className="text-gray-700 font-medium">
                  {keyName || "root"} {isObject ? "{" : "["}
                </span>
                <Badge variant="outline" className="text-xs bg-gray-50">
                  {viewMode === "normal" ? visibleCount : count} {isObject ? "keys" : "items"}
                  {viewMode === "normal" && visibleCount !== count && (
                    <span className="text-gray-400 ml-1">({count} total)</span>
                  )}
                </Badge>
                {securityBadge}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <div className="space-y-2">
                <div>
                  <strong>{keyName || "Root Object"}</strong>
                </div>
                <div>Type: {isArray ? "Array" : "Object"}</div>
                <div>
                  Size: {count} {isObject ? "properties" : "items"}
                  {viewMode === "normal" && visibleCount !== count && (
                    <div className="text-xs text-gray-500">Showing {visibleCount} important items in normal mode</div>
                  )}
                </div>
                <div className="text-xs text-gray-500">Path: {currentPath}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isExpanded && (
          <div className="ml-4 border-l border-gray-200 pl-4 mt-2">
            {isObject &&
              objectKeys.map((key, index) => (
                <TreeNode
                  key={key}
                  data={data[key]}
                  keyName={key}
                  level={level + 1}
                  isLast={index === objectKeys.length - 1}
                  parentPath={currentPath}
                  viewMode={viewMode}
                />
              ))}
            {isArray &&
              data.map((item: any, index: number) => (
                <TreeNode
                  key={index}
                  data={item}
                  keyName={`[${index}]`}
                  level={level + 1}
                  isLast={index === data.length - 1}
                  parentPath={currentPath}
                  viewMode={viewMode}
                />
              ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="select-none">
      <div className="flex items-start">
        {renderConnector()}
        {renderValue()}
      </div>
    </div>
  )
}

export default function JsonTreeView({ jsonData, viewMode = "normal" }: JsonTreeViewProps) {
  if (!jsonData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No JSON data to display</p>
      </div>
    )
  }

  return (
    <div className="font-mono text-sm max-h-[600px] overflow-auto">
      <div className="p-4">
        <TreeNode data={jsonData} viewMode={viewMode} />
      </div>
    </div>
  )
}
