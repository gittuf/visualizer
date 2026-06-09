"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useDefaultLayout } from "react-resizable-panels";
import compareIcon from "@/assets/compare.png";
import addIcon from "@/assets/add.png";
import graphSourceIcon from "@/assets/graph-source.png";
import historyIcon from "@/assets/history.png";
import leftArrowIcon from "@/assets/left.png";
import metadataIcon from "@/assets/metadata.png";
import policyQueryIcon from "@/assets/policy-query.png";
import rightArrowIcon from "@/assets/right.png";
import searchIcon from "@/assets/search.png";
import settingsIcon from "@/assets/Settings.png";
import zoomInIcon from "@/assets/zoom-in.png";
import zoomOutIcon from "@/assets/zoom-out.png";
import type { PanelImperativeHandle } from "react-resizable-panels";
import { PolicyGraphCanvas } from "@/page-components/visualizer/policy-graph-canvas";
import { WorkspaceDetailContent } from "@/page-components/visualizer/workspace-detail-content";
import { WorkspaceActionButton } from "@/components/visualizer/workspace-action-button";
import { WorkspaceBottomBar } from "@/components/visualizer/workspace-bottom-bar";
import { WorkspaceDetailToggle } from "@/components/visualizer/workspace-detail-toggle";
import { WorkspaceMenuItem } from "@/components/visualizer/workspace-menu-item";
import { WorkspacePanelHeader } from "@/components/visualizer/workspace-panel-header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RepositoryInfo } from "@/lib/repository-handler";
import type { DemoVisualizerData } from "@/lib/demo-visualizer-data";
import type { WorkspacePanelId } from "@/page-components/visualizer/visualizer-workspace-types";

interface VisualizerWorkspaceProps {
  repository: RepositoryInfo;
  workspaceData?: DemoVisualizerData | null;
  isLoading: boolean;
  onReload: () => void;
  onDisconnect: () => void;
}

interface GraphWorkspaceTab {
  id: string;
  label: string;
  graphs: Array<{
    id: string;
    offset: {
      x: number;
      y: number;
    };
  }>;
}

const menuItems: Array<{
  id: WorkspacePanelId;
  label: string;
  icon: typeof graphSourceIcon;
}> = [
  { id: "graph-source", label: "Graph Source", icon: graphSourceIcon },
  { id: "policy-query", label: "Policy Query", icon: policyQueryIcon },
  { id: "history", label: "History", icon: historyIcon },
  { id: "compare", label: "Compare", icon: compareIcon },
  { id: "metadata", label: "MetaData", icon: metadataIcon },
  { id: "settings", label: "Settings", icon: settingsIcon },
];

export default function VisualizerWorkspace({
  repository,
  workspaceData,
  isLoading,
  onReload,
  onDisconnect,
}: VisualizerWorkspaceProps) {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "visualizer-workspace-layout",
  });
  const initialMenuWidth = defaultLayout?.["workspace-menu-panel"] ?? 18;
  const initialDetailWidth = defaultLayout?.["workspace-detail-panel"] ?? 25;
  const [activePanel, setActivePanel] =
    useState<WorkspacePanelId>("graph-source");
  const [isMenuCompact, setIsMenuCompact] = useState(initialMenuWidth <= 11);
  const [isDetailCollapsed, setIsDetailCollapsed] = useState(false);
  const [graphZoom, setGraphZoom] = useState(0.75);
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
      graphs: [
        {
          id: "graph-instance-1",
          offset: { x: 0, y: 0 },
        },
      ],
    },
  ]);
  const [activeGraphTabId, setActiveGraphTabId] = useState("graph-tab-1");
  const panelGroupRef = useRef<HTMLDivElement | null>(null);
  const graphViewportRef = useRef<HTMLDivElement | null>(null);
  const detailPanelRef = useRef<PanelImperativeHandle | null>(null);
  const nextGraphTabNumberRef = useRef(2);
  const nextGraphInstanceNumberRef = useRef(2);

  const activeLabel =
    menuItems.find((item) => item.id === activePanel)?.label ?? "Graph Source";
  const activePanelIcon =
    menuItems.find((item) => item.id === activePanel)?.icon ?? graphSourceIcon;
  const activeGraphTab =
    graphTabs.find((tab) => tab.id === activeGraphTabId) ?? graphTabs[0];
  const footerLeftWidthPx =
    panelGroupWidth > 0
      ? panelGroupWidth * ((menuPanelWidth + detailPanelWidth) / 100) + 2
      : 0;

  useEffect(() => {
    const panelGroup = panelGroupRef.current;
    if (!panelGroup) return;

    const updatePanelGroupWidth = () => {
      setPanelGroupWidth(panelGroup.clientWidth);
    };

    updatePanelGroupWidth();

    const resizeObserver = new ResizeObserver(() => {
      updatePanelGroupWidth();
    });

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

    const resizeObserver = new ResizeObserver(() => {
      updateViewportSize();
    });

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
      const fallbackTab =
        nextTabs[Math.max(0, tabIndex - 1)] ?? nextTabs[0];
      setActiveGraphTabId(fallbackTab.id);
    }
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

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="flex min-h-[44px] items-center justify-between border-b border-[#D9D9D9] bg-[#F5F5F5] px-4 md:px-6">
        <h2 className="text-[18px] font-medium text-black">
          {repository.name}
        </h2>
        <div className="flex items-center gap-3">
          <WorkspaceActionButton
            label="Reload"
            onClick={onReload}
            disabled={isLoading}
          />
          <WorkspaceActionButton
            label="Disconnect"
            onClick={onDisconnect}
          />
        </div>
      </div>

      <div ref={panelGroupRef} className="min-h-0 flex-1 overflow-hidden">
        <ResizablePanelGroup
          orientation="horizontal"
          id="visualizer-workspace-layout"
          defaultLayout={defaultLayout}
          onLayoutChanged={onLayoutChanged}
          className="min-h-0 h-full overflow-hidden"
        >
          {/* Left most menu */}
          <ResizablePanel
            id="workspace-menu-panel"
            defaultSize="10%"
            minSize="7%"
            maxSize="24%"
            onResize={(panelSize) => {
              setMenuPanelWidth(panelSize.asPercentage);
              setIsMenuCompact(panelSize.asPercentage <= 8);
            }}
          >
            <aside className="h-full overflow-hidden bg-white py-3">
              <nav className="space-y-1 px-3">
                {menuItems.map((item) => {
                  return (
                    <WorkspaceMenuItem
                      key={item.id}
                      label={item.label}
                      icon={item.icon}
                      isActive={item.id === activePanel}
                      isCompact={isMenuCompact}
                      onClick={() => setActivePanel(item.id)}
                    />
                  );
                })}
              </nav>
            </aside>
          </ResizablePanel>

          <ResizableHandle className="bg-[#D9D9D9] after:w-2 hover:bg-[#9BBDE0] focus-visible:bg-[#9BBDE0]" />

          <ResizablePanel
            id="workspace-detail-panel"
            panelRef={detailPanelRef}
            collapsible
            collapsedSize="0%"
            defaultSize="25%"
            minSize="22%"
            maxSize="42%"
            onResize={(panelSize) => {
              setDetailPanelWidth(panelSize.asPercentage);
              setIsDetailCollapsed(panelSize.asPercentage <= 1);
            }}
          >
            <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
              <WorkspacePanelHeader
                title={activeLabel}
                placeholder="Search"
                searchIcon={searchIcon}
                titleIcon={activePanelIcon}
              />
              <ScrollArea className="min-h-0 flex-1 bg-white">
                <WorkspaceDetailContent
                  activePanel={activePanel}
                  repository={repository}
                  workspaceData={workspaceData}
                  onRegenerate={handleGenerateGraph}
                />
              </ScrollArea>
            </section>
          </ResizablePanel>

          <ResizableHandle className="bg-[#D9D9D9] after:w-2 hover:bg-[#9BBDE0] focus-visible:bg-[#9BBDE0]">
            <WorkspaceDetailToggle
              isCollapsed={isDetailCollapsed}
              leftIcon={leftArrowIcon}
              rightIcon={rightArrowIcon}
              onToggle={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleDetailPanelToggle();
              }}
            />
          </ResizableHandle>

          <ResizablePanel
            id="workspace-graph-panel"
            defaultSize="52%"
            minSize="35%"
          >
            <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
              <WorkspacePanelHeader
                title={activeGraphTab?.label ?? "Policy Graph"}
                placeholder="Search graph"
                searchIcon={searchIcon}
                className="bg-[#C7DCF1]"
              />
              <div className="relative min-h-0 flex-1 bg-[linear-gradient(to_right,rgba(4,8,14,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(4,8,14,0.06)_1px,transparent_1px)] bg-[size:24px_24px]">
                <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
                  <WorkspaceActionButton
                    label="Zoom In"
                    icon={zoomInIcon}
                    onClick={() =>
                      setGraphZoom((current) =>
                        Math.min(1.8, Number((current + 0.1).toFixed(2))),
                      )
                    }
                  />
                  <WorkspaceActionButton
                    label="Zoom Out"
                    icon={zoomOutIcon}
                    onClick={() =>
                      setGraphZoom((current) =>
                        Math.max(0.6, Number((current - 0.1).toFixed(2))),
                      )
                    }
                  />
                </div>
                <ScrollArea
                  className="h-full w-full"
                  viewportRef={graphViewportRef}
                >
                  <div className="flex min-h-full min-w-full items-start touch-none">
                    <div className="flex min-h-full min-w-full w-max items-start gap-6 p-6">
                      {activeGraphTab?.graphs.length ? (
                        activeGraphTab.graphs.map((graph) => (
                          <div
                            key={graph.id}
                            className="h-[980px] w-[980px] shrink-0"
                          >
                            <PolicyGraphCanvas
                              graphId={graph.id}
                              zoom={graphZoom}
                              viewportWidth={980}
                              viewportHeight={Math.max(
                                graphViewportSize.height - 48,
                                720,
                              )}
                              offset={graph.offset}
                              onOffsetChange={(nextOffset) =>
                                handleGraphOffsetChange(graph.id, nextOffset)
                              }
                              onDelete={() => handleDeleteGraphInstance(graph.id)}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="min-h-[980px] min-w-[980px] shrink-0" />
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </section>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <WorkspaceBottomBar
        leftWidthPx={footerLeftWidthPx}
        tabs={graphTabs.map(({ id, label }) => ({ id, label }))}
        activeTabId={activeGraphTabId}
        addIcon={addIcon}
        onTabSelect={setActiveGraphTabId}
        onTabRename={(tabId, nextLabel) => {
          setGraphTabs((currentTabs) =>
            currentTabs.map((tab) =>
              tab.id === tabId ? { ...tab, label: nextLabel } : tab,
            ),
          );
        }}
        onTabAdd={handleAddGraphTab}
        onTabDelete={handleDeleteGraphTab}
      />
    </section>
  );
}
