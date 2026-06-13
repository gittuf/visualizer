"use client";

import { useState } from "react";
import { visualizerMenuItems } from "@/screens/visualizer/visualizer.constants";
import type {
  VisualizerWorkspaceProps,
  WorkspacePanelId,
} from "@/screens/visualizer/visualizer.types";
import { useGraphViewport } from "@/screens/visualizer/use-graph-viewport";
import { useVisualizerHistoryCompare } from "@/screens/visualizer/use-visualizer-history-compare";
import { useVisualizerLayout } from "@/screens/visualizer/use-visualizer-layout";
import { useVisualizerTabs } from "@/screens/visualizer/use-visualizer-tabs";

export function useVisualizerWorkspace({
  workspaceData,
  onReload,
}: Pick<VisualizerWorkspaceProps, "workspaceData" | "onReload">) {
  const [activePanel, setActivePanel] = useState<WorkspacePanelId>("graph-source");
  const [detailSearchQuery, setDetailSearchQuery] = useState("");
  const [graphZoom, setGraphZoom] = useState(0.75);
  const [graphSearchQuery, setGraphSearchQuery] = useState("");
  const {
    defaultLayout,
    detailPanelRef,
    detailPanelWidth,
    footerLeftWidthPx,
    handleDetailPanelToggle,
    isDetailCollapsed,
    isMenuCollapsed,
    isMenuCompact,
    menuPanelRef,
    menuPanelWidth,
    onLayoutChanged,
    panelGroupRef,
    setDetailPanelWidth,
    setIsDetailCollapsed,
    setIsMenuCollapsed,
    setMenuPanelWidth,
  } = useVisualizerLayout();
  const {
    activeHistoryCommitId,
    baseCompareGraph,
    comparisonResult,
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
  } = useVisualizerHistoryCompare(workspaceData);
  const { graphViewportRef, graphViewportSize } = useGraphViewport(graphZoom);
  const {
    activeGraphTab,
    activeGraphTabId,
    graphTabs,
    handleAddGraphTab,
    handleBottomTabSelect,
    handleDeleteGraphInstance,
    handleDeleteGraphTab,
    handleGenerateCompareGraph,
    handleGenerateGraph,
    handleGraphOffsetChange,
    handleHistoryPanelSelect,
    handleTabRename,
    isComparePanel,
    isHistoryPanel,
  } = useVisualizerTabs({
    activePanel,
    onReload,
    selectedBaseVersion,
    selectedCompareVersion,
    setActivePanel,
    setHasCompared,
  });

  const activeLabel =
    visualizerMenuItems.find((item) => item.id === activePanel)?.label ??
    "Graph Source";
  const activePanelIcon =
    visualizerMenuItems.find((item) => item.id === activePanel)?.icon ??
    visualizerMenuItems[0].icon;

  const handleMenuItemSelect = (panelId: WorkspacePanelId) => {
    setActivePanel(panelId);
    if (panelId === "history") {
      handleHistoryPanelSelect();
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
    comparisonResult,
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
    isMenuCollapsed,
    isMenuCompact,
    menuPanelWidth,
    menuPanelRef,
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
    setIsMenuCollapsed,
    setMenuPanelWidth,
    setSelectedBaseVersion,
    setSelectedCompareVersion,
    setHasCompared,
    visualizerMenuItems,
  };
}
