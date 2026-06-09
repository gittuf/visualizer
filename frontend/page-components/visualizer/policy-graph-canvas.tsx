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
}

export interface PolicyGraphCanvasVariant {
  repositoryLabel?: string;
  branchLabel?: string;
  lanes?: PolicyGraphLane[];
  principalNames?: string[];
  boundaryFill?: string;
  repositoryLabelColor?: string;
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
}

const layoutWidth = 980;
const layoutHeight = 980;
const boundary = { x: 80, y: 60, width: 820, height: 840 };
const laneCenters = [310, 670];
const principalOffsets = [-110, 0, 110];
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

export function PolicyGraphCanvas({
  graphId,
  zoom,
  viewportWidth,
  viewportHeight,
  offset,
  onOffsetChange,
  onDelete,
  variant,
}: PolicyGraphCanvasProps) {
  const [isDraggingBoundary, setIsDraggingBoundary] = useState(false);
  const lanes = variant?.lanes ?? [...defaultLanes];
  const principalNames = variant?.principalNames ?? defaultPrincipalNames;
  const repositoryLabel = variant?.repositoryLabel ?? "gittuf_repo";
  const repositoryLabelColor = variant?.repositoryLabelColor ?? "#7E7E7E";
  const branchLabel = variant?.branchLabel ?? "Branch: main";
  const boundaryFill = variant?.boundaryFill ?? "none";
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
  const graphLeft = Math.min(
    Math.max(0, canvasOffsetX + offset.x),
    Math.max(0, canvasWidth - scaledWidth),
  );
  const graphTop = Math.min(
    Math.max(0, canvasOffsetY + offset.y),
    Math.max(0, canvasHeight - scaledHeight),
  );

  const verticalPaths = laneCenters.flatMap((centerX) => [
    {
      d: `M ${centerX} ${rowY.branch + branchBox.height} L ${centerX} ${rowY.file - 18}`,
      arrow: true,
    },
    {
      d: `M ${centerX} ${rowY.file + fileBox.height} L ${centerX} ${rowY.role - 18}`,
      arrow: true,
    },
  ]);

  const principalPaths = laneCenters.flatMap((centerX) => {
    const splitY = 660;

    return [
      {
        d: `M ${centerX - 22} ${rowY.role + roleBox.height} L ${centerX - 22} ${splitY}`,
        arrow: false,
      },
      {
        d: `M ${centerX} ${rowY.role + roleBox.height} L ${centerX} ${splitY}`,
        arrow: false,
      },
      {
        d: `M ${centerX + 22} ${rowY.role + roleBox.height} L ${centerX + 22} ${splitY}`,
        arrow: false,
      },
      {
        d: `M ${centerX - 22} ${splitY} L ${centerX - 110} ${splitY}`,
        arrow: false,
      },
      {
        d: `M ${centerX + 22} ${splitY} L ${centerX + 110} ${splitY}`,
        arrow: false,
      },
      ...principalOffsets.map((offset) => ({
        d: `M ${centerX + offset} ${splitY} L ${centerX + offset} ${rowY.principals - 18}`,
        arrow: true,
      })),
    ];
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

      onOffsetChange({
        x: Math.min(maxOffsetX, Math.max(minOffsetX, nextOffsetX)),
        y: Math.min(maxOffsetY, Math.max(minOffsetY, nextOffsetY)),
      });
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
    <div className="relative h-full w-full overflow-hidden select-none">
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
                <marker
                  id={`policy-arrow-${graphId}`}
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="5"
                  orient="auto"
                >
                  <path
                    d="M1,1 L8,5 L1,9"
                    fill="none"
                    stroke="#04080E"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </marker>
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
                  stroke="#04080E"
                  strokeWidth="1.5"
                  fill="none"
                  markerEnd={
                    path.arrow ? `url(#policy-arrow-${graphId})` : undefined
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
              }}
            >
              {repositoryLabel}
            </div>

            {lanes.map((lane, laneIndex) => {
              const centerX = laneCenters[laneIndex];

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
                      className="mt-1 h-9 w-9 grayscale"
                      draggable={false}
                    />
                    <div className="mt-2 text-[16px] leading-[1.3] text-black">
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
                      className="mt-1 h-12 w-10 grayscale"
                      draggable={false}
                    />
                    <div className="mt-2 text-[16px] leading-[1.3] text-black">
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
                      className="mt-1 h-12 w-12 grayscale"
                      draggable={false}
                    />
                    <div className="mt-2 text-[16px] leading-[1.3] text-black">
                      {lane.roleLabel}
                    </div>
                    <div
                      className="mt-1 text-[14px] leading-[1.3]"
                      style={{ color: "#7E7E7E" }}
                    >
                      {lane.approvals}
                    </div>
                  </div>

                  {principalNames.map((name, principalIndex) => {
                    const center = centerX + principalOffsets[principalIndex];

                    return (
                      <div
                        key={`${lane.key}-${name}`}
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
                          className="mt-1 h-10 w-10 grayscale"
                          draggable={false}
                        />
                        <div className="mt-2 text-[16px] leading-[1.3] text-black">
                          {name}
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
