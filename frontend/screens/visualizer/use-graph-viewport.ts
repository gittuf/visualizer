"use client";

import { useEffect, useRef, useState } from "react";

interface GraphViewportSize {
  width: number;
  height: number;
}

export function useGraphViewport(
  graphZoom: number,
  onViewportResize?: (size: GraphViewportSize) => void,
) {
  const graphViewportRef = useRef<HTMLDivElement | null>(null);
  const [graphViewportSize, setGraphViewportSize] = useState<GraphViewportSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const viewport = graphViewportRef.current;
    if (!viewport) return;

    const updateViewportSize = () => {
      const nextSize = {
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      };

      setGraphViewportSize(nextSize);
      onViewportResize?.(nextSize);
    };

    updateViewportSize();

    const resizeObserver = new ResizeObserver(updateViewportSize);
    resizeObserver.observe(viewport);

    return () => {
      resizeObserver.disconnect();
    };
  }, [onViewportResize]);

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

  return {
    graphViewportRef,
    graphViewportSize,
  };
}
