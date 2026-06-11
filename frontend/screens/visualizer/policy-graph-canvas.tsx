"use client";

import type React from "react";
import { useState } from "react";
import {
  boundary,
  branchBox,
  defaultLanes,
  defaultPolicyGraphVariant,
  defaultPrincipalNames,
  fileBox,
  layoutHeight,
  layoutWidth,
  roleBox,
  rowY,
  scrollPadding,
} from "@/screens/visualizer/policy-graph.constants";
import {
  getLaneCenters,
  getLaneNodeChangeTypes,
  getNodeTextStyle,
  getPrincipalChangeType,
  getPrincipalOffsets,
} from "@/screens/visualizer/policy-graph.utils";
import type {
  PolicyGraphCanvasVariant,
  PolicyGraphEdge,
} from "@/screens/visualizer/policy-graph.types";
import { PolicyGraphLaneColumn } from "@/screens/visualizer/policy-graph-lane-column";
import { PolicyGraphSvg } from "@/screens/visualizer/policy-graph-svg";

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
  const repositoryLabel =
    variant?.repositoryLabel ?? defaultPolicyGraphVariant.repositoryLabel;
  const repositoryLabelColor =
    variant?.repositoryLabelColor ?? defaultPolicyGraphVariant.repositoryLabelColor;
  const branchLabel = variant?.branchLabel ?? defaultPolicyGraphVariant.branchLabel;
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
            <PolicyGraphSvg
              boundaryFill={boundaryFill}
              graphId={graphId}
              isDraggingBoundary={isDraggingBoundary}
              paths={[...verticalPaths, ...principalPaths]}
            />

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
                className="absolute z-20 flex h-7 w-7 items-center justify-center bg-transparent text-[18px] font-bold leading-none text-(--reject-color) transition-colors duration-150 hover:opacity-80"
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
                  normalizedSearchQuery,
                ),
              }}
            >
              {repositoryLabel}
            </div>

            {lanes.map((lane, laneIndex) => {
              const centerX = laneCenters[laneIndex];

              return (
                <PolicyGraphLaneColumn
                  key={lane.key}
                  branchLabel={branchLabel}
                  centerX={centerX}
                  lane={lane}
                  normalizedSearchQuery={normalizedSearchQuery}
                  principalNames={principalNames}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
