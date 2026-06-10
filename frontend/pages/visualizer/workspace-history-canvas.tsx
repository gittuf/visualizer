"use client";

import { useEffect, useRef, useState } from "react";
import type { DemoVisualizerData } from "@/lib/demo-visualizer-data";
import { demoVisualizerData } from "@/lib/demo-visualizer-data";
import { PolicyGraphCanvas } from "@/pages/visualizer/policy-graph-canvas";

interface WorkspaceHistoryCanvasProps {
  commits: HistoryTimelineCommit[];
  activeCommitId: string | null;
  zoom: number;
  searchQuery?: string;
}

interface WorkspaceHistoryTimelineStripProps {
  commits: HistoryTimelineCommit[];
  activeCommitId: string | null;
  onSelect: (commitId: string) => void;
}

export interface HistoryTimelineCommit {
  id: string;
  hash: string;
  author: string;
  authorLabel?: string;
  date: string;
}

export type HistorySortField = "date" | "author";

const historyCanvasWidth = 980;
const historyCanvasHeight = 980;
const selectedCommitColor = "#DBE3E5";
const selectedGraphColor = "#E8F4FF";

function formatHistoryDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function getHistoryTimelineCommits(
  workspaceData?: DemoVisualizerData | null,
): HistoryTimelineCommit[] {
  const historyData =
    workspaceData?.workspaceDetails.history ??
    demoVisualizerData.workspaceDetails.history;

  return historyData.commits.map((commit) => ({
    id: commit.hash,
    hash: commit.hash,
    author: commit.author,
    authorLabel: commit.authorLabel,
    date: commit.date,
  }));
}

export function getDefaultHistorySortState(
  workspaceData?: DemoVisualizerData | null,
) {
  const historyData =
    workspaceData?.workspaceDetails.history ??
    demoVisualizerData.workspaceDetails.history;
  const selectedSort = historyData.selectedSort ?? historyData.sortOptions[0] ?? "date";

  return {
    sortField: selectedSort === "author" ? "author" : "date",
    isAscending: selectedSort === "oldest",
  } satisfies {
    sortField: HistorySortField;
    isAscending: boolean;
  };
}

export function sortHistoryTimelineCommits(
  commits: HistoryTimelineCommit[],
  sortField: HistorySortField,
  isAscending: boolean,
) {
  const sortedCommits = [...commits];

  if (sortField === "author") {
    sortedCommits.sort((a, b) => a.author.localeCompare(b.author));
    return isAscending ? sortedCommits : sortedCommits.reverse();
  }

  sortedCommits.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return isAscending ? sortedCommits : sortedCommits.reverse();
}

export function getDefaultHistoryCommitId(
  workspaceData?: DemoVisualizerData | null,
) {
  return (
    workspaceData?.workspaceDetails.history.selectedCommitHash ??
    demoVisualizerData.workspaceDetails.history.selectedCommitHash ??
    null
  );
}

export function WorkspaceHistoryTimelineStrip({
  commits,
  activeCommitId,
  onSelect,
}: WorkspaceHistoryTimelineStripProps) {
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!activeCommitId) return;

    cardRefs.current[activeCommitId]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeCommitId]);

  return (
    <div className="border-b border-[#D9D9D9] bg-white">
      <div className="flex overflow-x-auto">
        {commits.map((commit) => {
          const isActive = commit.id === activeCommitId;

          return (
            <button
              key={commit.id}
              ref={(node) => {
                cardRefs.current[commit.id] = node;
              }}
              type="button"
              onClick={() => onSelect(commit.id)}
              className="flex h-[66px] min-w-[110px] shrink-0 flex-col justify-between border-r border-[#B7B7B7] px-2 py-1 text-left transition-colors duration-150"
              style={{
                backgroundColor: isActive ? selectedCommitColor : "#FFFFFF",
              }}
            >
              <div className="text-[11px] leading-none text-[#5F6B76]">
                {formatHistoryDate(commit.date)}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#111827]">
                <span className="relative inline-flex h-[8px] w-5 items-center">
                  <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-[#111827]" />
                  <span className="absolute left-[5px] top-1/2 h-[8px] w-[8px] -translate-y-1/2 rounded-full border border-[#111827] bg-white" />
                </span>
                {commit.hash.slice(0, 7)}
              </div>
              <div className="truncate text-[10px] text-[#7A7A7A]">
                {commit.authorLabel ?? commit.author}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function WorkspaceHistoryCanvas({
  commits,
  activeCommitId,
  zoom,
  searchQuery,
}: WorkspaceHistoryCanvasProps) {
  const [graphOffsets, setGraphOffsets] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const canvasViewportRef = useRef<HTMLDivElement | null>(null);
  const graphRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!activeCommitId) return;

    graphRefs.current[activeCommitId]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeCommitId]);

  return (
    <div className="h-full bg-[linear-gradient(to_right,rgba(4,8,14,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(4,8,14,0.06)_1px,transparent_1px)] bg-[size:24px_24px]">
      <div
        ref={canvasViewportRef}
        className="h-full w-full overflow-x-auto overflow-y-auto"
      >
        <div className="flex min-h-full min-w-full w-max items-start gap-8 p-6">
          {commits.map((commit) => (
            <div
              key={commit.id}
              ref={(node) => {
                graphRefs.current[commit.id] = node;
              }}
              data-commit-id={commit.id}
              className="relative h-[980px] w-[980px] shrink-0"
            >
              <PolicyGraphCanvas
                graphId={`history-${commit.id}`}
                zoom={zoom}
                viewportWidth={historyCanvasWidth}
                viewportHeight={historyCanvasHeight}
                searchQuery={searchQuery}
                offset={graphOffsets[commit.id] ?? { x: 0, y: 0 }}
                onOffsetChange={(nextOffset) => {
                  setGraphOffsets((currentOffsets) => ({
                    ...currentOffsets,
                    [commit.id]: nextOffset,
                  }));
                }}
                variant={{
                  repositoryLabel: commit.hash.slice(0, 7),
                  repositoryLabelColor:
                    commit.id === activeCommitId ? "#3B82F6" : "#7E7E7E",
                  boundaryFill:
                    commit.id === activeCommitId ? selectedGraphColor : "none",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
