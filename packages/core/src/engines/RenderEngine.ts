export interface RowWindowParams {
  scrollTop: number;
  viewportHeight: number;
  rowHeight: number;
  totalRows: number;
  overscan?: number;
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
    const { scrollTop, viewportHeight, rowHeight, totalRows, overscan = 3 } = params;

    if (totalRows === 0 || rowHeight <= 0) {
      return { startIndex: 0, endIndex: 0, offsetY: 0, totalHeight: 0 };
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
    let offsetX = 0;
    let foundStart = false;

    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (!col) continue;
      const colWidth = col.width ?? 150;
      const colEnd = accumulated + colWidth;

      if (!foundStart && colEnd > scrollLeft) {
        startColIndex = Math.max(0, i - overscan);
        offsetX = startColIndex * 0; // will recalculate below
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
    let computedOffsetX = 0;
    for (let i = 0; i < startColIndex; i++) {
      const col = columns[i];
      computedOffsetX += col?.width ?? 150;
    }
    offsetX = computedOffsetX;

    return { startColIndex, endColIndex, offsetX };
  }
}
