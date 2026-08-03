import {
  boundary,
  branchBox,
  DIFF_COLORS,
  fileBox,
  roleBox,
} from "@/screens/visualizer/policy-graph.constants";
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
  // Diff colors are applied at the most specific rendered element we can infer.
  // A changed approval count should color the approval value and role icon
  // without implicitly coloring unchanged principals beneath that lane.
  const branch = getChangeType(lane.branchStatus);
  const laneDefault = lane.status;
  const path = getChangeType(lane.pathStatus ?? laneDefault);
  const role = getChangeType(
    lane.roleStatus ?? lane.approvalsStatus ?? laneDefault,
  );
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

export interface PolicyLaneLayout {
  centerX: number;
  width: number;
}

export interface PrincipalLayout {
  offset: number;
  width: number;
}

function getEstimatedPrincipalWidths(principals: Array<{ name: string }>) {
  const minWidth = 72;
  const maxWidth = 136;

  return principals.map((principal) =>
    Math.max(minWidth, Math.min(maxWidth, principal.name.length * 7 + 28)),
  );
}

function getPackedPrincipalWidth(principals: Array<{ name: string }>) {
  if (principals.length === 0) return 0;

  const gap = 16;
  const estimatedWidths = getEstimatedPrincipalWidths(principals);

  return (
    estimatedWidths.reduce((sum, width) => sum + width, 0) +
    gap * (principals.length - 1)
  );
}

export function getLaneLayouts(
  lanes: PolicyGraphLane[],
  principalNames: string[],
): PolicyLaneLayout[] {
  if (lanes.length === 0) return [];

  const gutter = 64;
  const minOuterPadding = 40;
  const minLaneWidth = Math.max(branchBox.width, fileBox.width, roleBox.width + 24);
  const availableInnerWidth =
    boundary.width - minOuterPadding * 2 - gutter * (lanes.length - 1);
  const rawLaneWidths = lanes.map((lane) => {
    const lanePrincipals =
      lane.principals ?? principalNames.map((name) => ({ name }));
    const principalWidth = getPackedPrincipalWidth(lanePrincipals);

    return Math.max(
      minLaneWidth,
      branchBox.width,
      fileBox.width,
      roleBox.width,
      principalWidth + 24,
    );
  });
  const baseWidthTotal = minLaneWidth * lanes.length;
  const availableExtraWidth = Math.max(0, availableInnerWidth - baseWidthTotal);
  const rawExtras = rawLaneWidths.map((width) => Math.max(0, width - minLaneWidth));
  const rawExtraTotal = rawExtras.reduce((sum, width) => sum + width, 0);
  const laneExtraScale =
    rawExtraTotal > availableExtraWidth
      ? availableExtraWidth / rawExtraTotal
      : 1;
  const laneWidths = rawLaneWidths.map((width, index) =>
    minLaneWidth + rawExtras[index] * laneExtraScale,
  );
  const totalWidth =
    laneWidths.reduce((sum, width) => sum + width, 0) + gutter * (lanes.length - 1);
  const outerPadding = Math.max(
    minOuterPadding,
    (boundary.width - totalWidth) / 2,
  );
  let laneStart = boundary.x + outerPadding;

  return laneWidths.map((width) => {
    const layout = {
      centerX: laneStart + width / 2,
      width,
    };

    laneStart += width + gutter;
    return layout;
  });
}

export function getPrincipalLayouts(
  principals: Array<{ name: string }>,
  laneWidth: number,
): PrincipalLayout[] {
  if (principals.length === 0) return [];

  const gap = 16;
  const minWidth = 72;
  const maxWidth = 136;
  const usableWidth = Math.max(minWidth, laneWidth - 24);
  const estimatedWidths = getEstimatedPrincipalWidths(principals);
  const totalWidth =
    estimatedWidths.reduce((sum, width) => sum + width, 0) +
    gap * (principals.length - 1);
  const scale = totalWidth > usableWidth ? usableWidth / totalWidth : 1;
  const widths = estimatedWidths.map((width) =>
    Math.max(minWidth, Math.min(maxWidth, width * scale)),
  );
  const packedWidth =
    widths.reduce((sum, width) => sum + width, 0) + gap * (principals.length - 1);
  let cursor = -packedWidth / 2;

  return widths.map((width) => {
    const offset = cursor + width / 2;
    cursor += width + gap;

    return { offset, width };
  });
}
