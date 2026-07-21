"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDefaultLayout } from "react-resizable-panels";
import type { PanelImperativeHandle } from "react-resizable-panels";

const compactMenuWidthPx = 112;
const menuMinSizePercent = 5;
const autoCollapseDetailWidthPx = 980;

function shouldUseCompactMenu(
  menuWidthPercent: number,
  totalWidthPx: number,
) {
  if (totalWidthPx > 0) {
    return totalWidthPx * (menuWidthPercent / 100) <= compactMenuWidthPx;
  }

  return menuWidthPercent <= 8;
}

export function useVisualizerLayout() {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "visualizer-workspace-layout",
  });
  const initialMenuWidth = Math.max(
    defaultLayout?.["workspace-menu-panel"] ?? 18,
    menuMinSizePercent,
  );
  const initialDetailWidth = defaultLayout?.["workspace-detail-panel"] ?? 25;
  const normalizedDefaultLayout = defaultLayout
    ? {
        ...defaultLayout,
        "workspace-menu-panel": initialMenuWidth,
      }
    : undefined;

  const [isDetailCollapsed, setIsDetailCollapsed] = useState(
    initialDetailWidth <= 1,
  );
  const [menuPanelWidth, setMenuPanelWidth] = useState(initialMenuWidth);
  const [detailPanelWidth, setDetailPanelWidth] = useState(initialDetailWidth);
  const [panelGroupWidth, setPanelGroupWidth] = useState(0);
  const isMenuCompact = useMemo(
    () => shouldUseCompactMenu(menuPanelWidth, panelGroupWidth),
    [menuPanelWidth, panelGroupWidth],
  );

  const panelGroupRef = useRef<HTMLDivElement | null>(null);
  const detailPanelRef = useRef<PanelImperativeHandle | null>(null);
  const didAutoCollapseDetailRef = useRef(false);

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
    if (!detailPanelRef.current || panelGroupWidth <= 0) {
      return;
    }

    if (panelGroupWidth <= autoCollapseDetailWidthPx && !isDetailCollapsed) {
      detailPanelRef.current.collapse();
      didAutoCollapseDetailRef.current = true;
    } else if (
      panelGroupWidth > autoCollapseDetailWidthPx &&
      isDetailCollapsed &&
      didAutoCollapseDetailRef.current
    ) {
      detailPanelRef.current.expand();
      didAutoCollapseDetailRef.current = false;
    }
  }, [isDetailCollapsed, panelGroupWidth]);

  const handleDetailPanelToggle = () => {
    if (!detailPanelRef.current) return;

    // A manual toggle takes precedence over the auto-collapse bookkeeping until
    // the next width-driven layout decision.
    didAutoCollapseDetailRef.current = false;

    if (isDetailCollapsed) {
      detailPanelRef.current.expand();
      setIsDetailCollapsed(false);
      return;
    }

    detailPanelRef.current.collapse();
    setIsDetailCollapsed(true);
  };

  const footerLeftWidthPx =
    panelGroupWidth > 0
      ? panelGroupWidth * ((menuPanelWidth + detailPanelWidth) / 100) + 2
      : 0;

  return {
    defaultLayout: normalizedDefaultLayout,
    detailPanelRef,
    detailPanelWidth,
    footerLeftWidthPx,
    handleDetailPanelToggle,
    isDetailCollapsed,
    isMenuCompact,
    menuPanelWidth,
    onLayoutChanged,
    panelGroupRef,
    setDetailPanelWidth,
    setIsDetailCollapsed,
    setMenuPanelWidth,
  };
}
