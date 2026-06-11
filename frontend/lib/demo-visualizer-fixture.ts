import { REPOSITORY } from "@/lib/constants"
import type { DemoVisualizerData } from "@/lib/demo-visualizer.types"

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
    policyVersionOptions: ["Latest - d4e5f6g7", "May 30 - c3d4e5f6", "May 28 - b2c3d4e5"],
    metadataOptions: ["targets.json", "root.json"],
    activeModeOptions: ["Approval Check", "Threshold Review", "Signature Audit"],
    selectedPolicyVersionChips: ["Latest - d4e5f6g7"],
    selectedMetadataChips: ["targets.json"],
    selectedActiveModeChips: ["Approval Check"],
    policyVersionChipsByOption: {
      "Latest - d4e5f6g7": ["Latest - d4e5f6g7"],
      "May 30 - c3d4e5f6": ["May 30 - c3d4e5f6"],
      "May 28 - b2c3d4e5": ["May 28 - b2c3d4e5"],
    },
    metadataChipsByOption: {
      "targets.json": ["targets.json"],
      "root.json": ["root.json"],
    },
    activeModeChipsByOption: {
      "Approval Check": ["Approval Check"],
      "Threshold Review": ["Threshold Review"],
      "Signature Audit": ["Signature Audit"],
    },
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
    branchOptions: ["main", "release", "hotfix"],
    selectedBranch: "main",
    changedPathOptions: ["src/auth/login.go", "src/**", "docs/**"],
    selectedChangedPath: "src/auth/login.go",
    queryResult: {
      matchedBranch: "main",
      matchedRule: "src/**",
      requiredApprovals: 2,
    },
    authorizedUsers: ["Alice", "Carol", "Bob"],
  },
  workspaceDetails: {
    graphSource: {
      repository: "gittuf/gittuf_repo",
      policyRef: "refs/gittuf/policy",
      policyVersion: "Latest - d4e5f6g7",
      metadataFile: "targets.json",
      activeMode: "Approval Check",
      policyVersionOptions: ["Latest - d4e5f6g7", "May 30 - c3d4e5f6", "May 28 - b2c3d4e5"],
      metadataOptions: ["targets.json", "root.json"],
      activeModeOptions: ["Approval Check", "Threshold Review", "Signature Audit"],
      selectedPolicyVersionChips: ["Latest - d4e5f6g7"],
      selectedMetadataChips: ["targets.json"],
      selectedActiveModeChips: ["Approval Check"],
      policyVersionChipsByOption: {
        "Latest - d4e5f6g7": ["Latest - d4e5f6g7"],
        "May 30 - c3d4e5f6": ["May 30 - c3d4e5f6"],
        "May 28 - b2c3d4e5": ["May 28 - b2c3d4e5"],
      },
      metadataChipsByOption: {
        "targets.json": ["targets.json"],
        "root.json": ["root.json"],
      },
      activeModeChipsByOption: {
        "Approval Check": ["Approval Check"],
        "Threshold Review": ["Threshold Review"],
        "Signature Audit": ["Signature Audit"],
      },
    },
    policyQuery: {
      branchOptions: ["main", "release", "hotfix"],
      selectedBranch: "main",
      changedPathOptions: ["src/auth/login.go", "src/**", "docs/**"],
      selectedChangedPath: "src/auth/login.go",
      queryResult: {
        matchedBranch: "main",
        matchedRule: "src/**",
        requiredApprovals: 2,
      },
      authorizedUsers: ["Alice", "Carol", "Bob"],
      queryScenarios: [
        {
          branch: "main",
          changedPath: "src/auth/login.go",
          matchedBranch: "main",
          matchedRule: "src/**",
          requiredApprovals: 2,
          authorizedUsers: ["Alice", "Carol", "Bob"],
        },
        {
          branch: "release",
          changedPath: "docs/**",
          matchedBranch: "release",
          matchedRule: "docs/**",
          requiredApprovals: 1,
          authorizedUsers: ["Alice", "Carol"],
        },
        {
          branch: "hotfix",
          changedPath: "src/**",
          matchedBranch: "main",
          matchedRule: "src/**",
          requiredApprovals: 2,
          authorizedUsers: ["Alice", "Bob"],
        },
      ],
    },
    history: {
      sortOptions: ["date", "oldest", "author"],
      selectedSort: "date",
      selectedCommitHash: "c3d4e5f6",
      commits: [
        {
          hash: "f6a7b8c9",
          message: "[Linux fedora] Installation / dependency error with Webui already installed.",
          author: "tonylee12345",
          authorLabel: "opened by tonylee12345",
          date: "2026-06-03T10:45:00.000Z",
        },
        {
          hash: "e5f6a7b8",
          message: "[Linux fedora] Installation / dependency error with Webui already installed.",
          author: "tonylee12345",
          authorLabel: "opened by tonylee12345",
          date: "2026-06-02T09:20:00.000Z",
        },
        {
          hash: "c3d4e5f6",
          message: "[Linux fedora] Installation / dependency error with Webui already installed.",
          author: "tonylee12345",
          authorLabel: "opened by tonylee12345",
          date: "2026-06-01T12:10:00.000Z",
        },
        {
          hash: "b2c3d4e5",
          message: "[Linux fedora] Installation / dependency error with Webui already installed.",
          author: "tonylee12345",
          authorLabel: "opened by tonylee12345",
          date: "2026-05-31T18:40:00.000Z",
        },
        {
          hash: "a1b2c3d4",
          message: "[Linux fedora] Installation / dependency error with Webui already installed.",
          author: "tonylee12345",
          authorLabel: "opened by tonylee12345",
          date: "2026-05-30T14:00:00.000Z",
        },
        {
          hash: "98ab76cd",
          message: "[Linux fedora] Installation / dependency error with Webui already installed.",
          author: "tonylee12345",
          authorLabel: "opened by tonylee12345",
          date: "2026-05-29T11:15:00.000Z",
        },
      ],
    },
    compare: {
      baseVersionOptions: [
        "a1b1cd • May 1 • Add policy",
        "91fe2a • Apr 28 • Update policy",
      ],
      compareVersionOptions: [
        "a2b3cd • May 5 • Update policy",
        "b4c5de • May 8 • Tighten thresholds",
      ],
      selectedBaseVersion: "a1b1cd • May 1 • Add policy",
      selectedCompareVersion: "a2b3cd • May 5 • Update policy",
      changedMetadata: ["Trust setup", "File rules", "Root metadata"],
      stats: [
        { value: "1", label: "role changed" },
        { value: "0", label: "rules added" },
        { value: "1 ↑", label: "threshold" },
        { value: "1", label: "principal removed" },
      ],
      graphsByVersion: {
        "a1b1cd • May 1 • Add policy": {
          repositoryLabel: "a1b1cd",
          branchLabel: "Branch: main",
          lanes: [
            {
              key: "src",
              pathLabel: "src/**",
              roleLabel: "Authorized users",
              approvals: "Requires: 2 approvals",
              principals: [{ name: "Alice" }, { name: "Carol" }, { name: "Bob" }],
            },
          ],
        },
        "91fe2a • Apr 28 • Update policy": {
          repositoryLabel: "91fe2a",
          branchLabel: "Branch: main",
          lanes: [
            {
              key: "src",
              pathLabel: "src/**",
              roleLabel: "Authorized users",
              approvals: "Requires: 1 approval",
              principals: [{ name: "Alice" }, { name: "Bob" }, { name: "Carol" }],
            },
          ],
        },
        "a2b3cd • May 5 • Update policy": {
          repositoryLabel: "a2b3cd",
          branchLabel: "Branch: main",
          lanes: [
            {
              key: "src",
              pathLabel: "src/**",
              roleLabel: "Authorized users",
              approvals: "Requires: 3 approvals",
              principals: [
                { name: "Alice" },
                { name: "Carol" },
                { name: "Bob" },
                { name: "Steve" },
              ],
            },
          ],
        },
        "b4c5de • May 8 • Tighten thresholds": {
          repositoryLabel: "b4c5de",
          branchLabel: "Branch: main",
          lanes: [
            {
              key: "src",
              pathLabel: "src/**",
              roleLabel: "Authorized users",
              approvals: "Requires: 3 approvals",
              principals: [
                { name: "Alice" },
                { name: "Carol" },
                { name: "Bob" },
                { name: "Steve" },
              ],
            },
          ],
        },
      },
      comparisonsByPair: {
        "a1b1cd • May 1 • Add policy|a2b3cd • May 5 • Update policy": {
          changedMetadata: ["Trust setup", "File rules", "Root metadata"],
          stats: [
            { value: "1", label: "role changed" },
            { value: "0", label: "rules added" },
            { value: "1 ↑", label: "threshold" },
            { value: "1", label: "principal removed" },
          ],
          compareGraph: {
            repositoryLabel: "a2b3cd",
            branchLabel: "Branch: main",
            showLegend: true,
            lanes: [
              {
                key: "src",
                pathLabel: "src/**",
                roleLabel: "Authorized users",
                approvals: "Requires: 3 approvals",
                approvalsStatus: "modified",
                principals: [
                  { name: "Alice", status: "unchanged" },
                  { name: "Carol", status: "unchanged" },
                  { name: "Bob", status: "removed" },
                  { name: "Steve", status: "added" },
                ],
              },
            ],
          },
        },
        "91fe2a • Apr 28 • Update policy|b4c5de • May 8 • Tighten thresholds": {
          changedMetadata: ["File rules", "Root metadata"],
          stats: [
            { value: "1", label: "roles changed" },
            { value: "2", label: "rules added" },
            { value: "2 ↑", label: "threshold" },
            { value: "0", label: "principal removed" },
          ],
          compareGraph: {
            repositoryLabel: "b4c5de",
            branchLabel: "Branch: main",
            showLegend: true,
            lanes: [
              {
                key: "src",
                pathLabel: "src/**",
                roleLabel: "Authorized users",
                approvals: "Requires: 3 approvals",
                approvalsStatus: "modified",
                principals: [
                  { name: "Alice", status: "unchanged" },
                  { name: "Bob", status: "unchanged" },
                  { name: "Carol", status: "unchanged" },
                ],
              },
              {
                key: "docs",
                pathLabel: "docs/**",
                roleLabel: "Docs reviewers",
                approvals: "Requires: 2 approvals",
                approvalsStatus: "modified",
                principals: [
                  { name: "Alice", status: "unchanged" },
                  { name: "Carol", status: "unchanged" },
                  { name: "Bob", status: "unchanged" },
                ],
              },
              {
                key: "ops",
                pathLabel: "ops/**",
                roleLabel: "Ops maintainers",
                approvals: "Requires: 2 approvals",
                status: "added",
                principals: [
                  { name: "Alice", status: "added" },
                  { name: "Carol", status: "added" },
                  { name: "Bob", status: "added" },
                ],
              },
            ],
          },
        },
      },
    },
    metadata: {
      policyFiles: ["Trust setup: root.json", "File rules: target.json"],
      status: {
        payloadDecoded: true,
        signaturesFound: "1 signature found",
        sourceCommit: "a1b2c3d",
      },
      views: ["Summary", "Decoded JSON", "Envelope"],
      selectedView: "Summary",
      summary: [
        { value: "3", label: "roles" },
        { value: "5", label: "principals" },
        { value: "4", label: "File rules" },
        { value: "1", label: "signatures" },
      ],
    },
    settings: {
      detailLevels: ["Simple", "Detailed"],
      selectedDetailLevel: "Simple",
      layoutDirections: ["Top → Bottom", "Left →right"],
      selectedLayoutDirection: "Top → Bottom",
      visibleNodeTypes: [
        { label: "File rules", checked: true },
        { label: "Roles", checked: true },
        { label: "Principals", checked: true },
        { label: "Thresholds", checked: true },
        { label: "Signatures", checked: false },
        { label: "Expiration", checked: false },
      ],
      labels: [
        { label: "show edge labels", enabled: true },
        { label: "show approval counts", enabled: true },
        { label: "show legend", enabled: false },
      ],
      dataOptions: [
        { label: "Use latest policy by default", enabled: true },
        { label: "Show raw metadata warnings", enabled: false },
      ],
    },
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
