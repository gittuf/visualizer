import { demoVisualizerData } from "@/lib/demo-visualizer-fixture"
import type {
  DemoCompareGraph,
  DemoMetadataOverview,
  DemoVisualizerData,
} from "@/lib/demo-visualizer.types"
import type { RepositoryInfo } from "@/lib/repository-handler"
import type { Commit, JsonObject } from "@/lib/types"

export interface PolicySnapshot {
  root: JsonObject
  targets: JsonObject
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function asString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : 0
}

function uniqueStrings(values: string[]) {
  return values.filter((value, index, allValues) => value && allValues.indexOf(value) === index)
}

function readPrincipalRef(value: unknown) {
  if (typeof value === "string") return value

  const objectValue = asObject(value)
  if (!objectValue) return ""

  return (
    asString(objectValue.id) ||
    asString(objectValue.name) ||
    asString(objectValue.principalID) ||
    asString(objectValue.principalId) ||
    asString(objectValue.keyid)
  )
}

function getRolePrincipalIds(role: Record<string, unknown>) {
  return asArray(
    role.principalIDs ??
    role.principalIds ??
    role.principalids ??
    role.principals ??
    role.authorizedPrincipals ??
    role.authorizedPrincipalIDs ??
    role.authorizedPrincipalIds,
  ).map(readPrincipalRef).filter(Boolean)
}

function formatVersionLabel(commit: Commit) {
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(commit.date))

  return `${commit.hash.slice(0, 7)} • ${dateLabel} • ${commit.message || "Policy update"}`
}

function buildPrincipalNames(snapshot: PolicySnapshot) {
  const targetsDelegations = asObject(snapshot.targets.delegations)
  const targetsPrincipals = asObject(targetsDelegations?.principals)
  const rootPrincipals = asObject(snapshot.root.principals)
  const names = new Map<string, string>()

  Object.entries(targetsPrincipals ?? {}).forEach(([principalId, value]) => {
    const principal = asObject(value)
    names.set(principalId, asString(principal?.personID) || principalId)
  })

  Object.keys(rootPrincipals ?? {}).forEach((principalId) => {
    if (!names.has(principalId)) {
      names.set(principalId, principalId)
    }
  })

  return names
}

function buildGraphForSnapshot(snapshot: PolicySnapshot, repositoryName: string): DemoCompareGraph {
  const principalNames = buildPrincipalNames(snapshot)
  const delegations = asObject(snapshot.targets.delegations)
  const roles = asArray(delegations?.roles)

  const lanes = roles
    .map((roleValue, index) => {
      const role = asObject(roleValue)
      if (!role) return null

      const paths = asArray(role.paths).map(asString).filter(Boolean)
      const roleName = asString(role.name) || `rule-${index}`
      const isDefaultAllowRule = roleName === "gittuf-allow-rule"
      const principalIds = getRolePrincipalIds(role)
      const principals = isDefaultAllowRule && principalIds.length === 0
        ? [{ name: "Anyone" }]
        : principalIds.map((principalId) => ({
            name: principalNames.get(principalId) || principalId,
          }))
      const nonBranchPath =
        paths.find((path) => !path.startsWith("git:refs/heads/")) || paths[0] || "*"

      return {
        key: roleName,
        pathLabel: nonBranchPath,
        roleLabel: roleName,
        approvals: isDefaultAllowRule
          ? "Default allow"
          : `Requires: ${asNumber(role.threshold)} approval${asNumber(role.threshold) === 1 ? "" : "s"}`,
        principals,
      }
    })
    .filter((lane): lane is NonNullable<typeof lane> => Boolean(lane))

  return {
    repositoryLabel: repositoryName,
    branchLabel: "Branch: main",
    lanes:
      lanes.length > 0
        ? lanes
        : [
            {
              key: "no-rules",
              pathLabel: "*",
              roleLabel: "No delegations",
              approvals: "Requires: 0 approvals",
              principals: [],
            },
          ],
  }
}

function buildMetadataOverview(snapshot: PolicySnapshot): DemoMetadataOverview {
  const delegations = asObject(snapshot.targets.delegations)
  const roles = asArray(delegations?.roles)
  const principals = buildPrincipalNames(snapshot)

  return {
    policyFiles: [
      { name: "root.json", status: "active", type: "root" },
      { name: "targets.json", status: "active", type: "targets" },
    ],
    views: [
      {
        id: "roles",
        label: "Roles",
        items: roles.map((role) => asString(asObject(role)?.name)).filter(Boolean),
      },
      {
        id: "principals",
        label: "Principals",
        items: [...principals.values()],
      },
      {
        id: "file-rules",
        label: "File rules",
        items: roles
          .flatMap((role) => asArray(asObject(role)?.paths).map(asString))
          .filter(Boolean),
      },
      {
        id: "status",
        label: "Status",
        items: ["Payload decoded", "Signed metadata"],
      },
    ],
  }
}

export async function buildVisualizerDataFromBackend(
  repository: RepositoryInfo,
  commits: Commit[],
  loadSnapshot: (commitHash: string) => Promise<PolicySnapshot>,
): Promise<DemoVisualizerData> {
  const metadataByCommitEntries: Array<[string, { "root.json": JsonObject; "targets.json": JsonObject }]> = []
  let firstSnapshotError: Error | null = null

  for (const commit of commits) {
    try {
      const snapshot = await loadSnapshot(commit.hash)
      metadataByCommitEntries.push([
        commit.hash,
        {
          "root.json": snapshot.root,
          "targets.json": snapshot.targets,
        },
      ])
    } catch (error) {
      if (!firstSnapshotError && error instanceof Error) {
        firstSnapshotError = error
      }

      // ponytail: skip policy commits missing full metadata; include them when the UI can represent partial snapshots honestly.
    }
  }

  if (metadataByCommitEntries.length === 0) {
    throw firstSnapshotError ?? new Error("No policy commits with both root.json and targets.json were found.")
  }

  const metadataByCommit = Object.fromEntries(metadataByCommitEntries)
  const loadableCommits = commits.filter((commit) => Boolean(metadataByCommit[commit.hash]))
  const latestCommit = loadableCommits[0]
  const latestSnapshot = metadataByCommit[latestCommit.hash]
  const latestVersionLabel = formatVersionLabel(latestCommit)
  const versionLabels = loadableCommits.map(formatVersionLabel)
  const graphsByVersion = Object.fromEntries(
    loadableCommits.map((commit) => [
      formatVersionLabel(commit),
      buildGraphForSnapshot(
        {
          root: metadataByCommit[commit.hash]["root.json"],
          targets: metadataByCommit[commit.hash]["targets.json"],
        },
        commit.hash.slice(0, 7),
      ),
    ]),
  )
  const latestGraph = graphsByVersion[latestVersionLabel]
  const branchOptions = latestGraph.lanes
    .flatMap((lane) =>
      lane.pathLabel.startsWith("git:refs/heads/")
        ? [lane.pathLabel.replace("git:refs/heads/", "")]
        : [],
    )
    .filter((value, index, values) => Boolean(value) && values.indexOf(value) === index)
  const changedPathOptions = latestGraph.lanes
    .map((lane) => lane.pathLabel)
    .filter((value, index, values) => Boolean(value) && values.indexOf(value) === index)
  const latestPrincipals = latestGraph.lanes.flatMap((lane) => lane.principals ?? [])
  const authorizedUsers = uniqueStrings(latestPrincipals.map((principal) => principal.name))

  return {
    repository,
    commits: loadableCommits,
    graphSource: {
      repository: repository.path,
      policyRef: "refs/gittuf/policy",
      policyVersion: latestVersionLabel,
      metadataFile: "targets.json",
      activeMode: "Approval Check",
      policyVersionOptions: versionLabels,
      metadataOptions: ["targets.json", "root.json"],
      activeModeOptions: ["Approval Check"],
      selectedPolicyVersionChips: [latestVersionLabel],
      selectedMetadataChips: ["targets.json"],
      selectedActiveModeChips: ["Approval Check"],
    },
    policyGraph: {
      title: `${repository.name} policy graph`,
      nodes: [],
      edges: [],
    },
    policyQuery: {
      branchOptions: branchOptions.length > 0 ? branchOptions : ["main"],
      selectedBranch: branchOptions[0] || "main",
      changedPathOptions: changedPathOptions.length > 0 ? changedPathOptions : ["*"],
      selectedChangedPath: changedPathOptions[0] || "*",
      queryResult: {
        matchedBranch: branchOptions[0] || "main",
        matchedRule: changedPathOptions[0] || "*",
        requiredApprovals: 0,
      },
      authorizedUsers,
    },
    workspaceDetails: {
      graphSource: {
        repository: repository.path,
        policyRef: "refs/gittuf/policy",
        policyVersion: latestVersionLabel,
        metadataFile: "targets.json",
        activeMode: "Approval Check",
        policyVersionOptions: versionLabels,
        metadataOptions: ["targets.json", "root.json"],
        activeModeOptions: ["Approval Check"],
        selectedPolicyVersionChips: [latestVersionLabel],
        selectedMetadataChips: ["targets.json"],
        selectedActiveModeChips: ["Approval Check"],
      },
      policyQuery: {
        branchOptions: branchOptions.length > 0 ? branchOptions : ["main"],
        selectedBranch: branchOptions[0] || "main",
        changedPathOptions: changedPathOptions.length > 0 ? changedPathOptions : ["*"],
        selectedChangedPath: changedPathOptions[0] || "*",
        queryResult: {
          matchedBranch: branchOptions[0] || "main",
          matchedRule: changedPathOptions[0] || "*",
          requiredApprovals: 0,
        },
        authorizedUsers,
      },
      history: {
        sortOptions: ["newest", "oldest", "author"],
        selectedSort: "newest",
        commits: loadableCommits.map((commit) => ({
          hash: commit.hash,
          message: commit.message,
          author: commit.author,
          authorLabel: commit.author,
          date: commit.date,
        })),
        selectedCommitHash: latestCommit.hash,
      },
      compare: {
        baseVersionOptions: versionLabels,
        compareVersionOptions: versionLabels,
        selectedBaseVersion: latestVersionLabel,
        selectedCompareVersion: versionLabels[1] ?? latestVersionLabel,
        changedMetadata: [],
        stats: [],
        graphsByVersion,
      },
      metadata: {
        policyFiles: ["root.json", "targets.json"],
        status: {
          payloadDecoded: true,
          signaturesFound: "Signatures found",
          sourceCommit: latestCommit.hash.slice(0, 7),
        },
        views: ["Summary", "Decoded JSON", "Envelope"],
        selectedView: "Summary",
        summary: [
          { value: "2", label: "policy files" },
          { value: String(latestGraph.lanes.length), label: "rules" },
          { value: String(buildPrincipalNames({ root: latestSnapshot["root.json"], targets: latestSnapshot["targets.json"] }).size), label: "principals" },
        ],
      },
      settings: demoVisualizerData.workspaceDetails.settings,
    },
    metadataOverview: buildMetadataOverview({
      root: latestSnapshot["root.json"],
      targets: latestSnapshot["targets.json"],
    }),
    metadataByCommit,
  }
}
