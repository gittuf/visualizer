"use client";

import Image from "next/image";
import addIcon from "@/assets/add.png";
import leftArrowIcon from "@/assets/left.png";
import rightArrowIcon from "@/assets/right.png";
import searchIcon from "@/assets/search.png";
import zoomInIcon from "@/assets/zoom-in.png";
import zoomOutIcon from "@/assets/zoom-out.png";
import { WorkspaceCompareCanvas as CompareCanvas } from "@/screens/visualizer/compare-canvas";
import { WorkspaceDetailContent as DetailContent } from "@/screens/visualizer/detail-content";
import {
  WorkspaceHistoryCanvas as HistoryCanvas,
  WorkspaceHistoryTimelineStrip as HistoryTimelineStrip,
} from "@/screens/visualizer/history-canvas";
import { useVisualizerWorkspace } from "@/screens/visualizer/use-visualizer-workspace";
import { PolicyGraphCanvas } from "@/screens/visualizer/policy-graph-canvas";
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
import { historyTabId } from "@/screens/visualizer/visualizer.constants";
import type { VisualizerWorkspaceProps } from "@/screens/visualizer/visualizer.types";

export default function VisualizerWorkspace(props: VisualizerWorkspaceProps) {
  const {
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
  } = useVisualizerWorkspace(props);

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="flex min-h-[44px] items-center justify-between border-b border-[#D9D9D9] bg-[#F5F5F5] px-4 md:px-6">
        <h2 className="text-[18px] font-medium text-black">{props.repository.name}</h2>
        <div className="flex items-center gap-3">
          <WorkspaceActionButton
            label="Reload"
            onClick={props.onReload}
            disabled={props.isLoading}
          />
          <WorkspaceActionButton label="Disconnect" onClick={props.onDisconnect} />
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
                {visualizerMenuItems.map((item) => (
                  <WorkspaceMenuItem
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    isActive={item.id === activePanel}
                    isCompact={isMenuCompact}
                    onClick={() => handleMenuItemSelect(item.id)}
                  />
                ))}
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
                searchValue={detailSearchQuery}
                onSearchChange={setDetailSearchQuery}
              />
              <ScrollArea className="min-h-0 flex-1 bg-white">
                <DetailContent
                  activePanel={activePanel}
                  repository={props.repository}
                  workspaceData={props.workspaceData}
                  onRegenerate={handleGenerateGraph}
                  historyCommits={detailHistoryCommits}
                  selectedHistoryCommitHash={activeHistoryCommitId}
                  onHistoryCommitSelect={setActiveHistoryCommitId}
                  searchQuery={detailSearchQuery}
                  selectedHistorySort={historySortField}
                  isHistorySortAscending={isHistorySortAscending}
                  onHistorySortChange={setHistorySortField}
                  onHistorySortDirectionToggle={() =>
                    setIsHistorySortAscending((current) => !current)
                  }
                  selectedBaseVersion={selectedBaseVersion}
                  selectedCompareVersion={selectedCompareVersion}
                  hasCompared={hasCompared}
                  onBaseVersionChange={(value) => {
                    setSelectedBaseVersion(value);
                    setHasCompared(false);
                  }}
                  onCompareVersionChange={(value) => {
                    setSelectedCompareVersion(value);
                    setHasCompared(false);
                  }}
                  onSwapVersions={() => {
                    setSelectedBaseVersion(selectedCompareVersion);
                    setSelectedCompareVersion(selectedBaseVersion);
                    setHasCompared(false);
                  }}
                  onCompare={handleGenerateCompareGraph}
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

          <ResizablePanel id="workspace-graph-panel" defaultSize="52%" minSize="35%">
            <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
              {isHistoryPanel && !isHistoryStripCollapsed ? (
                <HistoryTimelineStrip
                  commits={historyCommits}
                  activeCommitId={activeHistoryCommitId}
                  onSelect={setActiveHistoryCommitId}
                />
              ) : null}
              {isHistoryPanel ? (
                <div className="relative flex h-[26px] items-center justify-center border-b border-[#D9D9D9] bg-white">
                  <button
                    type="button"
                    onClick={() => setIsHistoryStripCollapsed((collapsed) => !collapsed)}
                    className="flex h-[26px] w-[54px] items-center justify-center border border-[#B7B7B7] bg-[#EEF3F6] hover:bg-[#E2E8F0]"
                    aria-label={
                      isHistoryStripCollapsed
                        ? "Expand commit history strip"
                        : "Collapse commit history strip"
                    }
                    title={
                      isHistoryStripCollapsed
                        ? "Expand commit history strip"
                        : "Collapse commit history strip"
                    }
                  >
                    <Image
                      src={rightArrowIcon}
                      alt=""
                      className={`h-[18px] w-[18px] ${
                        isHistoryStripCollapsed ? "rotate-90" : "-rotate-90"
                      }`}
                    />
                  </button>
                </div>
              ) : null}
              <WorkspacePanelHeader
                title={isHistoryPanel ? "Policy Graph" : activeGraphTab?.label ?? "Policy Graph"}
                placeholder={
                  isHistoryPanel
                    ? "Search"
                    : isComparePanel
                      ? "Search compare graph"
                      : "Search graph"
                }
                searchIcon={searchIcon}
                className="bg-[#C7DCF1]"
                searchValue={graphSearchQuery}
                onSearchChange={setGraphSearchQuery}
              />
              <div className="relative min-h-0 flex-1">
                <div className="absolute right-4 z-10 flex items-center gap-2" style={{ top: "16px" }}>
                  <WorkspaceActionButton
                    label="Zoom In"
                    icon={zoomInIcon}
                    onClick={() =>
                      setGraphZoom((current) => Math.min(1.8, Number((current + 0.1).toFixed(2))))
                    }
                  />
                  <WorkspaceActionButton
                    label="Zoom Out"
                    icon={zoomOutIcon}
                    onClick={() =>
                      setGraphZoom((current) => Math.max(0.6, Number((current - 0.1).toFixed(2))))
                    }
                  />
                </div>

                {isHistoryPanel ? (
                  <HistoryCanvas
                    commits={historyCommits}
                    activeCommitId={activeHistoryCommitId}
                    zoom={graphZoom}
                    searchQuery={graphSearchQuery}
                  />
                ) : isComparePanel ? (
                  hasCompared ? (
                    <CompareCanvas
                      baseVersionLabel={selectedBaseVersion}
                      compareVersionLabel={selectedCompareVersion}
                      baseGraph={baseCompareGraph}
                      compareGraph={compareGraph}
                      zoom={graphZoom}
                      searchQuery={graphSearchQuery}
                    />
                  ) : (
                    <div className="h-full bg-[linear-gradient(to_right,rgba(4,8,14,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(4,8,14,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
                  )
                ) : (
                  <div className="h-full bg-[linear-gradient(to_right,rgba(4,8,14,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(4,8,14,0.06)_1px,transparent_1px)] bg-[size:24px_24px]">
                    <ScrollArea className="h-full w-full" viewportRef={graphViewportRef}>
                      <div className="flex min-h-full min-w-full items-start touch-none">
                        <div className="flex min-h-full min-w-full w-max items-start gap-6 p-6">
                          {activeGraphTab?.graphs.length ? (
                            activeGraphTab.graphs.map((graph) => (
                              <div key={graph.id} className="h-[980px] w-[980px] shrink-0">
                                <PolicyGraphCanvas
                                  graphId={graph.id}
                                  zoom={graphZoom}
                                  searchQuery={graphSearchQuery}
                                  viewportWidth={980}
                                  viewportHeight={Math.max(graphViewportSize.height - 48, 720)}
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
                )}
              </div>
            </section>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <WorkspaceBottomBar
        leftWidthPx={footerLeftWidthPx}
        tabs={graphTabs.map(({ id, label, closable, editable }) => ({
          id,
          label,
          closable,
          editable,
        }))}
        activeTabId={isHistoryPanel ? historyTabId : activeGraphTabId}
        addIcon={addIcon}
        onTabSelect={handleBottomTabSelect}
        onTabRename={handleTabRename}
        onTabAdd={handleAddGraphTab}
        onTabDelete={handleDeleteGraphTab}
      />
    </section>
  );
}
