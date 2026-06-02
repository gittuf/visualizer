"use client";

import type React from "react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDefaultLayout } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import branchIcon from "@/assets/branch.png";
import compareIcon from "@/assets/compare.png";
import fileIcon from "@/assets/file.png";
import graphSourceIcon from "@/assets/graph-source.png";
import historyIcon from "@/assets/history.png";
import leftArrowIcon from "@/assets/left.png";
import metadataIcon from "@/assets/metadata.png";
import policyQueryIcon from "@/assets/policy-query.png";
import rightArrowIcon from "@/assets/right.png";
import searchIcon from "@/assets/search.png";
import settingsIcon from "@/assets/Settings.png";
import usersIcon from "@/assets/Users.png";
import zoomInIcon from "@/assets/zoom-in.png";
import zoomOutIcon from "@/assets/zoom-out.png";
import type { PanelImperativeHandle } from "react-resizable-panels";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RepositoryInfo } from "@/lib/repository-handler";

type WorkspacePanelId =
  | "graph-source"
  | "policy-query"
  | "history"
  | "compare"
  | "metadata"
  | "settings";

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

function SearchField({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative w-full max-w-[220px]">
      <Input
        placeholder={placeholder}
        className="h-5 rounded-[5px] border-[#04080E] pr-8 text-[12px] focus-visible:ring-0 focus-visible:ring-offset-0 md:h-5 md:text-[12px]"
      />
      <Image
        src={searchIcon}
        alt=""
        className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 opacity-80"
      />
    </div>
  );
}

function GraphZoomButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: typeof zoomInIcon;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="h-8 rounded-[5px] border-[#04080E] bg-white px-3 text-[14px] font-normal text-black hover:bg-[#F7F7F7]"
    >
      <Image src={icon} alt="" className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}

function PolicyGraphCanvas({ zoom }: { zoom: number }) {
  const layoutWidth = 980;
  const layoutHeight = 980;
  const boundary = { x: 80, y: 60, width: 820, height: 840 };
  const laneCenters = [310, 670];
  const principalOffsets = [-110, 0, 110];
  const rowY = {
    branch: 120,
    file: 300,
    role: 500,
    principals: 760,
  };

  const lanes = [
    {
      key: "left",
      pathLabel: "src/**",
      roleLabel: "Authorized users",
      approvals: "Requires: 2 approvals",
    },
    {
      key: "right",
      pathLabel: "docs/**",
      roleLabel: "Authorized users",
      approvals: "Requires: 2 approvals",
    },
  ] as const;

  const principalNames = ["Alice", "Carol", "Bob"];

  const branchBox = { width: 140, height: 92 };
  const fileBox = { width: 120, height: 118 };
  const roleBox = { width: 180, height: 132 };
  const principalBox = { width: 92, height: 108 };
  const scrollPadding = 96;
  const scaledWidth = layoutWidth * zoom;
  const scaledHeight = layoutHeight * zoom;
  const canvasWidth = scaledWidth + scrollPadding * 2;
  const canvasHeight = scaledHeight + scrollPadding * 2;

  const verticalPaths = laneCenters.flatMap((centerX) => [
    {
      d: `M ${centerX} ${rowY.branch + branchBox.height} L ${centerX} ${rowY.file - 18}`,
      arrow: true,
    },
    {
      d: `M ${centerX} ${rowY.file + fileBox.height} L ${centerX} ${rowY.role - 18}`,
      arrow: true,
    },
  ]);

  const principalPaths = laneCenters.flatMap((centerX) => {
    const splitY = 660;
    return [
      {
        d: `M ${centerX - 22} ${rowY.role + roleBox.height} L ${centerX - 22} ${splitY}`,
        arrow: false,
      },
      {
        d: `M ${centerX} ${rowY.role + roleBox.height} L ${centerX} ${splitY}`,
        arrow: false,
      },
      {
        d: `M ${centerX + 22} ${rowY.role + roleBox.height} L ${centerX + 22} ${splitY}`,
        arrow: false,
      },
      {
        d: `M ${centerX - 22} ${splitY} L ${centerX - 110} ${splitY}`,
        arrow: false,
      },
      {
        d: `M ${centerX + 22} ${splitY} L ${centerX + 110} ${splitY}`,
        arrow: false,
      },
      ...principalOffsets.map((offset) => ({
        d: `M ${centerX + offset} ${splitY} L ${centerX + offset} ${rowY.principals - 18}`,
        arrow: true,
      })),
    ];
  });

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <div
        className="relative min-h-full min-w-full"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        }}
      >
        <div
          className="absolute origin-top-left"
          style={{
            left: `${scrollPadding}px`,
            top: `${scrollPadding}px`,
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
          }}
        >
          <div
            className="relative origin-top-left"
            style={{
              width: `${layoutWidth}px`,
              height: `${layoutHeight}px`,
              transform: `scale(${zoom})`,
            }}
          >
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox={`0 0 ${layoutWidth} ${layoutHeight}`}
              preserveAspectRatio="xMidYMin meet"
            >
              <defs>
                <marker
                  id="policy-arrow"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="5"
                  orient="auto"
                >
                  <path
                    d="M1,1 L8,5 L1,9"
                    fill="none"
                    stroke="#04080E"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </marker>
              </defs>

              <rect
                x={boundary.x}
                y={boundary.y}
                width={boundary.width}
                height={boundary.height}
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                strokeDasharray="6 6"
              />

              {[...verticalPaths, ...principalPaths].map((path, index) => (
                <path
                  key={index}
                  d={path.d}
                  stroke="#04080E"
                  strokeWidth="1.5"
                  fill="none"
                  markerEnd={path.arrow ? "url(#policy-arrow)" : undefined}
                />
              ))}
            </svg>

            <div
              className="absolute text-[16px] font-medium leading-[1.3] text-[#7E7E7E]"
              style={{
                left: `${boundary.x + 16}px`,
                top: `${boundary.y - 4}px`,
              }}
            >
              gittuf_repo
            </div>

            {lanes.map((lane, laneIndex) => {
              const centerX = laneCenters[laneIndex];
              return (
                <div key={lane.key}>
                  <div
                    className="absolute flex flex-col items-center text-center"
                    style={{
                      left: `${centerX - branchBox.width / 2}px`,
                      top: `${rowY.branch}px`,
                      width: `${branchBox.width}px`,
                      minHeight: `${branchBox.height}px`,
                    }}
                  >
                    <Image
                      src={branchIcon}
                      alt=""
                      className="mt-1 h-9 w-9 grayscale"
                      draggable={false}
                    />
                    <div className="mt-2 text-[16px] leading-[1.3] text-black">
                      Branch: main
                    </div>
                  </div>

                  <div
                    className="absolute flex flex-col items-center text-center"
                    style={{
                      left: `${centerX - fileBox.width / 2}px`,
                      top: `${rowY.file}px`,
                      width: `${fileBox.width}px`,
                      minHeight: `${fileBox.height}px`,
                    }}
                  >
                    <Image
                      src={fileIcon}
                      alt=""
                      className="mt-1 h-12 w-10 grayscale"
                      draggable={false}
                    />
                    <div className="mt-2 text-[16px] leading-[1.3] text-black">
                      {lane.pathLabel}
                    </div>
                  </div>

                  <div
                    className="absolute flex flex-col items-center text-center"
                    style={{
                      left: `${centerX - roleBox.width / 2}px`,
                      top: `${rowY.role}px`,
                      width: `${roleBox.width}px`,
                      minHeight: `${roleBox.height}px`,
                    }}
                  >
                    <Image
                      src={usersIcon}
                      alt=""
                      className="mt-1 h-12 w-12 grayscale"
                      draggable={false}
                    />
                    <div className="mt-2 text-[16px] leading-[1.3] text-black">
                      {lane.roleLabel}
                    </div>
                    <div
                      className="mt-1 text-[14px] leading-[1.3]"
                      style={{ color: "#7E7E7E" }}
                    >
                      {lane.approvals}
                    </div>
                  </div>

                  {principalNames.map((name, principalIndex) => {
                    const center = centerX + principalOffsets[principalIndex];
                    return (
                      <div
                        key={`${lane.key}-${name}`}
                        className="absolute flex flex-col items-center text-center"
                        style={{
                          left: `${center - principalBox.width / 2}px`,
                          top: `${rowY.principals}px`,
                          width: `${principalBox.width}px`,
                          minHeight: `${principalBox.height}px`,
                        }}
                      >
                        <Image
                          src={usersIcon}
                          alt=""
                          className="mt-1 h-10 w-10 grayscale"
                          draggable={false}
                        />
                        <div className="mt-2 text-[16px] leading-[1.3] text-black">
                          {name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [activePanel, setActivePanel] =
    useState<WorkspacePanelId>("graph-source");
  const [isMenuCompact, setIsMenuCompact] = useState(initialMenuWidth <= 11);
  const [isDetailCollapsed, setIsDetailCollapsed] = useState(false);
  const [graphZoom, setGraphZoom] = useState(0.75);
  const graphViewportRef = useRef<HTMLDivElement | null>(null);
  const detailPanelRef = useRef<PanelImperativeHandle | null>(null);
  const hasInitializedGraphScrollRef = useRef(false);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originScrollLeft: number;
    originScrollTop: number;
  } | null>(null);

  const activeLabel =
    menuItems.find((item) => item.id === activePanel)?.label ?? "Graph Source";

  useEffect(() => {
    const viewport = graphViewportRef.current;
    if (!viewport || hasInitializedGraphScrollRef.current) return;

    viewport.scrollLeft = 96;
    viewport.scrollTop = 96;
    hasInitializedGraphScrollRef.current = true;
  }, []);

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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReload}
            disabled={isLoading}
            className="rounded-[5px] border-[#04080E] bg-white text-black hover:bg-[#F7F7F7]"
          >
            Reload
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDisconnect}
            className="rounded-[5px] border-[#04080E] bg-white text-black hover:bg-[#F7F7F7]"
          >
            Disconnect
          </Button>
        </div>
      </div>

      <ResizablePanelGroup
        orientation="horizontal"
        id="visualizer-workspace-layout"
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
        className="min-h-0 flex-1 overflow-hidden"
      >
        {/* Left most menu */}
        <ResizablePanel
          id="workspace-menu-panel"
          defaultSize="10%"
          minSize="7%"
          maxSize="24%"
          onResize={(panelSize) =>
            setIsMenuCompact(panelSize.asPercentage <= 8)
          }
        >
          <aside className="h-full overflow-hidden bg-white py-3">
            <nav className="space-y-1 px-3">
              {menuItems.map((item) => {
                const isActive = item.id === activePanel;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActivePanel(item.id)}
                    className={`flex w-full items-center rounded-[5px] px-3 py-4 text-left text-[15px] text-black transition-colors ${
                      isMenuCompact ? "justify-center" : "gap-3"
                    } ${isActive ? "bg-[#D8EAFB]" : "hover:bg-[#F3F6F9]"}`}
                    title={isMenuCompact ? item.label : undefined}
                  >
                    <Image
                      src={item.icon}
                      alt=""
                      className="h-[18px] w-[18px]"
                    />
                    {!isMenuCompact && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </button>
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
          onResize={(panelSize) =>
            setIsDetailCollapsed(panelSize.asPercentage <= 1)
          }
        >
          <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
            <div className="flex min-h-[36px] items-center justify-between border-b border-[#D9D9D9] bg-white px-3">
              <h3 className="text-[18px] font-normal text-black">
                {activeLabel}
              </h3>
              <SearchField placeholder="Search" />
            </div>
            <div className="min-h-0 flex-1 bg-white" />
          </section>
        </ResizablePanel>

        <ResizableHandle className="bg-[#D9D9D9] after:w-2 hover:bg-[#9BBDE0] focus-visible:bg-[#9BBDE0]">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleDetailPanelToggle();
            }}
            className="absolute left-0 top-1/2 z-20 flex h-[60px] w-[35px] -translate-y-1/2 items-center justify-center border border-[#D0D9DC] bg-[#DBE3E5] hover:bg-[#CFD9DC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BBDE0]"
            aria-label={
              isDetailCollapsed
                ? "Expand detail panel"
                : "Collapse detail panel"
            }
            title={
              isDetailCollapsed
                ? "Expand detail panel"
                : "Collapse detail panel"
            }
          >
            <Image
              src={isDetailCollapsed ? rightArrowIcon : leftArrowIcon}
              alt=""
              className="h-8 w-8"
            />
          </button>
        </ResizableHandle>

        <ResizablePanel
          id="workspace-graph-panel"
          defaultSize="52%"
          minSize="35%"
        >
          <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
            <div className="flex min-h-[36px] items-center justify-between border-b border-[#D9D9D9] bg-[#C7DCF1] px-3">
              <h3 className="text-[18px] font-normal text-black">
                Policy Graph
              </h3>
              <SearchField placeholder="Search graph" />
            </div>
            <div className="relative min-h-0 flex-1 bg-[linear-gradient(to_right,rgba(4,8,14,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(4,8,14,0.06)_1px,transparent_1px)] bg-[size:24px_24px]">
              <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
                <GraphZoomButton
                  label="Zoom In"
                  icon={zoomInIcon}
                  onClick={() =>
                    setGraphZoom((current) =>
                      Math.min(1.8, Number((current + 0.1).toFixed(2))),
                    )
                  }
                />
                <GraphZoomButton
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
                  className="h-full w-full touch-none"
                  onPointerDown={handleGraphPointerDown}
                  style={{ cursor: "grab" }}
                >
                  <PolicyGraphCanvas zoom={graphZoom} />
                </div>
              </ScrollArea>
            </div>
          </section>
        </ResizablePanel>
      </ResizablePanelGroup>
    </section>
  );
}
