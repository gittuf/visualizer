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
import type { WorkspacePanelId } from "@/page-components/visualizer/visualizer-workspace-types";

interface VisualizerWorkspaceProps {
  repository: RepositoryInfo;
  isLoading: boolean;
  onReload: () => void;
  onDisconnect: () => void;
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
  const panelGroupRef = useRef<HTMLDivElement | null>(null);
  const graphViewportRef = useRef<HTMLDivElement | null>(null);
  const detailPanelRef = useRef<PanelImperativeHandle | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originScrollLeft: number;
    originScrollTop: number;
  } | null>(null);

  const activeLabel =
    menuItems.find((item) => item.id === activePanel)?.label ?? "Graph Source";
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

  const handleGraphPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (event.button !== 0) return;

    event.preventDefault();

    const viewport = graphViewportRef.current;
    if (!viewport) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originScrollLeft: viewport.scrollLeft,
      originScrollTop: viewport.scrollTop,
    };

    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (
        !dragStateRef.current ||
        moveEvent.pointerId !== dragStateRef.current.pointerId
      )
        return;

      const deltaX = moveEvent.clientX - dragStateRef.current.startX;
      const deltaY = moveEvent.clientY - dragStateRef.current.startY;

      viewport.scrollLeft = dragStateRef.current.originScrollLeft - deltaX;
      viewport.scrollTop = dragStateRef.current.originScrollTop - deltaY;
    };

    const handlePointerEnd = (endEvent: PointerEvent) => {
      if (
        !dragStateRef.current ||
        endEvent.pointerId !== dragStateRef.current.pointerId
      )
        return;
      dragStateRef.current = null;
      target.releasePointerCapture(endEvent.pointerId);
      target.removeEventListener("pointermove", handlePointerMove);
      target.removeEventListener("pointerup", handlePointerEnd);
      target.removeEventListener("pointercancel", handlePointerEnd);
    };

    target.addEventListener("pointermove", handlePointerMove);
    target.addEventListener("pointerup", handlePointerEnd);
    target.addEventListener("pointercancel", handlePointerEnd);
  };

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
              />
              <div className="min-h-0 flex-1 bg-white" />
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
                title="Policy Graph"
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
                  <div
                    className="flex min-h-full min-w-full items-center justify-center touch-none"
                    onPointerDown={handleGraphPointerDown}
                    style={{ cursor: "grab" }}
                  >
                    <div className="min-h-full min-w-full w-max">
                      <PolicyGraphCanvas
                        zoom={graphZoom}
                        viewportWidth={graphViewportSize.width}
                        viewportHeight={graphViewportSize.height}
                      />
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
        currentGraphLabel="Policy Graph"
        addIcon={addIcon}
      />
    </section>
  );
}
