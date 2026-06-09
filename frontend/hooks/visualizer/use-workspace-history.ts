"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface HistoryCommit {
  id: number;
  hash: string;
}

export function useWorkspaceHistory(
  commits: HistoryCommit[],
  selectedCommitHash?: string,
) {
  const commitListRef = useRef<HTMLDivElement | null>(null);
  const [commitsPerPage, setCommitsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [touchedCommitId, setTouchedCommitId] = useState<number | null>(null);
  const [selectedCommitId, setSelectedCommitId] = useState(
    Math.max(0, commits.findIndex((commit) => commit.hash === selectedCommitHash)),
  );

  useEffect(() => {
    const commitList = commitListRef.current;
    if (!commitList) return;

    const updateCommitsPerPage = () => {
      setCommitsPerPage(Math.max(1, Math.floor(commitList.clientHeight / 56)));
    };

    updateCommitsPerPage();

    const resizeObserver = new ResizeObserver(updateCommitsPerPage);
    resizeObserver.observe(commitList);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const totalPages = Math.ceil(commits.length / commitsPerPage);
  const effectiveCurrentPage = Math.min(currentPage, totalPages);
  const visibleCommits = useMemo(
    () =>
      commits.slice(
        (effectiveCurrentPage - 1) * commitsPerPage,
        effectiveCurrentPage * commitsPerPage,
      ),
    [commits, commitsPerPage, effectiveCurrentPage],
  );

  return {
    commitListRef,
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
