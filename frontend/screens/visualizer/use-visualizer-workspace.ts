"use client";

import { useDefaultLayout } from "react-resizable-panels";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PanelImperativeHandle } from "react-resizable-panels";
import { demoVisualizerData } from "@/lib/demo-visualizer-data";
import {
  getDefaultHistoryCommitId,
  getDefaultHistorySortState,
  getHistoryTimelineCommits,
  sortHistoryTimelineCommits,
} from "@/screens/visualizer/history-canvas";
import type { HistorySortField } from "@/screens/visualizer/history.types";
import {
  compareTabId,
  historyTabId,
  visualizerMenuItems,
} from "@/screens/visualizer/visualizer.constants";
import type {
  GraphWorkspaceTab,
  VisualizerWorkspaceProps,
  WorkspacePanelId,
} from "@/screens/visualizer/visualizer.types";

export function useVisualizerWorkspace({
  workspaceData,
  onReload,
}: Pick<VisualizerWorkspaceProps, "workspaceData" | "onReload">) {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "visualizer-workspace-layout",
  });
  const initialMenuWidth = defaultLayout?.["workspace-menu-panel"] ?? 18;
  const initialDetailWidth = defaultLayout?.["workspace-detail-panel"] ?? 25;

  const [activePanel, setActivePanel] = useState<WorkspacePanelId>("graph-source");
  const [isMenuCompact, setIsMenuCompact] = useState(initialMenuWidth <= 11);
  const [isDetailCollapsed, setIsDetailCollapsed] = useState(false);
  const [detailSearchQuery, setDetailSearchQuery] = useState("");
  const [graphZoom, setGraphZoom] = useState(0.75);
  const [graphSearchQuery, setGraphSearchQuery] = useState("");
  const [menuPanelWidth, setMenuPanelWidth] = useState(initialMenuWidth);
  const [detailPanelWidth, setDetailPanelWidth] = useState(initialDetailWidth);
  const [panelGroupWidth, setPanelGroupWidth] = useState(0);
  const [graphViewportSize, setGraphViewportSize] = useState({
    width: 0,
    height: 0,
  });
  const [graphTabs, setGraphTabs] = useState<GraphWorkspaceTab[]>([
    {
      id: "graph-tab-1",
      label: "Policy Graph",
      closable: true,
      editable: true,
      graphs: [{ id: "graph-instance-1", offset: { x: 0, y: 0 } }],
    },
  ]);
  const [activeGraphTabId, setActiveGraphTabId] = useState("graph-tab-1");
  const [selectedBaseVersion, setSelectedBaseVersion] = useState("");
  const [selectedCompareVersion, setSelectedCompareVersion] = useState("");
  const [hasCompared, setHasCompared] = useState(false);
  const [activeHistoryCommitId, setActiveHistoryCommitId] = useState<string | null>(
    null,
  );
  const [isHistoryStripCollapsed, setIsHistoryStripCollapsed] = useState(false);
  const [historySortField, setHistorySortField] = useState<HistorySortField>("date");
  const [isHistorySortAscending, setIsHistorySortAscending] = useState(false);

  const panelGroupRef = useRef<HTMLDivElement | null>(null);
  const graphViewportRef = useRef<HTMLDivElement | null>(null);
  const detailPanelRef = useRef<PanelImperativeHandle | null>(null);
  const nextGraphTabNumberRef = useRef(2);
  const nextGraphInstanceNumberRef = useRef(2);

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

  const activeLabel =
    visualizerMenuItems.find((item) => item.id === activePanel)?.label ??
    "Graph Source";
  const activePanelIcon =
    visualizerMenuItems.find((item) => item.id === activePanel)?.icon ??
    visualizerMenuItems[0].icon;
  const activeGraphTab =
    graphTabs.find((tab) => tab.id === activeGraphTabId) ?? graphTabs[0];
  const isHistoryPanel = activeGraphTabId === historyTabId;
  const isComparePanel = activeGraphTabId === compareTabId;
  const footerLeftWidthPx =
    panelGroupWidth > 0
      ? panelGroupWidth * ((menuPanelWidth + detailPanelWidth) / 100) + 2
      : 0;

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

  useEffect(() => {
    if (activePanel !== "history") return;

    setGraphTabs((currentTabs) => {
      if (currentTabs.some((tab) => tab.id === historyTabId)) {
        return currentTabs;
      }

      return [
        ...currentTabs,
        {
          id: historyTabId,
          label: "History",
          closable: false,
          editable: false,
          graphs: [],
        },
      ];
    });
    setActiveGraphTabId(historyTabId);
  }, [activePanel]);

  useEffect(() => {
    if (activeGraphTabId !== historyTabId || activePanel === "history") return;

    const fallbackTab = graphTabs.find((tab) => tab.id !== historyTabId);
    if (fallbackTab) {
      setActiveGraphTabId(fallbackTab.id);
    }
  }, [activeGraphTabId, activePanel, graphTabs]);

  useEffect(() => {
    if (activeGraphTabId !== compareTabId || activePanel === "compare") return;

    const compareTab = graphTabs.find((tab) => tab.id === compareTabId);
    if (compareTab) return;

    const fallbackTab = graphTabs.find((tab) => tab.id !== compareTabId);
    if (fallbackTab) {
      setActiveGraphTabId(fallbackTab.id);
    }
  }, [activeGraphTabId, activePanel, graphTabs]);

  useEffect(() => {
    const panelGroup = panelGroupRef.current;
    if (!panelGroup) return;

    const updatePanelGroupWidth = () => {
      setPanelGroupWidth(panelGroup.clientWidth);
    };

    updatePanelGroupWidth();

    const resizeObserver = new ResizeObserver(updatePanelGroupWidth);
    resizeObserver.observe(panelGroup);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const viewport = graphViewportRef.current;
    if (!viewport) return;

    const updateViewportSize = () => {
      setGraphViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    };

    updateViewportSize();

    const resizeObserver = new ResizeObserver(updateViewportSize);
    resizeObserver.observe(viewport);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const viewport = graphViewportRef.current;
    if (!viewport) return;

    const animationFrame = window.requestAnimationFrame(() => {
      viewport.scrollLeft = Math.max(
        0,
        (viewport.scrollWidth - viewport.clientWidth) / 2,
      );
      viewport.scrollTop = Math.max(
        0,
        (viewport.scrollHeight - viewport.clientHeight) / 2,
      );
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [graphViewportSize.height, graphViewportSize.width, graphZoom]);

  const handleDetailPanelToggle = () => {
    if (!detailPanelRef.current) return;

    if (isDetailCollapsed) {
      detailPanelRef.current.expand();
      setIsDetailCollapsed(false);
      return;
    }

    detailPanelRef.current.collapse();
    setIsDetailCollapsed(true);
  };

  const handleGenerateGraph = () => {
    setGraphTabs((currentTabs) =>
      currentTabs.map((tab) =>
        tab.id === activeGraphTabId
          ? {
              ...tab,
              graphs: [
                ...tab.graphs,
                {
                  id: `graph-instance-${nextGraphInstanceNumberRef.current++}`,
                  offset: { x: 0, y: 0 },
                },
              ],
            }
          : tab,
      ),
    );
    onReload();
  };

  const handleGenerateCompareGraph = () => {
    setGraphTabs((currentTabs) => {
      const label = `Compare ${selectedBaseVersion.split(" • ")[0]} vs ${selectedCompareVersion.split(" • ")[0]}`;
      const existingCompareTab = currentTabs.find((tab) => tab.id === compareTabId);
      if (existingCompareTab) {
        return currentTabs.map((tab) =>
          tab.id === compareTabId ? { ...tab, label } : tab,
        );
      }

      return [
        ...currentTabs,
        {
          id: compareTabId,
          label,
          closable: true,
          editable: false,
          graphs: [],
        },
      ];
    });
    setHasCompared(true);
    setActivePanel("compare");
    setActiveGraphTabId(compareTabId);
  };

  const handleAddGraphTab = () => {
    const nextTabId = `graph-tab-${nextGraphTabNumberRef.current}`;
    const nextTabLabel = `Canvas ${nextGraphTabNumberRef.current}`;

    nextGraphTabNumberRef.current += 1;

    setGraphTabs((currentTabs) => [
      ...currentTabs,
      {
        id: nextTabId,
        label: nextTabLabel,
        graphs: [],
      },
    ]);
    setActiveGraphTabId(nextTabId);
  };

  const handleDeleteGraphTab = (tabId: string) => {
    if (graphTabs.length <= 1) return;

    const tabIndex = graphTabs.findIndex((tab) => tab.id === tabId);
    const nextTabs = graphTabs.filter((tab) => tab.id !== tabId);

    setGraphTabs(nextTabs);

    if (tabId === activeGraphTabId) {
      const fallbackTab = nextTabs[Math.max(0, tabIndex - 1)] ?? nextTabs[0];
      setActiveGraphTabId(fallbackTab.id);
    }
  };

  const handleTabRename = (tabId: string, nextLabel: string) => {
    setGraphTabs((currentTabs) =>
      currentTabs.map((tab) =>
        tab.id === tabId ? { ...tab, label: nextLabel } : tab,
      ),
    );
  };

  const handleGraphOffsetChange = (
    graphId: string,
    nextOffset: { x: number; y: number },
  ) => {
    setGraphTabs((currentTabs) =>
      currentTabs.map((tab) =>
        tab.id === activeGraphTabId
          ? {
              ...tab,
              graphs: tab.graphs.map((graph) =>
                graph.id === graphId ? { ...graph, offset: nextOffset } : graph,
              ),
            }
          : tab,
      ),
    );
  };

  const handleDeleteGraphInstance = (graphId: string) => {
    setGraphTabs((currentTabs) =>
      currentTabs.map((tab) =>
        tab.id === activeGraphTabId
          ? {
              ...tab,
              graphs: tab.graphs.filter((graph) => graph.id !== graphId),
            }
          : tab,
      ),
    );
  };

  const handleMenuItemSelect = (panelId: WorkspacePanelId) => {
    setActivePanel(panelId);
    if (panelId === "history") {
      setActiveGraphTabId(historyTabId);
    }
  };

  const handleBottomTabSelect = (tabId: string) => {
    if (tabId === historyTabId) {
      setActivePanel("history");
      setActiveGraphTabId(historyTabId);
      return;
    }

    if (tabId === compareTabId) {
      setActivePanel("compare");
      setActiveGraphTabId(compareTabId);
      return;
    }

    setActiveGraphTabId(tabId);

    if (activePanel === "history" || activePanel === "compare") {
      setActivePanel("graph-source");
    }
  };

  return {
    activeGraphTab,
    activeGraphTabId,
    activeHistoryCommitId,
    activeLabel,
    activePanel,
    activePanelIcon,
    baseCompareGraph,
    compareGraph,
    defaultLayout,
    detailHistoryCommits,
    detailPanelRef,
    detailPanelWidth,
    detailSearchQuery,
    footerLeftWidthPx,
    graphSearchQuery,
    graphTabs,
    graphViewportRef,
    graphViewportSize,
    graphZoom,
    handleAddGraphTab,
    handleBottomTabSelect,
    handleDeleteGraphInstance,
    handleDeleteGraphTab,
    handleDetailPanelToggle,
    handleGenerateCompareGraph,
    handleGenerateGraph,
    handleGraphOffsetChange,
    handleMenuItemSelect,
    handleTabRename,
    hasCompared,
    historyCommits,
    historySortField,
    isComparePanel,
    isDetailCollapsed,
    isHistoryPanel,
    isHistorySortAscending,
    isHistoryStripCollapsed,
    isMenuCompact,
    menuPanelWidth,
    onLayoutChanged,
    panelGroupRef,
    selectedBaseVersion,
    selectedCompareVersion,
    setActiveHistoryCommitId,
    setDetailPanelWidth,
    setDetailSearchQuery,
    setGraphSearchQuery,
    setGraphZoom,
    setHistorySortField,
    setIsDetailCollapsed,
    setIsHistorySortAscending,
    setIsHistoryStripCollapsed,
    setIsMenuCompact,
    setMenuPanelWidth,
    setSelectedBaseVersion,
    setSelectedCompareVersion,
    setHasCompared,
    visualizerMenuItems,
  };
}
