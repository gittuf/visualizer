"use client";

import { useState } from "react";
import { PolicyGraphCanvas } from "@/screens/visualizer/policy-graph-canvas";
import type { PolicyGraphCanvasVariant } from "@/screens/visualizer/policy-graph.types";

interface WorkspaceCompareCanvasProps {
  baseVersionLabel: string;
  compareVersionLabel: string;
  baseGraph: PolicyGraphCanvasVariant;
  compareGraph: PolicyGraphCanvasVariant;
  zoom: number;
  searchQuery?: string;
}

export function WorkspaceCompareCanvas({
  baseVersionLabel,
  compareVersionLabel,
  baseGraph,
  compareGraph,
  zoom,
  searchQuery,
}: WorkspaceCompareCanvasProps) {
  const [baseOffset, setBaseOffset] = useState({ x: 0, y: 0 });
  const [compareOffset, setCompareOffset] = useState({ x: 0, y: 0 });

  return (
    <div className="relative h-full bg-[linear-gradient(to_right,rgba(4,8,14,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(4,8,14,0.06)_1px,transparent_1px)] bg-[size:24px_24px]">
      <div className="h-full w-full overflow-auto">
        <div className="flex min-h-full min-w-full w-max items-start gap-2 overflow-visible p-4">
          <div className="w-[980px] shrink-0 overflow-visible">
            <div className="h-[980px] w-[980px] overflow-visible">
              <PolicyGraphCanvas
                graphId="compare-base"
                zoom={zoom}
                viewportWidth={980}
                viewportHeight={980}
                offset={baseOffset}
                onOffsetChange={setBaseOffset}
                allowOverflowDrag
                variant={{
                  ...baseGraph,
                  repositoryLabel: `Base version: ${baseVersionLabel}`,
                }}
                searchQuery={searchQuery}
              />
            </div>
          </div>
          <div className="w-[980px] shrink-0 overflow-visible">
            <div className="h-[980px] w-[980px] overflow-visible">
              <PolicyGraphCanvas
                graphId="compare-target"
                zoom={zoom}
                viewportWidth={980}
                viewportHeight={980}
                offset={compareOffset}
                onOffsetChange={setCompareOffset}
                allowOverflowDrag
                variant={{
                  ...compareGraph,
                  repositoryLabel: `Compare version: ${compareVersionLabel}`,
                }}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 z-30">
        <div className="absolute bottom-6 left-6 border border-[var(--dark-gray)] bg-transparent px-4 py-3">
          <div className="space-y-2.5 text-[14px] leading-[1.35] text-black">
            {[
              ["Added", "var(--approve-color)"],
              ["Removed", "var(--reject-color)"],
              ["Modified", "var(--modified-color)"],
              ["Unchanged", "var(--dark-gray)"],
            ].map(([label, color]) => (
              <div key={label} className="flex items-center gap-3">
                <span
                  className="h-[14px] w-[14px] rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
