"use client";

import { useMemo, useState } from "react";
import { demoVisualizerData } from "@/lib/demo-visualizer-fixture";
import type { PolicyGraphCanvasVariant } from "@/screens/visualizer/policy-graph.types";
import {
  getDefaultHistoryCommitId,
  getDefaultHistorySortState,
  getHistoryTimelineCommits,
  sortHistoryTimelineCommits,
} from "@/screens/visualizer/history-canvas";
import { buildComparisonResult } from "@/screens/visualizer/compare.utils";
import type { HistorySortField } from "@/screens/visualizer/history.types";
import type { DemoVisualizerData } from "@/lib/demo-visualizer.types";

export function useVisualizerHistoryCompare(
  workspaceData?: DemoVisualizerData | null,
) {
  const [isHistoryStripCollapsed, setIsHistoryStripCollapsed] = useState(false);

  const compareData =
    workspaceData?.workspaceDetails.compare ??
    demoVisualizerData.workspaceDetails.compare;
  const compareSelectionDefaults = useMemo(
    () => ({
      selectedBaseVersion:
        compareData.selectedBaseVersion ?? compareData.baseVersionOptions[0],
      selectedCompareVersion:
        compareData.selectedCompareVersion ?? compareData.compareVersionOptions[0],
      hasCompared: false,
    }),
    [compareData],
  );
  const compareSelectionKey = useMemo(
    () =>
      [
        compareSelectionDefaults.selectedBaseVersion,
        compareSelectionDefaults.selectedCompareVersion,
        compareData.baseVersionOptions.join("|"),
        compareData.compareVersionOptions.join("|"),
      ].join("::"),
    [compareData, compareSelectionDefaults],
  );
  const [compareSelectionState, setCompareSelectionState] = useState(() => ({
    key: compareSelectionKey,
    ...compareSelectionDefaults,
  }));
  const compareSelection =
    compareSelectionState.key === compareSelectionKey
      ? compareSelectionState
      : { key: compareSelectionKey, ...compareSelectionDefaults };

  const baseHistoryCommits = useMemo(
    () => getHistoryTimelineCommits(workspaceData),
    [workspaceData],
  );
  const defaultHistorySortState = useMemo(
    () => getDefaultHistorySortState(workspaceData),
    [workspaceData],
  );
  const historySortKey = useMemo(
    () =>
      [
        defaultHistorySortState.sortField,
        String(defaultHistorySortState.isAscending),
        baseHistoryCommits.map((commit) => commit.hash).join("|"),
      ].join("::"),
    [baseHistoryCommits, defaultHistorySortState],
  );
  const [historySortState, setHistorySortState] = useState(() => ({
    key: historySortKey,
    ...defaultHistorySortState,
  }));
  const resolvedHistorySortState =
    historySortState.key === historySortKey
      ? historySortState
      : { key: historySortKey, ...defaultHistorySortState };
  const historySortField = resolvedHistorySortState.sortField;
  const isHistorySortAscending = resolvedHistorySortState.isAscending;
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
  const historySelectionKey = useMemo(
    () =>
      [
        defaultHistoryCommitId ?? "",
        historyCommits.map((commit) => commit.id).join("|"),
      ].join("::"),
    [defaultHistoryCommitId, historyCommits],
  );
  const [historySelectionState, setHistorySelectionState] = useState<{
    key: string
    value: string | null
  } | null>(null);
  const activeHistoryCommitId =
    historySelectionState?.key === historySelectionKey
      ? historySelectionState.value
      : defaultHistoryCommitId;

  const selectedBaseVersion = compareSelection.selectedBaseVersion;
  const selectedCompareVersion = compareSelection.selectedCompareVersion;
  const hasCompared = compareSelection.hasCompared;
  const baseCompareGraph = useMemo(() => {
    const baseGraph = compareData.graphsByVersion[selectedBaseVersion];
    return {
      repositoryLabel:
        baseGraph?.repositoryLabel ?? selectedBaseVersion.split(" • ")[0],
      branchLabel: baseGraph?.branchLabel ?? "Branch: main",
      lanes: baseGraph?.lanes,
    };
  }, [compareData.graphsByVersion, selectedBaseVersion]);
  const comparisonResult = useMemo(
    () =>
      buildComparisonResult(
        compareData.graphsByVersion[selectedBaseVersion],
        compareData.graphsByVersion[selectedCompareVersion],
        selectedCompareVersion,
      ),
    [compareData.graphsByVersion, selectedBaseVersion, selectedCompareVersion],
  );
  const compareGraph = useMemo(() => {
    return {
      repositoryLabel: comparisonResult.compareGraph.repositoryLabel,
      branchLabel: comparisonResult.compareGraph.branchLabel,
      lanes: comparisonResult.compareGraph.lanes,
      showCompareLegend: comparisonResult.compareGraph.showLegend ?? true,
    };
  }, [comparisonResult]);
  const graphVariantsByCommit = useMemo(() => {
    const historyData =
      workspaceData?.workspaceDetails.history ??
      demoVisualizerData.workspaceDetails.history;

    return Object.fromEntries(
      historyData.commits.map((commit) => {
        const versionLabel = compareData.baseVersionOptions.find((option) =>
          option.startsWith(commit.hash.slice(0, 7)),
        )
        const graph = versionLabel
          ? compareData.graphsByVersion[versionLabel]
          : undefined

        return [
          commit.hash,
          graph
            ? ({
                repositoryLabel: commit.hash.slice(0, 7),
                branchLabel: graph.branchLabel,
                lanes: graph.lanes,
                principalNames: graph.lanes.flatMap((lane) =>
                  (lane.principals ?? []).map((principal) => principal.name),
                ),
              } satisfies PolicyGraphCanvasVariant)
            : undefined,
        ]
      }),
    )
  }, [compareData.baseVersionOptions, compareData.graphsByVersion, workspaceData]);

  const setActiveHistoryCommitId = (
    value: string | null | ((current: string | null) => string | null),
  ) => {
    const nextValue =
      typeof value === "function" ? value(activeHistoryCommitId) : value;
    setHistorySelectionState({ key: historySelectionKey, value: nextValue });
  };

  const setHistorySortField = (
    value: HistorySortField | ((current: HistorySortField) => HistorySortField),
  ) => {
    const nextValue =
      typeof value === "function" ? value(historySortField) : value;
    setHistorySortState((current) => ({
      key: historySortKey,
      sortField: nextValue,
      isAscending:
        current.key === historySortKey
          ? current.isAscending
          : defaultHistorySortState.isAscending,
    }));
  };

  const setIsHistorySortAscending = (
    value: boolean | ((current: boolean) => boolean),
  ) => {
    const nextValue =
      typeof value === "function"
        ? value(isHistorySortAscending)
        : value;
    setHistorySortState((current) => ({
      key: historySortKey,
      sortField:
        current.key === historySortKey
          ? current.sortField
          : defaultHistorySortState.sortField,
      isAscending: nextValue,
    }));
  };

  const setCompareSelection = (
    updater: (current: typeof compareSelection) => typeof compareSelection,
  ) => {
    setCompareSelectionState(updater(compareSelection));
  };

  const setSelectedBaseVersion = (
    value: string | ((current: string) => string),
  ) => {
    const nextValue =
      typeof value === "function" ? value(selectedBaseVersion) : value;
    setCompareSelection((current) => ({
      ...current,
      key: compareSelectionKey,
      selectedBaseVersion: nextValue,
    }));
  };

  const setSelectedCompareVersion = (
    value: string | ((current: string) => string),
  ) => {
    const nextValue =
      typeof value === "function" ? value(selectedCompareVersion) : value;
    setCompareSelection((current) => ({
      ...current,
      key: compareSelectionKey,
      selectedCompareVersion: nextValue,
    }));
  };

  const setHasCompared = (
    value: boolean | ((current: boolean) => boolean),
  ) => {
    const nextValue = typeof value === "function" ? value(hasCompared) : value;
    setCompareSelection((current) => ({
      ...current,
      key: compareSelectionKey,
      hasCompared: nextValue,
    }));
  };

  return {
    activeHistoryCommitId,
    baseCompareGraph,
    comparisonResult,
    compareGraph,
    detailHistoryCommits,
    graphVariantsByCommit,
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
