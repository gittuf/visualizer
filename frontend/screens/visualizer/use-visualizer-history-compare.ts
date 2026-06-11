"use client";

import { useEffect, useMemo, useState } from "react";
import { demoVisualizerData } from "@/lib/demo-visualizer-fixture";
import {
  getDefaultHistoryCommitId,
  getDefaultHistorySortState,
  getHistoryTimelineCommits,
  sortHistoryTimelineCommits,
} from "@/screens/visualizer/history-canvas";
import type { HistorySortField } from "@/screens/visualizer/history.types";
import type { DemoVisualizerData } from "@/lib/demo-visualizer.types";

export function useVisualizerHistoryCompare(
  workspaceData?: DemoVisualizerData | null,
) {
  const [selectedBaseVersion, setSelectedBaseVersion] = useState("");
  const [selectedCompareVersion, setSelectedCompareVersion] = useState("");
  const [hasCompared, setHasCompared] = useState(false);
  const [activeHistoryCommitId, setActiveHistoryCommitId] = useState<string | null>(
    null,
  );
  const [isHistoryStripCollapsed, setIsHistoryStripCollapsed] = useState(false);
  const [historySortField, setHistorySortField] = useState<HistorySortField>("date");
  const [isHistorySortAscending, setIsHistorySortAscending] = useState(false);

  const compareData =
    workspaceData?.workspaceDetails.compare ??
    demoVisualizerData.workspaceDetails.compare;

  const baseHistoryCommits = useMemo(
    () => getHistoryTimelineCommits(workspaceData),
    [workspaceData],
  );
  const defaultHistorySortState = useMemo(
    () => getDefaultHistorySortState(workspaceData),
    [workspaceData],
  );
  const historyCommits = useMemo(
    () =>
      sortHistoryTimelineCommits(
        baseHistoryCommits,
        historySortField,
        isHistorySortAscending,
      ),
    [baseHistoryCommits, historySortField, isHistorySortAscending],
  );
  const detailHistoryCommits = useMemo(
    () =>
      historyCommits.map((commit) => {
        const historyData =
          workspaceData?.workspaceDetails.history ??
          demoVisualizerData.workspaceDetails.history;
        const sourceCommit = historyData.commits.find(
          (historyCommit) => historyCommit.hash === commit.hash,
        );

        return {
          id: sourceCommit
            ? historyData.commits.findIndex(
                (historyCommit) => historyCommit.hash === commit.hash,
              )
            : -1,
          hash: commit.hash,
          message: sourceCommit?.message ?? "",
          author: commit.author,
          authorLabel: commit.authorLabel,
          date: commit.date,
        };
      }),
    [historyCommits, workspaceData],
  );
  const defaultHistoryCommitId = useMemo(
    () => getDefaultHistoryCommitId(workspaceData) ?? historyCommits[0]?.id ?? null,
    [historyCommits, workspaceData],
  );

  const comparePairKey = `${selectedBaseVersion}|${selectedCompareVersion}`;
  const activeComparison = useMemo(
    () => compareData.comparisonsByPair?.[comparePairKey],
    [compareData, comparePairKey],
  );
  const baseCompareGraph = useMemo(() => {
    const baseGraph = compareData.graphsByVersion[selectedBaseVersion];
    return {
      repositoryLabel:
        baseGraph?.repositoryLabel ?? selectedBaseVersion.split(" • ")[0],
      branchLabel: baseGraph?.branchLabel ?? "Branch: main",
      lanes: baseGraph?.lanes,
    };
  }, [compareData.graphsByVersion, selectedBaseVersion]);
  const compareGraph = useMemo(() => {
    if (activeComparison?.compareGraph) {
      return {
        repositoryLabel:
          activeComparison.compareGraph.repositoryLabel ??
          selectedCompareVersion.split(" • ")[0],
        branchLabel: activeComparison.compareGraph.branchLabel ?? "Branch: main",
        lanes: activeComparison.compareGraph.lanes,
        showCompareLegend: activeComparison.compareGraph.showLegend ?? true,
      };
    }

    const fallbackGraph = compareData.graphsByVersion[selectedCompareVersion];
    return {
      repositoryLabel:
        fallbackGraph?.repositoryLabel ?? selectedCompareVersion.split(" • ")[0],
      branchLabel: fallbackGraph?.branchLabel ?? "Branch: main",
      lanes: fallbackGraph?.lanes,
      showCompareLegend: true,
    };
  }, [activeComparison, compareData.graphsByVersion, selectedCompareVersion]);

  useEffect(() => {
    setActiveHistoryCommitId(defaultHistoryCommitId);
  }, [defaultHistoryCommitId]);

  useEffect(() => {
    setHistorySortField(defaultHistorySortState.sortField);
    setIsHistorySortAscending(defaultHistorySortState.isAscending);
  }, [defaultHistorySortState]);

  useEffect(() => {
    setSelectedBaseVersion(
      compareData.selectedBaseVersion ?? compareData.baseVersionOptions[0],
    );
    setSelectedCompareVersion(
      compareData.selectedCompareVersion ?? compareData.compareVersionOptions[0],
    );
    setHasCompared(false);
  }, [compareData]);

  return {
    activeHistoryCommitId,
    baseCompareGraph,
    compareGraph,
    detailHistoryCommits,
    hasCompared,
    historyCommits,
    historySortField,
    isHistorySortAscending,
    isHistoryStripCollapsed,
    selectedBaseVersion,
    selectedCompareVersion,
    setActiveHistoryCommitId,
    setHasCompared,
    setHistorySortField,
    setIsHistorySortAscending,
    setIsHistoryStripCollapsed,
    setSelectedBaseVersion,
    setSelectedCompareVersion,
  };
}
