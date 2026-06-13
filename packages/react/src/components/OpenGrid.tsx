import React, { useCallback } from 'react';
import type { GridOptions, RowData, RowNode } from '@opengrid/core';
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

  const viewportHeight = height - headerHeight - (showFilterRow ? headerHeight : 0);

  const { startIndex, endIndex, totalHeight, offsetY, onScroll, containerRef } =
    useVirtualScroll({
      totalRows: visibleRows.length,
      rowHeight,
      viewportHeight,
      overscan: 5,
    });

  const selectedIds = new Set(selectedRows.map((_, i) => {
    // We need to find ids from visible rows; use selection model directly
    return api.selectionModel.getSelectedIds();
  }).flat());

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

  return (
    <div
      className="og-grid"
      style={{ width, height, display: 'flex', flexDirection: 'column' }}
      role="grid"
    >
      {/* Header */}
      <div style={{ height: headerHeight, flexShrink: 0, overflow: 'hidden' }}>
        <GridHeader columns={columnDefs} sortModel={sortModel} api={api} />
        {showFilterRow && <FilterRow columns={columnDefs} api={api} />}
      </div>

      {/* Body */}
      <div
        className="og-body"
        ref={containerRef}
        style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', position: 'relative' }}
        onScroll={onScroll}
        role="rowgroup"
      >
        {/* Total height spacer for virtual scroll */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleSlice.map((node, i) => {
            const absoluteIndex = startIndex + i;
            const rowOffsetY = offsetY + i * rowHeight;
            return (
              <GridRow
                key={node.id}
                node={node}
                columns={columnDefs}
                isSelected={selectedIds.has(node.id)}
                rowHeight={rowHeight}
                offsetY={rowOffsetY}
                onClick={handleRowClick}
                onGroupToggle={handleGroupToggle}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
