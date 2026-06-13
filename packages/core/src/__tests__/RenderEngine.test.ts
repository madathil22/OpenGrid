import { describe, it, expect } from 'vitest';
import { RenderEngine, RowHeightCache } from '../engines/RenderEngine.js';

describe('RenderEngine', () => {
  const engine = new RenderEngine();

  describe('computeRowWindow', () => {
    it('returns correct window at scroll top = 0', () => {
      const result = engine.computeRowWindow({
        scrollTop: 0,
        viewportHeight: 400,
        rowHeight: 40,
        totalRows: 100,
        overscan: 3,
      });
      expect(result.startIndex).toBe(0);
      expect(result.offsetY).toBe(0);
      expect(result.endIndex).toBeGreaterThan(9);
      expect(result.totalHeight).toBe(4000);
    });

    it('offsets correctly when scrolled', () => {
      const result = engine.computeRowWindow({
        scrollTop: 1000,
        viewportHeight: 400,
        rowHeight: 40,
        totalRows: 100,
        overscan: 0,
      });
      // rawStart = 1000/40 = 25
      expect(result.startIndex).toBe(25);
      expect(result.offsetY).toBe(25 * 40);
    });

    it('clamps endIndex to totalRows - 1', () => {
      const result = engine.computeRowWindow({
        scrollTop: 5000,
        viewportHeight: 400,
        rowHeight: 40,
        totalRows: 10,
        overscan: 3,
      });
      expect(result.endIndex).toBe(9);
    });

    it('handles 0 rows', () => {
      const result = engine.computeRowWindow({
        scrollTop: 0,
        viewportHeight: 400,
        rowHeight: 40,
        totalRows: 0,
      });
      expect(result.totalHeight).toBe(0);
      expect(result.startIndex).toBe(0);
    });
  });

  describe('computeColumnWindow', () => {
    const columns = [
      { width: 100 },
      { width: 200 },
      { width: 150 },
      { width: 120 },
      { width: 80 },
    ];

    it('returns all columns visible at scroll 0', () => {
      const result = engine.computeColumnWindow({
        scrollLeft: 0,
        viewportWidth: 1000,
        columns,
        overscan: 0,
      });
      expect(result.startColIndex).toBe(0);
    });

    it('handles empty columns', () => {
      const result = engine.computeColumnWindow({
        scrollLeft: 0,
        viewportWidth: 500,
        columns: [],
      });
      expect(result.startColIndex).toBe(0);
      expect(result.endColIndex).toBe(0);
    });

    it('computes a non-zero offsetX once the start column is past index 0', () => {
      // Scroll past the first two columns (100 + 200 = 300px)
      const result = engine.computeColumnWindow({
        scrollLeft: 350,
        viewportWidth: 200,
        columns,
        overscan: 0,
      });
      // Column index 2 starts at 300px → it should be the first visible column
      expect(result.startColIndex).toBe(2);
      // offsetX must be the cumulative width of columns 0 and 1
      expect(result.offsetX).toBe(300);
    });

    it('applies overscan to the start column and reflects it in offsetX', () => {
      const result = engine.computeColumnWindow({
        scrollLeft: 350,
        viewportWidth: 200,
        columns,
        overscan: 1,
      });
      // rawStart = 2, with overscan 1 → startColIndex 1
      expect(result.startColIndex).toBe(1);
      // offsetX = width of column 0 only
      expect(result.offsetX).toBe(100);
    });
  });

  describe('variable row heights via RowHeightCache', () => {
    it('uses the height cache for offsets and total height', () => {
      const cache = new RowHeightCache(40);
      cache.setHeights([40, 80, 40, 120, 40]);
      const result = engine.computeRowWindow({
        scrollTop: 0,
        viewportHeight: 200,
        rowHeight: 40,
        totalRows: 5,
        overscan: 0,
        heightCache: cache,
      });
      expect(result.startIndex).toBe(0);
      expect(result.totalHeight).toBe(40 + 80 + 40 + 120 + 40);
      expect(result.offsetY).toBe(0);
    });

    it('lands on the correct start row when scrolled into a tall row', () => {
      const cache = new RowHeightCache(40);
      cache.setHeights([40, 80, 40, 120, 40]);
      // offsets: [0, 40, 120, 160, 280, 320]
      // scrollTop 130 falls inside row index 2 (range 120..160)
      const result = engine.computeRowWindow({
        scrollTop: 130,
        viewportHeight: 100,
        rowHeight: 40,
        totalRows: 5,
        overscan: 0,
        heightCache: cache,
      });
      expect(result.startIndex).toBe(2);
      expect(result.offsetY).toBe(120);
    });
  });
});

describe('RowHeightCache', () => {
  it('builds a correct prefix-sum of offsets', () => {
    const cache = new RowHeightCache(40);
    cache.setHeights([10, 20, 30, 40]);
    expect(cache.getOffset(0)).toBe(0);
    expect(cache.getOffset(1)).toBe(10);
    expect(cache.getOffset(2)).toBe(30);
    expect(cache.getOffset(3)).toBe(60);
    expect(cache.getOffset(4)).toBe(100);
    expect(cache.getTotalHeight(4)).toBe(100);
  });

  it('returns the per-row height, falling back to default beyond the cache', () => {
    const cache = new RowHeightCache(50);
    cache.setHeights([10, 20]);
    expect(cache.getHeight(0)).toBe(10);
    expect(cache.getHeight(1)).toBe(20);
    expect(cache.getHeight(5)).toBe(50);
  });

  it('binary-searches the row index at a given offset', () => {
    const cache = new RowHeightCache(40);
    cache.setHeights([10, 20, 30, 40]); // offsets [0,10,30,60,100]
    expect(cache.getRowAtOffset(0, 4)).toBe(0);
    expect(cache.getRowAtOffset(9, 4)).toBe(0);
    expect(cache.getRowAtOffset(10, 4)).toBe(1);
    expect(cache.getRowAtOffset(35, 4)).toBe(2);
    expect(cache.getRowAtOffset(99, 4)).toBe(3);
  });

  it('extrapolates offsets beyond the cached range using the default height', () => {
    const cache = new RowHeightCache(40);
    cache.setHeights([100]); // offsets [0, 100]
    // index 3 → 100 + (3 - 1) * 40
    expect(cache.getOffset(3)).toBe(100 + 2 * 40);
  });

  it('returns 0 for an empty cache', () => {
    const cache = new RowHeightCache(40);
    cache.setHeights([]);
    expect(cache.getTotalHeight(0)).toBe(0);
    expect(cache.getRowAtOffset(100, 0)).toBe(0);
  });
});
