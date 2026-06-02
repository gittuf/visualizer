import { DIFF_COLORS, boundary } from "@/screens/visualizer/policy-graph.constants";
import type {
  PolicyGraphChangeStatus,
  PolicyGraphLane,
  PolicyGraphPrincipal,
} from "@/screens/visualizer/policy-graph.types";

export function getChangeType(
  status?: PolicyGraphChangeStatus,
): PolicyGraphChangeStatus {
  return status ?? "unchanged";
}

export function getEdgeColor(changeType: PolicyGraphChangeStatus) {
  return DIFF_COLORS[changeType].edge;
}

export function getTextClassName(changeType: PolicyGraphChangeStatus) {
  return DIFF_COLORS[changeType].text;
}

export function getIconClassName(changeType: PolicyGraphChangeStatus) {
  return DIFF_COLORS[changeType].icon;
}

export function getIconFilter(changeType: PolicyGraphChangeStatus) {
  if (changeType === "unchanged") {
    return "grayscale(1)";
  }

  if (changeType === "modified") {
    return "brightness(0) saturate(100%) invert(51%) sepia(92%) saturate(1736%) hue-rotate(204deg) brightness(98%) contrast(90%)";
  }

  if (changeType === "removed") {
    return "brightness(0) saturate(100%) invert(56%) sepia(90%) saturate(3018%) hue-rotate(331deg) brightness(96%) contrast(94%)";
  }

  return "brightness(0) saturate(100%) invert(62%) sepia(62%) saturate(560%) hue-rotate(83deg) brightness(93%) contrast(91%)";
}

export function getNodeTextStyle(
  value: string,
  normalizedSearchQuery: string,
) {
  return normalizedSearchQuery &&
    value.toLowerCase().includes(normalizedSearchQuery)
    ? {
        backgroundColor: "var(--selected-color)",
        borderRadius: "4px",
      }
    : undefined;
}

export function getLaneNodeChangeTypes(lane: PolicyGraphLane) {
  const branch = getChangeType(lane.branchStatus);
  const laneDefault = lane.status;
  const path = getChangeType(lane.pathStatus ?? laneDefault);
  const role = getChangeType(lane.roleStatus);
  const approvals = getChangeType(lane.approvalsStatus ?? laneDefault);
  const roleIcon = getChangeType(
    lane.roleStatus ?? lane.approvalsStatus ?? laneDefault,
  );

  return {
    branch,
    path,
    role,
    approvals,
    roleIcon,
  };
}

export function getPrincipalChangeType(
  principal: PolicyGraphPrincipal,
  lane: PolicyGraphLane,
) {
  return getChangeType(principal.status ?? lane.status);
}

export const compareStatusColors: Record<PolicyGraphChangeStatus, string> = {
  added: DIFF_COLORS.added.edge,
  removed: DIFF_COLORS.removed.edge,
  modified: DIFF_COLORS.modified.edge,
  unchanged: DIFF_COLORS.unchanged.edge,
};

export function getLaneCenters(laneCount: number) {
  if (laneCount <= 1) {
    return [boundary.x + boundary.width / 2];
  }

  const usableWidth = boundary.width - 420;
  return Array.from({ length: laneCount }, (_, index) => {
    const ratio = laneCount === 1 ? 0.5 : index / (laneCount - 1);
    return boundary.x + 210 + usableWidth * ratio;
  });
}

export function getPrincipalOffsets(principalCount: number) {
  if (principalCount <= 1) return [0];

  const maxSpread = 300;
  const spread = Math.min(maxSpread, Math.max(120, (principalCount - 1) * 90));
  const start = -spread / 2;
  const step = spread / (principalCount - 1);

  return Array.from({ length: principalCount }, (_, index) => start + step * index);
}
