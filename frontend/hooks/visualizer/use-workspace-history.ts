"use client";

import { useMemo, useRef, useState } from "react";

interface HistoryCommit {
  id: number;
  hash: string;
}

const commitsPerPage = 10;

export function useWorkspaceHistory<TCommit extends HistoryCommit>(
  commits: TCommit[],
  selectedCommitHash?: string,
) {
  const commitListRef = useRef<HTMLDivElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [touchedCommitId, setTouchedCommitId] = useState<number | null>(null);
  const [selectedCommitId, setSelectedCommitId] = useState(
    Math.max(0, commits.findIndex((commit) => commit.hash === selectedCommitHash)),
  );

  const totalPages = Math.ceil(commits.length / commitsPerPage);
  const effectiveCurrentPage = Math.min(currentPage, totalPages);
  const visibleCommits = useMemo(
    () =>
      commits.slice(
        (effectiveCurrentPage - 1) * commitsPerPage,
        effectiveCurrentPage * commitsPerPage,
      ),
    [commits, effectiveCurrentPage],
  );

  return {
    commitListRef,
    commitsPerPage,
    currentPage: effectiveCurrentPage,
    setCurrentPage,
    totalPages,
    visibleCommits,
    selectedCommitId,
    setSelectedCommitId,
    touchedCommitId,
    setTouchedCommitId,
  };
}
