import { describe, it, expect } from 'vitest';
import { RenderEngine } from '../engines/RenderEngine.js';

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
  });
});
