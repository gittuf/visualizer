"use client";

import { boundary, layoutHeight, layoutWidth } from "@/screens/visualizer/policy-graph.constants";
import {
  compareStatusColors,
  getEdgeColor,
} from "@/screens/visualizer/policy-graph.utils";
import type { PolicyGraphEdge } from "@/screens/visualizer/policy-graph.types";

interface PolicyGraphSvgProps {
  boundaryFill: string;
  graphId: string;
  isDraggingBoundary: boolean;
  paths: PolicyGraphEdge[];
}

export function PolicyGraphSvg({
  boundaryFill,
  graphId,
  isDraggingBoundary,
  paths,
}: PolicyGraphSvgProps) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${layoutWidth} ${layoutHeight}`}
      preserveAspectRatio="xMidYMin meet"
    >
      <defs>
        {[
          { id: "default", color: "var(--tertiary-color)" },
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
        stroke={isDraggingBoundary ? "var(--modified-color)" : "var(--dark-gray)"}
        strokeWidth="1.5"
        strokeDasharray="6 6"
      />

      {paths.map((path, index) => (
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
  );
}
