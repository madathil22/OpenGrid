import { useRef, useState, useCallback } from 'react';
import { RenderEngine, RowHeightCache } from '@opengrid/core';
import type { RowWindowResult } from '@opengrid/core';

export interface UseVirtualScrollParams {
  totalRows: number;
  rowHeight: number;
  viewportHeight: number;
  overscan?: number;
  heightCache?: RowHeightCache;
}

export interface UseVirtualScrollReturn {
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
  scrollTop: number;
  scrollLeft: number;
  onScroll: (e: React.UIEvent<HTMLElement>) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const engine = new RenderEngine();

export function useVirtualScroll(params: UseVirtualScrollParams): UseVirtualScrollReturn {
  const { totalRows, rowHeight, viewportHeight, overscan = 3, heightCache } = params;
  const scrollTopRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const computeWindow = useCallback(
    (scrollTop: number): RowWindowResult =>
      engine.computeRowWindow({ scrollTop, viewportHeight, rowHeight, totalRows, overscan, heightCache }),
    [viewportHeight, rowHeight, totalRows, overscan, heightCache],
  );

  const [window, setWindow] = useState<RowWindowResult>(() => computeWindow(0));
  const [scrollLeft, setScrollLeft] = useState(0);

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const el = e.currentTarget as HTMLElement;
      const newScrollTop = el.scrollTop;
      const newScrollLeft = el.scrollLeft;
      let changed = false;

      if (newScrollTop !== scrollTopRef.current) {
        scrollTopRef.current = newScrollTop;
        setWindow(computeWindow(newScrollTop));
        changed = true;
      }

      if (newScrollLeft !== scrollLeftRef.current) {
        scrollLeftRef.current = newScrollLeft;
        setScrollLeft(newScrollLeft);
        changed = true;
      }

      void changed; // suppress lint warning
    },
    [computeWindow],
  );

  return {
    startIndex: window.startIndex,
    endIndex: window.endIndex,
    totalHeight: window.totalHeight,
    offsetY: window.offsetY,
    scrollTop: scrollTopRef.current,
    scrollLeft,
    onScroll,
    containerRef,
  };
}
