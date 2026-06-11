"use client";

import { useMemo, useRef, useState } from "react";
import {
  compareTabId,
  historyTabId,
} from "@/screens/visualizer/visualizer.constants";
import type {
  GraphWorkspaceTab,
  WorkspacePanelId,
} from "@/screens/visualizer/visualizer.types";

interface UseVisualizerTabsOptions {
  activePanel: WorkspacePanelId;
  onReload: () => void;
  selectedBaseVersion: string;
  selectedCompareVersion: string;
  setActiveGraphTabId?: (tabId: string) => void;
  setActivePanel: (panelId: WorkspacePanelId) => void;
  setHasCompared: (value: boolean) => void;
}

export function useVisualizerTabs({
  activePanel,
  onReload,
  selectedBaseVersion,
  selectedCompareVersion,
  setActivePanel,
  setHasCompared,
}: UseVisualizerTabsOptions) {
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

  const nextGraphTabNumberRef = useRef(2);
  const nextGraphInstanceNumberRef = useRef(2);

  const activeGraphTab =
    graphTabs.find((tab) => tab.id === activeGraphTabId) ?? graphTabs[0];
  const isHistoryPanel = activeGraphTabId === historyTabId;
  const isComparePanel = activeGraphTabId === compareTabId;

  const handleHistoryPanelSelect = () => {
    // History owns a reserved tab ID so menu selection, bottom-bar selection,
    // and history-only canvas behavior all point at the same workspace surface.
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

  const compareTabLabel = useMemo(
    () =>
      `Compare ${selectedBaseVersion.split(" • ")[0]} vs ${selectedCompareVersion.split(" • ")[0]}`,
    [selectedBaseVersion, selectedCompareVersion],
  );

  const handleGenerateCompareGraph = () => {
    // Compare behaves like history: it gets a stable reserved tab instead of
    // replacing the active graph tab, which preserves user canvas context.
    setGraphTabs((currentTabs) => {
      const existingCompareTab = currentTabs.find((tab) => tab.id === compareTabId);
      if (existingCompareTab) {
        return currentTabs.map((tab) =>
          tab.id === compareTabId ? { ...tab, label: compareTabLabel } : tab,
        );
      }

      return [
        ...currentTabs,
        {
          id: compareTabId,
          label: compareTabLabel,
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

    // Returning to a normal graph tab resets the side panel to the default graph
    // controls if the user was previously in a reserved history/compare panel.
    if (activePanel === "history" || activePanel === "compare") {
      setActivePanel("graph-source");
    }
  };

  return {
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
    setActiveGraphTabId,
  };
}
