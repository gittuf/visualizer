/**
 * Format JSON value for display in tooltips
 */
export function formatJsonValue(value: any): string {
  if (value === undefined) return "undefined"
  if (value === null) return "null"

  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2)
    } catch (error) {
      return "[Complex Object]"
    }
  }

  return String(value)
}

/**
 * Get a human-readable description of a node type
 */
export function getNodeTypeDescription(type: string): string {
  switch (type) {
    case "rootNode":
      return "Root Object"
    case "jsonNode":
      return "Object"
    case "arrayNode":
      return "Array"
    case "valueNode":
      return "Value"
    case "diffRoot":
      return "Root Object"
    case "diffAdded":
      return "Added"
    case "diffRemoved":
      return "Removed"
    case "diffChanged":
      return "Changed"
    case "diffUnchanged":
      return "Unchanged"
    default:
      return type
  }
}

/**
 * Get a description of the security implications of a node
 */
export function getSecurityImplication(path: string, value: any): string | null {
  // Check for security-related paths
  if (path.includes("principals") || path.includes("keyval")) {
    return "Contains security principal information"
  }

  if (path.includes("threshold")) {
    return `Requires ${value} signature(s) for validation`
  }

  if (path.includes("expires")) {
    const expiryDate = new Date(value)
    const now = new Date()
    if (expiryDate < now) {
      return "EXPIRED! This metadata has passed its expiration date"
    }

    // Calculate days until expiry
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntilExpiry < 30) {
      return `Expiring soon! Only ${daysUntilExpiry} days remaining`
    }

    return `Valid for ${daysUntilExpiry} more days`
  }

  if (path.includes("trusted") && value === true) {
    return "Trusted security component"
  }

  if (path.includes("rules") || path.includes("pattern") || path.includes("action")) {
    return "Security policy rule component"
  }

  return null
}

/**
 * Determine if a node contains sensitive security information
 */
export function isSensitiveNode(path: string): boolean {
  const sensitivePatterns = ["private", "secret", "password", "token", "key", "keyval.private", "auth"]

  return sensitivePatterns.some((pattern) => path.toLowerCase().includes(pattern))
}
