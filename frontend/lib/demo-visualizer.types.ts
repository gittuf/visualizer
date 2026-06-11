import type { Commit, JsonObject } from "@/lib/types"
import type { RepositoryInfo } from "@/lib/repository-handler"

export interface DemoPolicyGraphNode {
  id: string
  label: string
  type: "repository" | "branch" | "policy-file" | "role" | "principal" | "rule"
  x: number
  y: number
  metadata?: Record<string, string | number | boolean>
}

export interface DemoPolicyGraphEdge {
  id: string
  from: string
  to: string
  label?: string
}

export interface DemoGraphSourceData {
  repository: string
  policyRef: string
  policyVersion: string
  metadataFile: string
  activeMode: string
  policyVersionOptions: string[]
  metadataOptions: string[]
  activeModeOptions: string[]
  selectedPolicyVersionChips: string[]
  selectedMetadataChips: string[]
  selectedActiveModeChips: string[]
  policyVersionChipsByOption?: Record<string, string[]>
  metadataChipsByOption?: Record<string, string[]>
  activeModeChipsByOption?: Record<string, string[]>
}

export interface DemoPolicyRequirement {
  role: string
  threshold: number
  principals: string[]
  paths: string[]
  status: "satisfied" | "pending"
}

export interface DemoPolicyQueryData {
  branchOptions: string[]
  selectedBranch: string
  changedPathOptions: string[]
  selectedChangedPath: string
  queryResult: {
    matchedBranch: string
    matchedRule: string
    requiredApprovals: number
  }
  authorizedUsers: string[]
  queryScenarios?: Array<{
    branch: string
    changedPath: string
    matchedBranch: string
    matchedRule: string
    requiredApprovals: number
    authorizedUsers: string[]
  }>
}

export interface DemoMetadataOverview {
  policyFiles: Array<{
    name: string
    status: "active" | "expired" | "draft"
    type: "root" | "targets" | "delegation"
  }>
  views: Array<{
    id: "roles" | "principals" | "file-rules" | "status"
    label: string
    items: string[]
  }>
}

export interface DemoCommitHistoryData {
  sortOptions: string[]
  selectedSort: string
  commits: Array<{
    hash: string
    message: string
    author: string
    authorLabel: string
    date: string
  }>
  selectedCommitHash: string
}

export type DemoCompareDiffStatus = "added" | "removed" | "modified" | "unchanged"

export interface DemoCompareGraphPrincipal {
  name: string
  status?: DemoCompareDiffStatus
}

export interface DemoCompareGraphLane {
  key: string
  pathLabel: string
  roleLabel: string
  approvals: string
  status?: DemoCompareDiffStatus
  pathStatus?: DemoCompareDiffStatus
  roleStatus?: DemoCompareDiffStatus
  approvalsStatus?: DemoCompareDiffStatus
  principals?: DemoCompareGraphPrincipal[]
}

export interface DemoCompareGraph {
  repositoryLabel?: string
  branchLabel?: string
  lanes: DemoCompareGraphLane[]
  showLegend?: boolean
}

export interface DemoCompareData {
  baseVersionOptions: string[]
  compareVersionOptions: string[]
  selectedBaseVersion: string
  selectedCompareVersion: string
  changedMetadata: string[]
  stats: Array<{
    value: string
    label: string
  }>
  graphsByVersion: Record<string, DemoCompareGraph>
  comparisonsByPair?: Record<
    string,
    {
      changedMetadata: string[]
      stats: Array<{
        value: string
        label: string
      }>
      compareGraph: DemoCompareGraph
    }
  >
}

export interface DemoMetadataPanelData {
  policyFiles: string[]
  status: {
    payloadDecoded: boolean
    signaturesFound: string
    sourceCommit: string
  }
  views: string[]
  selectedView: string
  summary: Array<{
    value: string
    label: string
  }>
}

export interface DemoSettingsData {
  detailLevels: string[]
  selectedDetailLevel: string
  layoutDirections: string[]
  selectedLayoutDirection: string
  visibleNodeTypes: Array<{
    label: string
    checked: boolean
  }>
  labels: Array<{
    label: string
    enabled: boolean
  }>
  dataOptions: Array<{
    label: string
    enabled: boolean
  }>
}

export interface DemoWorkspaceDetails {
  graphSource: DemoGraphSourceData
  policyQuery: DemoPolicyQueryData
  history: DemoCommitHistoryData
  compare: DemoCompareData
  metadata: DemoMetadataPanelData
  settings: DemoSettingsData
}

export interface DemoVisualizerData {
  repository: RepositoryInfo
  commits: Commit[]
  graphSource: DemoGraphSourceData
  policyGraph: {
    title: string
    nodes: DemoPolicyGraphNode[]
    edges: DemoPolicyGraphEdge[]
  }
  policyQuery: DemoPolicyQueryData
  workspaceDetails: DemoWorkspaceDetails
  metadataOverview: DemoMetadataOverview
  metadataByCommit: Record<
    string,
    {
      "root.json": JsonObject
      "targets.json": JsonObject
    }
  >
}
