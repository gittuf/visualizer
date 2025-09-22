// Utility functions for determining what to show in Normal vs Advanced mode

export type ViewMode = "normal" | "advanced"

export interface NodeImportance {
  level: "critical" | "important" | "normal" | "hidden"
  reason?: string
}

// Define which fields are important for normal mode
export const getNodeImportance = (key: string, value: any, level: number, parentKey?: string): NodeImportance => {
  const keyLower = key.toLowerCase()

  // Always show root level containers
  if (level === 0) return { level: "critical", reason: "Root level" }

  // CRITICAL - Always show these security essentials
  if (keyLower.includes("expire")) return { level: "critical", reason: "Security expiration" }
  if (keyLower === "trusted") return { level: "critical", reason: "Trust status" }
  if (keyLower === "threshold") return { level: "critical", reason: "Security threshold" }

  // IMPORTANT - Key security containers and policies
  if (keyLower === "principals") return { level: "important", reason: "Security principals" }
  if (keyLower === "roles") return { level: "important", reason: "Access control roles" }
  if (keyLower === "rules") return { level: "important", reason: "Security policies" }
  if (keyLower === "githubapps") return { level: "important", reason: "GitHub integrations" }
  if (keyLower === "requirements") return { level: "important", reason: "Policy requirements" }
  if (keyLower === "authorizedprincipals") return { level: "important", reason: "Authorized users" }
  if (keyLower === "principalids") return { level: "important", reason: "Principal references" }

  // IMPORTANT - Policy definition fields
  if (keyLower === "pattern") return { level: "important", reason: "Rule pattern" }
  if (keyLower === "action") return { level: "important", reason: "Rule action" }

  // IMPORTANT - Identity fields
  if (keyLower === "identity") return { level: "important", reason: "User identity" }
  if (keyLower === "issuer") return { level: "important", reason: "Identity provider" }
  if (keyLower === "keytype") return { level: "important", reason: "Key algorithm" }

  // HIDDEN - Technical implementation details that clutter the view
  if (keyLower === "type") return { level: "hidden", reason: "Technical metadata type" }
  if (keyLower === "schemaversion") return { level: "hidden", reason: "Technical schema version" }
  if (keyLower === "keyid_hash_algorithms") return { level: "hidden", reason: "Technical key details" }
  if (keyLower === "keyid") return { level: "hidden", reason: "Technical key identifier" }
  if (keyLower === "scheme") return { level: "hidden", reason: "Technical signature scheme" }
  if (keyLower === "public") return { level: "hidden", reason: "Raw key material" }
  if (keyLower === "keyval") return { level: "hidden", reason: "Raw key data" }

  // NORMAL - Everything else
  return { level: "normal", reason: "Standard field" }
}

export const shouldShowInNormalMode = (key: string, value: any, level: number, parentKey?: string): boolean => {
  const importance = getNodeImportance(key, value, level, parentKey)
  return importance.level === "critical" || importance.level === "important"
}

export const getHiddenFieldsCount = (data: any, level = 0, parentKey?: string): number => {
  if (!data || typeof data !== "object") return 0

  let hiddenCount = 0
  const keys = Array.isArray(data) ? data.map((_, i) => i.toString()) : Object.keys(data)

  for (const key of keys) {
    const importance = getNodeImportance(key, data[key], level, parentKey)
    if (importance.level === "hidden" || importance.level === "normal") {
      hiddenCount++
    }

    // Recursively count hidden fields in nested objects
    if (typeof data[key] === "object" && data[key] !== null) {
      hiddenCount += getHiddenFieldsCount(data[key], level + 1, key)
    }
  }

  return hiddenCount
}
