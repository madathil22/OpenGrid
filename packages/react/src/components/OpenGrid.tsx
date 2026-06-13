import React, { useCallback, useMemo } from 'react';
import type { GridOptions, RowData, RowNode, ColumnDef } from '@opengrid/core';
import { RowHeightCache } from '@opengrid/core';
import { useGrid } from '../hooks/useGrid.js';
import { useVirtualScroll } from '../hooks/useVirtualScroll.js';
import { GridHeader } from './GridHeader.js';
import { GridRow } from './GridRow.js';
import { FilterRow } from './FilterRow.js';

export interface OpenGridProps<TData = RowData> extends GridOptions<TData> {
  /** Height of the grid viewport in px (default: 500) */
  height?: number;
  /** Width of the grid (default: '100%') */
  width?: number | string;
  /** Show inline filter row below header (default: false) */
  showFilterRow?: boolean;
}

export function OpenGrid<TData = RowData>({
  height = 500,
  width = '100%',
  showFilterRow = false,
  rowHeight = 40,
  headerHeight = 40,
  ...options
}: OpenGridProps<TData>) {
  const { api, columnDefs, visibleRows, sortModel, selectedRows } = useGrid<TData>({
    rowHeight,
    headerHeight,
    ...options,
  });

  // Build height cache if getRowHeight is provided
  const heightCache = useMemo<RowHeightCache | undefined>(() => {
    if (!options.getRowHeight) return undefined;
    const cache = new RowHeightCache(rowHeight);
    const heights = visibleRows.map((node, i) =>
      options.getRowHeight!({ data: node.data, rowIndex: i }),
    );
    cache.setHeights(heights);
    return cache;
  }, [options.getRowHeight, visibleRows, rowHeight]);

  const filterRowHeight = showFilterRow ? headerHeight : 0;
  const viewportHeight = height - headerHeight - filterRowHeight;

  const { startIndex, endIndex, totalHeight, offsetY, scrollLeft, onScroll, containerRef } =
    useVirtualScroll({
      totalRows: visibleRows.length,
      rowHeight,
      viewportHeight,
      overscan: 5,
      heightCache,
    });

  // Build effective column widths map
  const columnWidths = useMemo<Map<string, number>>(() => {
    const map = new Map<string, number>();
    for (const col of columnDefs) {
      map.set(col.field, api.columnModel.getEffectiveWidth(col.field));
    }
    return map;
  }, [columnDefs, api.columnModel, selectedRows]); // selectedRows triggers re-render on column changes too

  // Pinned column groups
  const pinnedLeft = useMemo(() => api.columnModel.getPinnedLeftColumns(), [columnDefs, api.columnModel]);
  const pinnedRight = useMemo(() => api.columnModel.getPinnedRightColumns(), [columnDefs, api.columnModel]);
  const centerCols = useMemo(() => api.columnModel.getCenterColumns(), [columnDefs, api.columnModel]);

  const pinnedLeftWidth = useMemo(
    () => pinnedLeft.reduce((sum, col) => sum + (columnWidths.get(col.field) ?? col.width ?? 150), 0),
    [pinnedLeft, columnWidths],
  );
  const pinnedRightWidth = useMemo(
    () => pinnedRight.reduce((sum, col) => sum + (columnWidths.get(col.field) ?? col.width ?? 150), 0),
    [pinnedRight, columnWidths],
  );
  const centerTotalWidth = useMemo(
    () => centerCols.reduce((sum, col) => sum + (columnWidths.get(col.field) ?? col.width ?? 150), 0),
    [centerCols, columnWidths],
  );

  const selectedIds = useMemo(() => {
    return new Set(api.selectionModel.getSelectedIds());
  }, [selectedRows, api.selectionModel]);

  const handleRowClick = useCallback(
    (node: RowNode<TData>, e: React.MouseEvent) => {
      const multi = e.shiftKey || e.ctrlKey || e.metaKey;
      api.toggleRow(node.id, multi);
    },
    [api],
  );

  const handleGroupToggle = useCallback(
    (groupId: string) => {
      api.toggleGroupExpand(groupId);
    },
    [api],
  );

  const visibleSlice = visibleRows.slice(startIndex, endIndex + 1);

  // Helper: compute row top offset for a given absolute index
  const getRowOffsetY = useCallback(
    (absoluteIndex: number): number => {
      if (heightCache) {
        return heightCache.getOffset(absoluteIndex);
      }
      return absoluteIndex * rowHeight;
    },
    [heightCache, rowHeight],
  );

  // Helper: compute single row height
  const getRowH = useCallback(
    (absoluteIndex: number): number => {
      if (heightCache) {
        return heightCache.getHeight(absoluteIndex);
      }
      return rowHeight;
    },
    [heightCache, rowHeight],
  );

  /** Render a pane of rows for a given column set */
  const renderRows = (cols: ColumnDef<TData>[], paneOffsetX: number) =>
    visibleSlice.map((node, i) => {
      const absoluteIndex = startIndex + i;
      const rowOffsetY = getRowOffsetY(absoluteIndex) - getRowOffsetY(startIndex) + offsetY;
      const rh = getRowH(absoluteIndex);
      return (
        <GridRow
          key={node.id}
          node={node}
          columns={cols}
          isSelected={selectedIds.has(node.id)}
          rowHeight={rh}
          offsetY={rowOffsetY}
          onClick={handleRowClick}
          onGroupToggle={handleGroupToggle}
          columnWidths={columnWidths}
        />
      );
    });

  return (
    <div
      className="og-grid"
      style={{ width, height, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      role="grid"
    >
      {/* Header area */}
      <div style={{ height: headerHeight + filterRowHeight, flexShrink: 0, display: 'flex', overflow: 'hidden' }}>
        {/* Pinned left header */}
        {pinnedLeft.length > 0 && (
          <div
            className="og-pinned-left-header"
            style={{ width: pinnedLeftWidth, flexShrink: 0, overflow: 'hidden', zIndex: 2 }}
          >
            <GridHeader columns={pinnedLeft} sortModel={sortModel} api={api} columnWidths={columnWidths} />
            {showFilterRow && <FilterRow columns={pinnedLeft} api={api} />}
          </div>
        )}

        {/* Center header (clipped, scrolled via transform) */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div style={{ transform: `translateX(-${scrollLeft}px)`, width: centerTotalWidth, minWidth: '100%' }}>
            <GridHeader columns={centerCols} sortModel={sortModel} api={api} columnWidths={columnWidths} />
            {showFilterRow && <FilterRow columns={centerCols} api={api} />}
          </div>
        </div>

        {/* Pinned right header */}
        {pinnedRight.length > 0 && (
          <div
            className="og-pinned-right-header"
            style={{ width: pinnedRightWidth, flexShrink: 0, overflow: 'hidden', zIndex: 2 }}
          >
            <GridHeader columns={pinnedRight} sortModel={sortModel} api={api} columnWidths={columnWidths} />
            {showFilterRow && <FilterRow columns={pinnedRight} api={api} />}
          </div>
        )}
      </div>

      {/* Body area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Pinned left body */}
        {pinnedLeft.length > 0 && (
          <div
            className="og-pinned-left-body"
            style={{
              width: pinnedLeftWidth,
              flexShrink: 0,
              overflowY: 'hidden',
              overflowX: 'hidden',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{ height: totalHeight, position: 'relative' }}>
              {renderRows(pinnedLeft, 0)}
            </div>
          </div>
        )}

        {/* Center scrollable body */}
        <div
          className="og-body"
          ref={containerRef}
          style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', position: 'relative' }}
          onScroll={onScroll}
          role="rowgroup"
        >
          <div style={{ height: totalHeight, width: centerTotalWidth, position: 'relative' }}>
            {renderRows(centerCols, 0)}
          </div>
        </div>

        {/* Pinned right body */}
        {pinnedRight.length > 0 && (
          <div
            className="og-pinned-right-body"
            style={{
              width: pinnedRightWidth,
              flexShrink: 0,
              overflowY: 'hidden',
              overflowX: 'hidden',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{ height: totalHeight, position: 'relative' }}>
              {renderRows(pinnedRight, 0)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
