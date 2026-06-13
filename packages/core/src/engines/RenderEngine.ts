export class RowHeightCache {
  private heights: number[] = [];
  private offsets: number[] = []; // prefix sum: offsets[i] = sum of heights[0..i-1]
  private defaultHeight: number;

  constructor(defaultHeight = 40) {
    this.defaultHeight = defaultHeight;
  }

  setHeights(heights: number[]): void {
    this.heights = [...heights];
    this.offsets = new Array<number>(heights.length + 1);
    this.offsets[0] = 0;
    for (let i = 0; i < heights.length; i++) {
      this.offsets[i + 1] = (this.offsets[i] ?? 0) + (heights[i] ?? this.defaultHeight);
    }
  }

  setDefaultHeight(h: number): void {
    this.defaultHeight = h;
  }

  getHeight(index: number): number {
    if (index < this.heights.length) {
      return this.heights[index] ?? this.defaultHeight;
    }
    return this.defaultHeight;
  }

  getOffset(index: number): number {
    if (index < this.offsets.length) {
      return this.offsets[index] ?? 0;
    }
    // For rows beyond the cached range, extrapolate
    const lastOffset = this.offsets[this.offsets.length - 1] ?? 0;
    const extra = index - (this.offsets.length - 1);
    return lastOffset + extra * this.defaultHeight;
  }

  getTotalHeight(count: number): number {
    if (count === 0) return 0;
    return this.getOffset(count);
  }

  /** Binary search → row index at given scrollTop */
  getRowAtOffset(scrollTop: number, count: number): number {
    if (count === 0) return 0;
    let lo = 0;
    let hi = count - 1;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.getOffset(mid + 1) <= scrollTop) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }
}

export interface RowWindowParams {
  scrollTop: number;
  viewportHeight: number;
  rowHeight: number;
  totalRows: number;
  overscan?: number;
  heightCache?: RowHeightCache;
}

export interface RowWindowResult {
  startIndex: number;
  endIndex: number;
  offsetY: number;
  totalHeight: number;
}

export interface ColumnWindowParams {
  scrollLeft: number;
  viewportWidth: number;
  columns: { width: number }[];
  overscan?: number;
}

export interface ColumnWindowResult {
  startColIndex: number;
  endColIndex: number;
  offsetX: number;
}

export class RenderEngine {
  computeRowWindow(params: RowWindowParams): RowWindowResult {
    const { scrollTop, viewportHeight, rowHeight, totalRows, overscan = 3, heightCache } = params;

    if (totalRows === 0 || rowHeight <= 0) {
      return { startIndex: 0, endIndex: 0, offsetY: 0, totalHeight: 0 };
    }

    if (heightCache) {
      const totalHeight = heightCache.getTotalHeight(totalRows);
      const rawStart = heightCache.getRowAtOffset(scrollTop, totalRows);
      const startIndex = Math.max(0, rawStart - overscan);

      // Find endIndex: walk forward from rawStart until we exceed viewport
      let accumulated = heightCache.getOffset(rawStart) - scrollTop;
      let rawEnd = rawStart;
      while (rawEnd < totalRows - 1 && accumulated < viewportHeight) {
        rawEnd++;
        accumulated += heightCache.getHeight(rawEnd);
      }
      const endIndex = Math.min(totalRows - 1, rawEnd + overscan);
      const offsetY = heightCache.getOffset(startIndex);
      return { startIndex, endIndex, offsetY, totalHeight };
    }

    const totalHeight = totalRows * rowHeight;
    const rawStart = Math.floor(scrollTop / rowHeight);
    const startIndex = Math.max(0, rawStart - overscan);
    const visibleCount = Math.ceil(viewportHeight / rowHeight);
    const rawEnd = rawStart + visibleCount;
    const endIndex = Math.min(totalRows - 1, rawEnd + overscan);
    const offsetY = startIndex * rowHeight;

    return { startIndex, endIndex, offsetY, totalHeight };
  }

  computeColumnWindow(params: ColumnWindowParams): ColumnWindowResult {
    const { scrollLeft, viewportWidth, columns, overscan = 2 } = params;

    if (columns.length === 0) {
      return { startColIndex: 0, endColIndex: 0, offsetX: 0 };
    }

    let accumulated = 0;
    let startColIndex = 0;
    let endColIndex = columns.length - 1;
    let foundStart = false;

    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (!col) continue;
      const colWidth = col.width ?? 150;
      const colEnd = accumulated + colWidth;

      if (!foundStart && colEnd > scrollLeft) {
        startColIndex = Math.max(0, i - overscan);
        foundStart = true;
      }

      if (accumulated > scrollLeft + viewportWidth) {
        endColIndex = Math.min(columns.length - 1, i + overscan);
        break;
      }

      accumulated += colWidth;
    }

    if (!foundStart) {
      startColIndex = 0;
    }

    // Compute offsetX as sum of widths before startColIndex
    let offsetX = 0;
    for (let i = 0; i < startColIndex; i++) {
      const col = columns[i];
      offsetX += col?.width ?? 150;
    }

    return { startColIndex, endColIndex, offsetX };
  }
}
