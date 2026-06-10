"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import branchIcon from "@/assets/branch.png";
import fileIcon from "@/assets/file.png";
import usersIcon from "@/assets/Users.png";
import userIcon from "@/assets/user.png";

export interface PolicyGraphLane {
  key: string;
  pathLabel: string;
  roleLabel: string;
  approvals: string;
  branchStatus?: PolicyGraphChangeStatus;
  status?: PolicyGraphChangeStatus;
  pathStatus?: PolicyGraphChangeStatus;
  roleStatus?: PolicyGraphChangeStatus;
  approvalsStatus?: PolicyGraphChangeStatus;
  principals?: PolicyGraphPrincipal[];
}

export type PolicyGraphChangeStatus =
  | "added"
  | "removed"
  | "modified"
  | "unchanged";

export interface PolicyGraphPrincipal {
  name: string;
  status?: PolicyGraphChangeStatus;
}

export interface PolicyGraphCanvasVariant {
  repositoryLabel?: string;
  branchLabel?: string;
  lanes?: PolicyGraphLane[];
  principalNames?: string[];
  boundaryFill?: string;
  repositoryLabelColor?: string;
  showCompareLegend?: boolean;
}

interface PolicyGraphCanvasProps {
  graphId: string;
  zoom: number;
  viewportWidth: number;
  viewportHeight: number;
  offset: {
    x: number;
    y: number;
  };
  onOffsetChange: (offset: { x: number; y: number }) => void;
  onDelete?: () => void;
  variant?: PolicyGraphCanvasVariant;
  searchQuery?: string;
  allowOverflowDrag?: boolean;
}

const layoutWidth = 980;
const layoutHeight = 980;
const boundary = { x: 80, y: 60, width: 820, height: 840 };
const rowY = {
  branch: 120,
  file: 300,
  role: 500,
  principals: 760,
};
const defaultLanes = [
  {
    key: "left",
    pathLabel: "src/**",
    roleLabel: "Authorized users",
    approvals: "Requires: 2 approvals",
  },
  {
    key: "right",
    pathLabel: "docs/**",
    roleLabel: "Authorized users",
    approvals: "Requires: 2 approvals",
  },
] as const;
const defaultPrincipalNames = ["Alice", "Carol", "Bob"];
const branchBox = { width: 140, height: 92 };
const fileBox = { width: 120, height: 118 };
const roleBox = { width: 180, height: 132 };
const principalBox = { width: 92, height: 108 };
const scrollPadding = 96;
const DIFF_COLORS = {
  unchanged: {
    text: "text-black",
    icon: "text-black",
    edge: "#111827",
  },
  added: {
    text: "text-green-500",
    icon: "text-green-500",
    edge: "#22C55E",
  },
  removed: {
    text: "text-red-500",
    icon: "text-red-500",
    edge: "#EF4444",
  },
  modified: {
    text: "text-blue-500",
    icon: "text-blue-500",
    edge: "#3B82F6",
  },
} as const;

interface PolicyGraphEdge {
  d: string;
  arrow: boolean;
  changeType: PolicyGraphChangeStatus;
}

function getChangeType(
  status?: PolicyGraphChangeStatus,
): PolicyGraphChangeStatus {
  return status ?? "unchanged";
}

function getEdgeColor(changeType: PolicyGraphChangeStatus) {
  return DIFF_COLORS[changeType].edge;
}

function getTextClassName(changeType: PolicyGraphChangeStatus) {
  return DIFF_COLORS[changeType].text;
}

function getIconFilter(changeType: PolicyGraphChangeStatus) {
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

function getNodeTextStyle(
  value: string,
  changeType: PolicyGraphChangeStatus,
  normalizedSearchQuery: string,
) {
  return normalizedSearchQuery &&
    value.toLowerCase().includes(normalizedSearchQuery)
    ? {
        backgroundColor: "#DBEAFE",
        borderRadius: "4px",
      }
    : undefined;
}

function getLaneNodeChangeTypes(lane: PolicyGraphLane) {
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

function getPrincipalChangeType(
  principal: PolicyGraphPrincipal,
  lane: PolicyGraphLane,
) {
  return getChangeType(principal.status ?? lane.status);
}

function getIconClassName(changeType: PolicyGraphChangeStatus) {
  return DIFF_COLORS[changeType].icon;
}

const compareStatusColors: Record<PolicyGraphChangeStatus, string> = {
  added: DIFF_COLORS.added.edge,
  removed: DIFF_COLORS.removed.edge,
  modified: DIFF_COLORS.modified.edge,
  unchanged: DIFF_COLORS.unchanged.edge,
};

function getLaneCenters(laneCount: number) {
  if (laneCount <= 1) {
    return [boundary.x + boundary.width / 2];
  }

  const usableWidth = boundary.width - 420;
  return Array.from({ length: laneCount }, (_, index) => {
    const ratio = laneCount === 1 ? 0.5 : index / (laneCount - 1);
    return boundary.x + 210 + usableWidth * ratio;
  });
}

function getPrincipalOffsets(principalCount: number) {
  if (principalCount <= 1) return [0];

  const maxSpread = 300;
  const spread = Math.min(maxSpread, Math.max(120, (principalCount - 1) * 90));
  const start = -spread / 2;
  const step = spread / (principalCount - 1);

  return Array.from({ length: principalCount }, (_, index) => start + step * index);
}

export function PolicyGraphCanvas({
  graphId,
  zoom,
  viewportWidth,
  viewportHeight,
  offset,
  onOffsetChange,
  onDelete,
  variant,
  searchQuery = "",
  allowOverflowDrag = false,
}: PolicyGraphCanvasProps) {
  const [isDraggingBoundary, setIsDraggingBoundary] = useState(false);
  const lanes = variant?.lanes ?? [...defaultLanes];
  const principalNames = variant?.principalNames ?? defaultPrincipalNames;
  const repositoryLabel = variant?.repositoryLabel ?? "gittuf_repo";
  const repositoryLabelColor = variant?.repositoryLabelColor ?? "#7E7E7E";
  const branchLabel = variant?.branchLabel ?? "Branch: main";
  const boundaryFill = variant?.boundaryFill ?? "none";
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const laneCenters = getLaneCenters(lanes.length);
  const scaledWidth = layoutWidth * zoom;
  const scaledHeight = layoutHeight * zoom;
  const canvasWidth = Math.max(scaledWidth + scrollPadding * 2, viewportWidth);
  const canvasHeight = Math.max(
    scaledHeight + scrollPadding * 2,
    viewportHeight,
  );
  const canvasOffsetX =
    scaledWidth + scrollPadding * 2 <= viewportWidth
      ? (viewportWidth - scaledWidth) / 2
      : scrollPadding;
  const canvasOffsetY =
    scaledHeight + scrollPadding * 2 <= viewportHeight
      ? (viewportHeight - scaledHeight) / 2
      : scrollPadding;
  const graphLeft = allowOverflowDrag
    ? canvasOffsetX + offset.x
    : Math.min(
        Math.max(0, canvasOffsetX + offset.x),
        Math.max(0, canvasWidth - scaledWidth),
      );
  const graphTop = allowOverflowDrag
    ? canvasOffsetY + offset.y
    : Math.min(
        Math.max(0, canvasOffsetY + offset.y),
        Math.max(0, canvasHeight - scaledHeight),
      );

  const verticalPaths: PolicyGraphEdge[] = lanes.flatMap((lane, laneIndex) => {
    const centerX = laneCenters[laneIndex];
    const changeTypes = getLaneNodeChangeTypes(lane);

    return [
      {
        d: `M ${centerX} ${rowY.branch + branchBox.height} L ${centerX} ${rowY.file - 18}`,
        arrow: true,
        changeType: changeTypes.path,
      },
      {
        d: `M ${centerX} ${rowY.file + fileBox.height} L ${centerX} ${rowY.role - 18}`,
        arrow: true,
        changeType: changeTypes.role,
      },
    ];
  });

  const principalPaths: PolicyGraphEdge[] = lanes.flatMap((lane, laneIndex) => {
    const centerX = laneCenters[laneIndex];
    const lanePrincipals =
      lane.principals ??
      principalNames.map((name) => ({
        name,
      }));
    const principalOffsets = getPrincipalOffsets(lanePrincipals.length);

    return principalOffsets.map((offset, index) => {
      const principal = lanePrincipals[index] ?? { name: "" };
      const principalChangeType = getPrincipalChangeType(principal, lane);

      return {
        d: `M ${centerX} ${rowY.role + roleBox.height} L ${centerX + offset} ${rowY.principals - 18}`,
        arrow: true,
        changeType: principalChangeType,
      };
    });
  });

  const handleBoundaryPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (event.button !== 0) return;

    event.preventDefault();

    const target = event.currentTarget;
    const startX = event.clientX;
    const startY = event.clientY;
    const startOffset = offset;

    target.setPointerCapture(event.pointerId);
    setIsDraggingBoundary(true);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextOffsetX = startOffset.x + (moveEvent.clientX - startX);
      const nextOffsetY = startOffset.y + (moveEvent.clientY - startY);
      const minOffsetX = -canvasOffsetX;
      const maxOffsetX = canvasWidth - scaledWidth - canvasOffsetX;
      const minOffsetY = -canvasOffsetY;
      const maxOffsetY = canvasHeight - scaledHeight - canvasOffsetY;

      onOffsetChange(
        allowOverflowDrag
          ? {
              x: nextOffsetX,
              y: nextOffsetY,
            }
          : {
              x: Math.min(maxOffsetX, Math.max(minOffsetX, nextOffsetX)),
              y: Math.min(maxOffsetY, Math.max(minOffsetY, nextOffsetY)),
            },
      );
    };

    const handlePointerEnd = (endEvent: PointerEvent) => {
      setIsDraggingBoundary(false);
      target.releasePointerCapture(endEvent.pointerId);
      target.removeEventListener("pointermove", handlePointerMove);
      target.removeEventListener("pointerup", handlePointerEnd);
      target.removeEventListener("pointercancel", handlePointerEnd);
    };

    target.addEventListener("pointermove", handlePointerMove);
    target.addEventListener("pointerup", handlePointerEnd);
    target.addEventListener("pointercancel", handlePointerEnd);
  };

  return (
    <div
      className={`relative h-full w-full select-none ${
        allowOverflowDrag ? "overflow-visible" : "overflow-hidden"
      }`}
    >
      <div
        className="relative min-h-full min-w-full"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        }}
      >
        <div
          className="absolute origin-top-left"
          style={{
            left: `${graphLeft}px`,
            top: `${graphTop}px`,
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
          }}
        >
          <div
            className="relative origin-top-left"
            style={{
              width: `${layoutWidth}px`,
              height: `${layoutHeight}px`,
              transform: `scale(${zoom})`,
            }}
          >
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox={`0 0 ${layoutWidth} ${layoutHeight}`}
              preserveAspectRatio="xMidYMin meet"
            >
              <defs>
                {[
                  { id: "default", color: "#04080E" },
                  ...Object.entries(compareStatusColors).map(([id, color]) => ({
                    id,
                    color,
                  })),
                ].map((marker) => (
                  <marker
                    key={marker.id}
                    id={`policy-arrow-${graphId}-${marker.id}`}
                    markerWidth="10"
                    markerHeight="10"
                    refX="8"
                    refY="5"
                    orient="auto"
                  >
                    <path
                      d="M1,1 L8,5 L1,9"
                      fill="none"
                      stroke={marker.color}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </marker>
                ))}
              </defs>

              <rect
                x={boundary.x}
                y={boundary.y}
                width={boundary.width}
                height={boundary.height}
                fill={boundaryFill}
                stroke={isDraggingBoundary ? "#61A1D1" : "#9CA3AF"}
                strokeWidth="1.5"
                strokeDasharray="6 6"
              />

              {[...verticalPaths, ...principalPaths].map((path, index) => (
                <path
                  key={index}
                  d={path.d}
                  stroke={getEdgeColor(path.changeType)}
                  strokeWidth="1.5"
                  fill="none"
                  markerEnd={
                    path.arrow
                      ? `url(#policy-arrow-${graphId}-${path.changeType})`
                      : undefined
                  }
                />
              ))}
            </svg>

            <div
              className="absolute"
              style={{
                left: `${boundary.x}px`,
                top: `${boundary.y}px`,
                width: `${boundary.width}px`,
                height: `${boundary.height}px`,
                cursor: "grab",
              }}
              onPointerDown={handleBoundaryPointerDown}
            />

            {onDelete ? (
              <button
                type="button"
                aria-label="Delete graph"
                onClick={onDelete}
                className="absolute z-20 flex h-7 w-7 items-center justify-center bg-transparent text-[18px] font-bold leading-none text-[#C53B3B] transition-colors duration-150 hover:text-[#9F1D1D]"
                style={{
                  left: `${boundary.x + boundary.width - 24}px`,
                  top: `${boundary.y + 2}px`,
                }}
              >
                x
              </button>
            ) : null}

            <div
              className="absolute text-[16px] font-bold leading-[1.3]"
              style={{
                left: `${boundary.x}px`,
                top: `${boundary.y - 32}px`,
                color: repositoryLabelColor,
                ...getNodeTextStyle(
                  repositoryLabel,
                  "unchanged",
                  normalizedSearchQuery,
                ),
              }}
            >
              {repositoryLabel}
            </div>

            {lanes.map((lane, laneIndex) => {
              const centerX = laneCenters[laneIndex];
              const changeTypes = getLaneNodeChangeTypes(lane);
              const lanePrincipals =
                lane.principals ??
                principalNames.map((name) => ({
                  name,
                }));
              const principalOffsets = getPrincipalOffsets(lanePrincipals.length);

              return (
                <div key={lane.key}>
                  <div
                    className="absolute flex flex-col items-center text-center"
                    style={{
                      left: `${centerX - branchBox.width / 2}px`,
                      top: `${rowY.branch}px`,
                      width: `${branchBox.width}px`,
                      minHeight: `${branchBox.height}px`,
                    }}
                  >
                    <Image
                      src={branchIcon}
                      alt=""
                      className={`mt-1 h-9 w-9 ${getIconClassName(changeTypes.branch)}`}
                      style={{ filter: getIconFilter(changeTypes.branch) }}
                      draggable={false}
                    />
                    <div
                      className={`mt-2 text-[16px] leading-[1.3] ${getTextClassName(changeTypes.branch)}`}
                      style={getNodeTextStyle(
                        branchLabel,
                        changeTypes.branch,
                        normalizedSearchQuery,
                      )}
                    >
                      {branchLabel}
                    </div>
                  </div>

                  <div
                    className="absolute flex flex-col items-center text-center"
                    style={{
                      left: `${centerX - fileBox.width / 2}px`,
                      top: `${rowY.file}px`,
                      width: `${fileBox.width}px`,
                      minHeight: `${fileBox.height}px`,
                    }}
                  >
                    <Image
                      src={fileIcon}
                      alt=""
                      className={`mt-1 h-12 w-10 ${getIconClassName(changeTypes.path)}`}
                      style={{
                        filter: getIconFilter(changeTypes.path),
                      }}
                      draggable={false}
                    />
                    <div
                      className={`mt-2 text-[16px] leading-[1.3] ${getTextClassName(changeTypes.path)}`}
                      style={getNodeTextStyle(
                        lane.pathLabel,
                        changeTypes.path,
                        normalizedSearchQuery,
                      )}
                    >
                      {lane.pathLabel}
                    </div>
                  </div>

                  <div
                    className="absolute flex flex-col items-center text-center"
                    style={{
                      left: `${centerX - roleBox.width / 2}px`,
                      top: `${rowY.role}px`,
                      width: `${roleBox.width}px`,
                      minHeight: `${roleBox.height}px`,
                    }}
                  >
                    <Image
                      src={usersIcon}
                      alt=""
                      className={`mt-1 h-12 w-12 ${getIconClassName(changeTypes.roleIcon)}`}
                      style={{
                        filter: getIconFilter(changeTypes.roleIcon),
                      }}
                      draggable={false}
                    />
                    <div
                      className={`mt-2 text-[16px] leading-[1.3] ${getTextClassName(changeTypes.roleIcon)}`}
                      style={getNodeTextStyle(
                        lane.roleLabel,
                        changeTypes.roleIcon,
                        normalizedSearchQuery,
                      )}
                    >
                      {lane.roleLabel}
                    </div>
                    <div
                      className={`mt-1 text-[14px] leading-[1.3] ${getTextClassName(changeTypes.approvals)}`}
                      style={getNodeTextStyle(
                        lane.approvals,
                        changeTypes.approvals,
                        normalizedSearchQuery,
                      )}
                    >
                      {lane.approvals}
                    </div>
                  </div>

                  {lanePrincipals.map((principal, principalIndex) => {
                    const center = centerX + principalOffsets[principalIndex];
                    const principalChangeType = getPrincipalChangeType(
                      principal,
                      lane,
                    );

                    return (
                      <div
                        key={`${lane.key}-${principal.name}`}
                        className="absolute flex flex-col items-center text-center"
                        style={{
                          left: `${center - principalBox.width / 2}px`,
                          top: `${rowY.principals}px`,
                          width: `${principalBox.width}px`,
                          minHeight: `${principalBox.height}px`,
                        }}
                      >
                        <Image
                          src={userIcon}
                          alt=""
                          className={`mt-1 h-10 w-10 ${getIconClassName(principalChangeType)}`}
                          style={{
                            filter: getIconFilter(principalChangeType),
                          }}
                          draggable={false}
                        />
                        <div
                          className={`mt-2 text-[16px] leading-[1.3] ${getTextClassName(principalChangeType)}`}
                          style={getNodeTextStyle(
                            principal.name,
                            principalChangeType,
                            normalizedSearchQuery,
                          )}
                        >
                          {principal.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
