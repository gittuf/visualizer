"use client";

import { useMemo, useState } from "react";
import {
  demoVisualizerData,
  type DemoVisualizerData,
} from "@/lib/demo-visualizer-data";
import { useWorkspaceHistory } from "@/hooks/visualizer/use-workspace-history";
import {
  CommitHistoryItem,
  detailColors,
  SelectField,
} from "@/components/visualizer/detail/workspace-detail-primitives";

interface DetailPanelHistoryProps {
  workspaceData?: DemoVisualizerData | null;
}

export function DetailPanelHistory({ workspaceData }: DetailPanelHistoryProps) {
  const historyData =
    workspaceData?.workspaceDetails.history ??
    demoVisualizerData.workspaceDetails.history;
  const baseCommits = historyData.commits.map((commit, index) => ({ id: index, ...commit }));
  const sortOptions = historyData.sortOptions;
  const [selectedSort, setSelectedSort] = useState(
    historyData.selectedSort ?? sortOptions[0],
  );
  const commits = useMemo(() => {
    const sortedCommits = [...baseCommits];

    if (selectedSort === "author") {
      sortedCommits.sort((a, b) => a.author.localeCompare(b.author));
      return sortedCommits;
    }

    sortedCommits.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return selectedSort === "oldest" ? sortedCommits : sortedCommits.reverse();
  }, [baseCommits, selectedSort]);
  const {
    commitListRef,
    currentPage,
    selectedCommitId,
    setCurrentPage,
    setSelectedCommitId,
    setTouchedCommitId,
    totalPages,
    touchedCommitId,
    visibleCommits,
  } = useWorkspaceHistory(commits, historyData?.selectedCommitHash);
  

  return (
    <div className="flex h-full flex-col px-1 pb-4">
      <div className="flex items-center justify-end px-4 pb-3 pt-2">
        <SelectField
          options={sortOptions.map((option) => ({
            label: `Sort by: ${option}`,
            value: option,
          }))}
          selectedLabel={selectedSort}
          displayLabel={`Sort by: ${selectedSort}`}
          onChange={setSelectedSort}
          className="w-[132px]"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div ref={commitListRef} className="min-h-0 flex-1 overflow-hidden">
          {visibleCommits.map((commit) => (
            <CommitHistoryItem
              key={commit.id}
              commitId={commit.id}
              message={commit.message}
              author={commit.authorLabel ?? `opened by ${commit.author}`}
              isSelected={selectedCommitId === commit.id}
              isTouched={touchedCommitId === commit.id}
              onSelect={setSelectedCommitId}
              onTouch={setTouchedCommitId}
            />
          ))}
        </div>
        {totalPages > 1 ? (
          <div className="mt-auto flex items-center justify-center gap-10 px-4 pt-6">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-[4px] border border-[#8B949E] px-3 py-1 text-[12px] text-black"
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
                    className={`rounded-[4px] px-2 py-1 ${
                      isActive ? "text-black" : "text-[#7E7E7E]"
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
              className="rounded-[4px] border border-[#8B949E] px-3 py-1 text-[12px] text-black"
            >
              Next &gt;
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
