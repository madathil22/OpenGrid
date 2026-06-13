import { useRef, useState, useCallback } from 'react';
import { RenderEngine } from '@opengrid/core';
import type { RowWindowResult } from '@opengrid/core';

export interface UseVirtualScrollParams {
  totalRows: number;
  rowHeight: number;
  viewportHeight: number;
  overscan?: number;
}

export interface UseVirtualScrollReturn {
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
  scrollTop: number;
  onScroll: (e: React.UIEvent<HTMLElement>) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const engine = new RenderEngine();

export function useVirtualScroll(params: UseVirtualScrollParams): UseVirtualScrollReturn {
  const { totalRows, rowHeight, viewportHeight, overscan = 3 } = params;
  const scrollTopRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);

  const computeWindow = useCallback(
    (scrollTop: number): RowWindowResult =>
      engine.computeRowWindow({ scrollTop, viewportHeight, rowHeight, totalRows, overscan }),
    [viewportHeight, rowHeight, totalRows, overscan],
  );

  const [window, setWindow] = useState<RowWindowResult>(() => computeWindow(0));

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const newScrollTop = (e.currentTarget as HTMLElement).scrollTop;
      if (newScrollTop === scrollTopRef.current) return;
      scrollTopRef.current = newScrollTop;
      setWindow(computeWindow(newScrollTop));
    },
    [computeWindow],
  );

  return {
    startIndex: window.startIndex,
    endIndex: window.endIndex,
    totalHeight: window.totalHeight,
    offsetY: window.offsetY,
    scrollTop: scrollTopRef.current,
    onScroll,
    containerRef,
  };
}
