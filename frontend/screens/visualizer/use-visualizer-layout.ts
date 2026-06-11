"use client";

import { useEffect, useRef, useState } from "react";
import { useDefaultLayout } from "react-resizable-panels";
import type { PanelImperativeHandle } from "react-resizable-panels";

const compactMenuWidthPx = 132;
const autoCollapseMenuWidthPx = 1180;
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
  const initialMenuWidth = defaultLayout?.["workspace-menu-panel"] ?? 18;
  const initialDetailWidth = defaultLayout?.["workspace-detail-panel"] ?? 25;

  const [isMenuCompact, setIsMenuCompact] = useState(initialMenuWidth <= 8);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [isDetailCollapsed, setIsDetailCollapsed] = useState(false);
  const [menuPanelWidth, setMenuPanelWidth] = useState(initialMenuWidth);
  const [detailPanelWidth, setDetailPanelWidth] = useState(initialDetailWidth);
  const [panelGroupWidth, setPanelGroupWidth] = useState(0);

  const panelGroupRef = useRef<HTMLDivElement | null>(null);
  const menuPanelRef = useRef<PanelImperativeHandle | null>(null);
  const detailPanelRef = useRef<PanelImperativeHandle | null>(null);
  const didAutoCollapseMenuRef = useRef(false);
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
    setIsMenuCompact(shouldUseCompactMenu(menuPanelWidth, panelGroupWidth));
  }, [menuPanelWidth, panelGroupWidth]);

  useEffect(() => {
    if (!menuPanelRef.current || !detailPanelRef.current || panelGroupWidth <= 0) {
      return;
    }

    // Auto-collapse is width-driven, but only auto-expand panels that this hook
    // previously collapsed. Manual user collapses should stay under user control.
    if (panelGroupWidth <= autoCollapseMenuWidthPx && !isMenuCollapsed) {
      menuPanelRef.current.collapse();
      didAutoCollapseMenuRef.current = true;
    } else if (
      panelGroupWidth > autoCollapseMenuWidthPx &&
      isMenuCollapsed &&
      didAutoCollapseMenuRef.current
    ) {
      menuPanelRef.current.expand();
      didAutoCollapseMenuRef.current = false;
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
  }, [isDetailCollapsed, isMenuCollapsed, panelGroupWidth]);

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
  };
}
