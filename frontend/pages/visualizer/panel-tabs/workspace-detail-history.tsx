"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ascendingIcon from "@/assets/ascending.png";
import discendingIcon from "@/assets/discending.png";
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
  selectedCommitHash?: string | null;
  onSelectedCommitChange?: (commitHash: string) => void;
  searchQuery?: string;
}

type SortField = "date" | "author";

export function DetailPanelHistory({
  workspaceData,
  selectedCommitHash,
  onSelectedCommitChange,
  searchQuery = "",
}: DetailPanelHistoryProps) {
  const historyData =
    workspaceData?.workspaceDetails.history ??
    demoVisualizerData.workspaceDetails.history;
  const baseCommits = historyData.commits.map((commit, index) => ({ id: index, ...commit }));
  const sortOptions = Array.from(
    new Set(
      historyData.sortOptions.map((option) =>
        option === "author" ? "author" : "date",
      ),
    ),
  ) as SortField[];
  const initialSortSelection = historyData.selectedSort ?? historyData.sortOptions[0];
  const [selectedSort, setSelectedSort] = useState<SortField>(
    initialSortSelection === "author" ? "author" : "date",
  );
  const [isAscending, setIsAscending] = useState(initialSortSelection === "oldest");
  const commits = useMemo(() => {
    const sortedCommits = [...baseCommits];

    if (selectedSort === "author") {
      sortedCommits.sort((a, b) => a.author.localeCompare(b.author));
      return isAscending ? sortedCommits : sortedCommits.reverse();
    }

    sortedCommits.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return isAscending ? sortedCommits : sortedCommits.reverse();
  }, [baseCommits, isAscending, selectedSort]);
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

    const nextSelectedCommitId = commits.findIndex(
      (commit) => commit.hash === selectedCommitHash,
    );
    if (nextSelectedCommitId < 0 || nextSelectedCommitId === selectedCommitId) return;

    setSelectedCommitId(nextSelectedCommitId);
    setCurrentPage(Math.floor(nextSelectedCommitId / commitsPerPage) + 1);
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
          onChange={(value) => setSelectedSort(value as SortField)}
          className="w-[132px]"
        />
        <button
          type="button"
          onClick={() => setIsAscending((current) => !current)}
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
