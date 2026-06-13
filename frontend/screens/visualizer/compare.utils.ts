"use client";

import type {
  DemoCompareGraph,
  DemoCompareGraphLane,
  DemoCompareGraphPrincipal,
} from "@/lib/demo-visualizer.types";

export interface VisualizerComparisonResult {
  changedMetadata: string[];
  stats: Array<{
    value: string;
    label: string;
  }>;
  compareGraph: DemoCompareGraph;
}

interface LaneComparisonResult {
  lane: DemoCompareGraphLane;
  stats: {
    rolesChanged: number;
    rulesAdded: number;
    thresholdDelta: number;
    principalChanges: number;
  };
  metadataFlags: {
    trustSetup: boolean;
    fileRules: boolean;
    rootMetadata: boolean;
  };
}

function parseApprovalCount(approvals: string) {
  const match = approvals.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function comparePrincipals(
  basePrincipals: DemoCompareGraphPrincipal[],
  comparePrincipals: DemoCompareGraphPrincipal[],
) {
  const baseByName = new Map(basePrincipals.map((principal) => [principal.name, principal]));
  const compareByName = new Map(
    comparePrincipals.map((principal) => [principal.name, principal]),
  );
  const orderedNames = [
    ...comparePrincipals.map((principal) => principal.name),
    ...basePrincipals
      .map((principal) => principal.name)
      .filter((name) => !compareByName.has(name)),
  ];

  return orderedNames.map((name) => {
    const existsInBase = baseByName.has(name);
    const comparePrincipal = compareByName.get(name);

    return {
      name,
      status: !existsInBase
        ? "added"
        : comparePrincipal
          ? "unchanged"
          : "removed",
    } satisfies DemoCompareGraphPrincipal;
  });
}

function compareLane(
  baseLane: DemoCompareGraphLane | undefined,
  compareLane: DemoCompareGraphLane | undefined,
): LaneComparisonResult {
  if (!baseLane && compareLane) {
    return {
      lane: {
        ...compareLane,
        status: "added",
        principals: (compareLane.principals ?? []).map((principal) => ({
          ...principal,
          status: "added",
        })),
      } satisfies DemoCompareGraphLane,
      stats: {
        rolesChanged: 1,
        rulesAdded: 1,
        thresholdDelta: parseApprovalCount(compareLane.approvals),
        principalChanges: (compareLane.principals ?? []).length,
      },
      metadataFlags: {
        trustSetup: true,
        fileRules: true,
        rootMetadata: (compareLane.principals ?? []).length > 0,
      },
    };
  }

  if (baseLane && !compareLane) {
    return {
      lane: {
        ...baseLane,
        status: "removed",
        principals: (baseLane.principals ?? []).map((principal) => ({
          ...principal,
          status: "removed",
        })),
      } satisfies DemoCompareGraphLane,
      stats: {
        rolesChanged: 1,
        rulesAdded: 0,
        thresholdDelta: -parseApprovalCount(baseLane.approvals),
        principalChanges: (baseLane.principals ?? []).length,
      },
      metadataFlags: {
        trustSetup: true,
        fileRules: true,
        rootMetadata: (baseLane.principals ?? []).length > 0,
      },
    };
  }

  if (!baseLane || !compareLane) {
    throw new Error("compareLane requires at least one lane to compare");
  }

  const pathChanged = baseLane.pathLabel !== compareLane.pathLabel;
  const roleChanged = baseLane.roleLabel !== compareLane.roleLabel;
  const baseApprovalCount = parseApprovalCount(baseLane.approvals);
  const compareApprovalCount = parseApprovalCount(compareLane.approvals);
  const approvalsChanged = baseApprovalCount !== compareApprovalCount;
  const principals = comparePrincipals(
    baseLane.principals ?? [],
    compareLane.principals ?? [],
  );
  const principalChanges = principals.filter(
    (principal) => principal.status !== "unchanged",
  ).length;

  return {
    lane: {
      ...compareLane,
      pathStatus: pathChanged ? "modified" : undefined,
      roleStatus: roleChanged ? "modified" : undefined,
      approvalsStatus: approvalsChanged ? "modified" : undefined,
      principals,
    } satisfies DemoCompareGraphLane,
    stats: {
      rolesChanged: pathChanged || roleChanged || approvalsChanged ? 1 : 0,
      rulesAdded: 0,
      thresholdDelta: compareApprovalCount - baseApprovalCount,
      principalChanges,
    },
    metadataFlags: {
      trustSetup: approvalsChanged,
      fileRules: pathChanged || roleChanged,
      rootMetadata: principalChanges > 0,
    },
  };
}

export function buildComparisonResult(
  baseGraph: DemoCompareGraph | undefined,
  compareGraph: DemoCompareGraph | undefined,
  compareVersionLabel: string,
): VisualizerComparisonResult {
  const baseLanes = baseGraph?.lanes ?? [];
  const compareLanes = compareGraph?.lanes ?? [];
  const baseLaneMap = new Map(baseLanes.map((lane) => [lane.key, lane]));
  const compareLaneMap = new Map(compareLanes.map((lane) => [lane.key, lane]));
  const orderedLaneKeys = [
    ...compareLanes.map((lane) => lane.key),
    ...baseLanes.map((lane) => lane.key).filter((key) => !compareLaneMap.has(key)),
  ];

  let rolesChanged = 0;
  let rulesAdded = 0;
  let thresholdDelta = 0;
  let principalChanges = 0;
  let trustSetupChanged = false;
  let fileRulesChanged = false;
  let rootMetadataChanged = false;

  const lanes = orderedLaneKeys
    .map((key) => {
      const result = compareLane(baseLaneMap.get(key), compareLaneMap.get(key));
      rolesChanged += result.stats.rolesChanged;
      rulesAdded += result.stats.rulesAdded;
      thresholdDelta += result.stats.thresholdDelta;
      principalChanges += result.stats.principalChanges;
      trustSetupChanged ||= result.metadataFlags.trustSetup;
      fileRulesChanged ||= result.metadataFlags.fileRules;
      rootMetadataChanged ||= result.metadataFlags.rootMetadata;
      return result.lane;
    });

  const changedMetadata = [
    trustSetupChanged ? "Trust setup" : null,
    fileRulesChanged ? "File rules" : null,
    rootMetadataChanged ? "Root metadata" : null,
  ].filter((item): item is string => Boolean(item));

  return {
    changedMetadata,
    stats: [
      { value: String(rolesChanged), label: "roles changed" },
      { value: String(rulesAdded), label: "rules added" },
      {
        value:
          thresholdDelta === 0
            ? "0"
            : `${Math.abs(thresholdDelta)} ${thresholdDelta > 0 ? "↑" : "↓"}`,
        label: "threshold delta",
      },
      { value: String(principalChanges), label: "principal changes" },
    ],
    compareGraph: {
      repositoryLabel:
        compareGraph?.repositoryLabel ?? compareVersionLabel.split(" • ")[0],
      branchLabel: compareGraph?.branchLabel ?? "Branch: main",
      showLegend: true,
      lanes,
    },
  };
}
