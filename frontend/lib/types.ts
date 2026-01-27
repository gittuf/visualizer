export interface Commit {
  hash: string
  message: string
  author: string
  date: string
  data?: JsonObject
}

export interface MetadataRequest {
  url: string
  commit: string
  file: string
}

export interface CommitsRequest {
  url: string
}

export type JsonValue = string | number | boolean | null | JsonObject | JsonArray
export type JsonArray = JsonValue[]
export interface JsonObject {
  [key: string]: JsonValue
}

export interface SecurityEvent {
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

export interface SecurityTrend {
  metric: string
  trend: "improving" | "declining" | "stable"
  current: number
  previous: number
  description: string
}
