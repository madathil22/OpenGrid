import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { RowHeightCache } from '@opengrid/core';
import { useVirtualScroll } from '../hooks/useVirtualScroll.js';

function makeScrollEvent(scrollTop: number, scrollLeft: number) {
  return {
    currentTarget: { scrollTop, scrollLeft } as HTMLElement,
  } as React.UIEvent<HTMLElement>;
}

describe('useVirtualScroll', () => {
  it('computes an initial fixed-height window at scrollTop 0', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({ totalRows: 100, rowHeight: 40, viewportHeight: 400, overscan: 0 }),
    );
    expect(result.current.startIndex).toBe(0);
    expect(result.current.totalHeight).toBe(4000);
    expect(result.current.endIndex).toBeGreaterThanOrEqual(9);
  });

  it('updates the row window when scrollTop changes', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({ totalRows: 100, rowHeight: 40, viewportHeight: 400, overscan: 0 }),
    );
    act(() => {
      result.current.onScroll(makeScrollEvent(1000, 0));
    });
    expect(result.current.scrollTop).toBe(1000);
    expect(result.current.startIndex).toBe(25);
    expect(result.current.offsetY).toBe(1000);
  });

  it('tracks horizontal scroll position independently', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({ totalRows: 50, rowHeight: 40, viewportHeight: 400 }),
    );
    act(() => {
      result.current.onScroll(makeScrollEvent(0, 250));
    });
    expect(result.current.scrollLeft).toBe(250);
    // vertical window unchanged
    expect(result.current.startIndex).toBe(0);
  });

  it('uses a RowHeightCache for variable-height windowing', () => {
    const cache = new RowHeightCache(40);
    cache.setHeights([40, 80, 40, 120, 40]);
    const { result } = renderHook(() =>
      useVirtualScroll({
        totalRows: 5,
        rowHeight: 40,
        viewportHeight: 100,
        overscan: 0,
        heightCache: cache,
      }),
    );
    expect(result.current.totalHeight).toBe(320);
    act(() => {
      // offsets [0,40,120,160,280,320]; scrollTop 130 → row index 2
      result.current.onScroll(makeScrollEvent(130, 0));
    });
    expect(result.current.startIndex).toBe(2);
    expect(result.current.offsetY).toBe(120);
  });
});
