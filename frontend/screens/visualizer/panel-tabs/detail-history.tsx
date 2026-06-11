"use client";

import { useEffect } from "react";
import Image from "next/image";
import ascendingIcon from "@/assets/ascending.png";
import discendingIcon from "@/assets/discending.png";
import { demoVisualizerData } from "@/lib/demo-visualizer-fixture";
import type { DemoVisualizerData } from "@/lib/demo-visualizer.types";
import { useWorkspaceHistory } from "@/hooks/visualizer/use-workspace-history";
import {
  CommitHistoryItem,
  detailColors,
  SelectField,
} from "@/components/visualizer/detail/workspace-detail-primitives";
import type {
  HistorySortField,
} from "@/screens/visualizer/history.types";

interface DetailHistoryCommit {
  id: number;
  hash: string;
  message: string;
  author: string;
  authorLabel?: string;
  date: string;
}

interface DetailPanelHistoryProps {
  workspaceData?: DemoVisualizerData | null;
  commits: DetailHistoryCommit[];
  selectedCommitHash?: string | null;
  onSelectedCommitChange?: (commitHash: string) => void;
  searchQuery?: string;
  selectedSort: HistorySortField;
  isAscending: boolean;
  onSortChange: (sortField: HistorySortField) => void;
  onSortDirectionToggle: () => void;
}

export function DetailPanelHistory({
  workspaceData,
  commits,
  selectedCommitHash,
  onSelectedCommitChange,
  searchQuery = "",
  selectedSort,
  isAscending,
  onSortChange,
  onSortDirectionToggle,
}: DetailPanelHistoryProps) {
  const historyData =
    workspaceData?.workspaceDetails.history ??
    demoVisualizerData.workspaceDetails.history;
  const sortOptions = Array.from(
    new Set(
      historyData.sortOptions.map((option) =>
        option === "author" ? "author" : "date",
      ),
    ),
  ) as HistorySortField[];
  const {
    commitListRef,
    commitsPerPage,
    currentPage,
    selectedCommitId,
    setCurrentPage,
    setSelectedCommitId,
    setTouchedCommitId,
    totalPages,
    touchedCommitId,
    visibleCommits,
  } = useWorkspaceHistory(commits, selectedCommitHash ?? historyData?.selectedCommitHash);

  useEffect(() => {
    if (!selectedCommitHash) return;

    const nextSelectedCommit = commits.find(
      (commit) => commit.hash === selectedCommitHash,
    );
    if (!nextSelectedCommit || nextSelectedCommit.id === selectedCommitId) return;

    const nextSelectedCommitIndex = commits.findIndex(
      (commit) => commit.id === nextSelectedCommit.id,
    );
    setSelectedCommitId(nextSelectedCommit.id);
    setCurrentPage(Math.floor(nextSelectedCommitIndex / commitsPerPage) + 1);
  }, [
    commits,
    commitsPerPage,
    selectedCommitHash,
    selectedCommitId,
    setCurrentPage,
    setSelectedCommitId,
  ]);

  return (
    <div className="flex h-full flex-col px-1 pb-4">
      <div className="flex items-center justify-end gap-2 px-4 pb-3 pt-2">
        <SelectField
          options={sortOptions.map((option) => ({
            label: `Sort by: ${option}`,
            value: option,
          }))}
          selectedLabel={selectedSort}
          displayLabel={`Sort by: ${selectedSort}`}
          onChange={(value) => onSortChange(value as HistorySortField)}
          className="w-33"
        />
        <button
          type="button"
          onClick={onSortDirectionToggle}
          aria-label={`Sort ${isAscending ? "ascending" : "descending"}. Click to switch to ${
            isAscending ? "descending" : "ascending"
          } order.`}
          title={isAscending ? "Ascending order" : "Descending order"}
          className="flex h-9 w-6 items-center justify-center"
        >
          <Image
            src={isAscending ? ascendingIcon : discendingIcon}
            alt=""
            className="h-4 w-4"
          />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div ref={commitListRef} className="min-h-0 flex-1 overflow-hidden">
          {visibleCommits.map((commit) => (
            <CommitHistoryItem
              key={commit.id}
              commitId={commit.id}
              message={commit.message}
              author={commit.authorLabel ?? `opened by ${commit.author}`}
              searchQuery={searchQuery}
              isSelected={selectedCommitId === commit.id}
              isTouched={touchedCommitId === commit.id}
              onSelect={(commitId) => {
                setSelectedCommitId(commitId);
                const selectedCommit = commits.find(
                  (historyCommit) => historyCommit.id === commitId,
                );
                if (!selectedCommit || !onSelectedCommitChange) return;
                if (selectedCommit.hash === selectedCommitHash) return;

                onSelectedCommitChange(selectedCommit.hash);
              }}
              onTouch={setTouchedCommitId}
            />
          ))}
        </div>
        {totalPages > 1 ? (
          <div className="mt-auto flex items-center justify-center gap-10 px-4 pt-6">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-sm border border-(--secondary-color) px-3 py-1 text-[12px] text-black"
            >
              &lt; Previous
            </button>
            <div className="flex items-center gap-3 text-[12px]">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                const isActive = currentPage === pageNumber;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`rounded-sm px-2 py-1 ${
                      isActive ? "text-black" : "text-(--dark-gray)"
                    }`}
                    style={isActive ? { backgroundColor: detailColors.bullet } : undefined}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="rounded-sm border border-(--secondary-color) px-3 py-1 text-[12px] text-black"
            >
              Next &gt;
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
