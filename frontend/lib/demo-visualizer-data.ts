import { REPOSITORY } from "@/lib/constants"
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
}

export interface DemoPolicyRequirement {
  role: string
  threshold: number
  principals: string[]
  paths: string[]
  status: "satisfied" | "pending"
}

export interface DemoPolicyQueryData {
  selectedCommit: string
  selectedFile: string
  requiredApprovals: DemoPolicyRequirement[]
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
  metadataOverview: DemoMetadataOverview
  metadataByCommit: Record<
    string,
    {
      "root.json": JsonObject
      "targets.json": JsonObject
    }
  >
}

export const demoVisualizerData: DemoVisualizerData = {
  repository: {
    type: "remote",
    path: REPOSITORY.GITTUF_URL,
    name: "gittuf_repo",
    branch: "main",
  },
  commits: [
    {
      hash: "a1b2c3d4",
      message: "Bootstrap policy graph and root roles",
      author: "Alice Johnson",
      date: "2026-05-26T14:22:00.000Z",
    },
    {
      hash: "b2c3d4e5",
      message: "Require two maintainers for src and docs",
      author: "Bob Smith",
      date: "2026-05-28T09:10:00.000Z",
    },
    {
      hash: "c3d4e5f6",
      message: "Add Carol as an authorized principal",
      author: "Carol Davis",
      date: "2026-05-30T17:45:00.000Z",
    },
    {
      hash: "d4e5f6g7",
      message: "Refresh targets metadata and approval rules",
      author: "Alice Johnson",
      date: "2026-06-01T08:30:00.000Z",
    },
  ],
  graphSource: {
    repository: "gittuf/gittuf_repo",
    policyRef: "refs/gittuf/policy",
    policyVersion: "Latest - d4e5f6g7",
    metadataFile: "targets.json",
    activeMode: "Approval Check",
  },
  policyGraph: {
    title: "Policy Graph",
    nodes: [
      { id: "repo", label: "gittuf_repo", type: "repository", x: 120, y: 80 },
      { id: "branch-main", label: "Branch: main", type: "branch", x: 280, y: 80 },
      { id: "targets-src", label: "src/**", type: "policy-file", x: 240, y: 170 },
      { id: "targets-docs", label: "docs/**", type: "policy-file", x: 420, y: 170 },
      { id: "role-maintainers", label: "Authorized users", type: "role", x: 240, y: 280, metadata: { threshold: 2 } },
      { id: "role-reviewers", label: "Docs reviewers", type: "role", x: 420, y: 280, metadata: { threshold: 1 } },
      { id: "alice", label: "Alice", type: "principal", x: 180, y: 400 },
      { id: "carol", label: "Carol", type: "principal", x: 260, y: 400 },
      { id: "bob", label: "Bob", type: "principal", x: 340, y: 400 },
    ],
    edges: [
      { id: "repo-main", from: "repo", to: "branch-main" },
      { id: "main-src", from: "branch-main", to: "targets-src" },
      { id: "main-docs", from: "branch-main", to: "targets-docs" },
      { id: "src-role", from: "targets-src", to: "role-maintainers", label: "requires 2 approvals" },
      { id: "docs-role", from: "targets-docs", to: "role-reviewers", label: "requires 1 approval" },
      { id: "alice-maintainers", from: "alice", to: "role-maintainers" },
      { id: "carol-maintainers", from: "carol", to: "role-maintainers" },
      { id: "bob-maintainers", from: "bob", to: "role-maintainers" },
      { id: "alice-reviewers", from: "alice", to: "role-reviewers" },
      { id: "carol-reviewers", from: "carol", to: "role-reviewers" },
    ],
  },
  policyQuery: {
    selectedCommit: "d4e5f6g7",
    selectedFile: "targets.json",
    requiredApprovals: [
      {
        role: "maintainers",
        threshold: 2,
        principals: ["Alice", "Bob", "Carol"],
        paths: ["src/**", "docs/**"],
        status: "satisfied",
      },
      {
        role: "docs-reviewers",
        threshold: 1,
        principals: ["Alice", "Carol"],
        paths: ["docs/**"],
        status: "pending",
      },
    ],
  },
  metadataOverview: {
    policyFiles: [
      { name: "root.json", status: "active", type: "root" },
      { name: "targets.json", status: "active", type: "targets" },
      { name: "delegations/docs.json", status: "draft", type: "delegation" },
    ],
    views: [
      { id: "status", label: "Status", items: ["root.json active", "targets.json active", "docs delegation draft"] },
      { id: "roles", label: "Roles", items: ["root", "targets", "maintainers", "docs-reviewers"] },
      { id: "principals", label: "Principals", items: ["Alice", "Bob", "Carol"] },
      { id: "file-rules", label: "File Rules", items: ["src/** requires maintainers", "docs/** requires maintainers"] },
    ],
  },
  metadataByCommit: {
    a1b2c3d4: {
      "root.json": {
        type: "root",
        expires: "2026-08-01T00:00:00Z",
        principals: {
          alice: { keyid: "alice-root-key", keytype: "ed25519" },
          bob: { keyid: "bob-root-key", keytype: "ed25519" },
        },
        roles: [
          { name: "root", threshold: 2, principalids: ["alice", "bob"] },
          { name: "targets", threshold: 1, principalids: ["alice"] },
        ],
      },
      "targets.json": {
        type: "targets",
        expires: "2026-07-15T00:00:00Z",
        targets: {
          "src/**": { rule: "maintainers" },
        },
      },
    },
    b2c3d4e5: {
      "root.json": {
        type: "root",
        expires: "2026-08-01T00:00:00Z",
        principals: {
          alice: { keyid: "alice-root-key", keytype: "ed25519" },
          bob: { keyid: "bob-root-key", keytype: "ed25519" },
          carol: { keyid: "carol-root-key", keytype: "ed25519" },
        },
        roles: [
          { name: "root", threshold: 2, principalids: ["alice", "bob"] },
          { name: "targets", threshold: 2, principalids: ["alice", "bob"] },
        ],
      },
      "targets.json": {
        type: "targets",
        expires: "2026-07-18T00:00:00Z",
        targets: {
          "src/**": { rule: "maintainers" },
          "docs/**": { rule: "maintainers" },
        },
      },
    },
    c3d4e5f6: {
      "root.json": {
        type: "root",
        expires: "2026-08-01T00:00:00Z",
        principals: {
          alice: { keyid: "alice-root-key", keytype: "ed25519" },
          bob: { keyid: "bob-root-key", keytype: "ed25519" },
          carol: { keyid: "carol-root-key", keytype: "ed25519" },
        },
        roles: [
          { name: "root", threshold: 2, principalids: ["alice", "bob"] },
          { name: "targets", threshold: 2, principalids: ["alice", "bob", "carol"] },
        ],
      },
      "targets.json": {
        type: "targets",
        expires: "2026-07-20T00:00:00Z",
        targets: {
          "src/**": { rule: "maintainers" },
          "docs/**": { rule: "maintainers" },
        },
      },
    },
    d4e5f6g7: {
      "root.json": {
        type: "root",
        expires: "2026-08-15T00:00:00Z",
        principals: {
          alice: { keyid: "alice-root-key", keytype: "ed25519" },
          bob: { keyid: "bob-root-key", keytype: "ed25519" },
          carol: { keyid: "carol-root-key", keytype: "ed25519" },
        },
        roles: [
          { name: "root", threshold: 2, principalids: ["alice", "bob"] },
          { name: "targets", threshold: 2, principalids: ["alice", "bob", "carol"] },
          { name: "docs-reviewers", threshold: 1, principalids: ["alice", "carol"] },
        ],
      },
      "targets.json": {
        type: "targets",
        expires: "2026-07-30T00:00:00Z",
        targets: {
          "src/**": { rule: "maintainers" },
          "docs/**": { rule: "maintainers" },
          "metadata/**": { rule: "docs-reviewers" },
        },
      },
    },
  },
}
