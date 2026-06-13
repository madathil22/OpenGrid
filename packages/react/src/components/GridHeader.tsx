import React, { useRef, useCallback } from 'react';
import type { ColumnDef, RowData, GridController, SortModel } from '@opengrid/core';

export interface GridHeaderProps<TData = RowData> {
  columns: ColumnDef<TData>[];
  sortModel: SortModel[];
  api: GridController<TData>;
  /** Map from colId → effective width */
  columnWidths?: Map<string, number>;
  /** Select-all checkbox state (for a checkboxSelection column). */
  allSelected?: boolean;
  indeterminate?: boolean;
  onToggleAll?: () => void;
}

export function GridHeader<TData = RowData>({
  columns,
  sortModel,
  api,
  columnWidths,
  allSelected = false,
  indeterminate = false,
  onToggleAll,
}: GridHeaderProps<TData>) {
  const dragSourceRef = useRef<string | null>(null);

  const getSortDirection = (colId: string): 'asc' | 'desc' | null => {
    const entry = sortModel.find((s) => s.colId === colId);
    return entry?.sort ?? null;
  };

  const handleSortClick = useCallback(
    (col: ColumnDef<TData>, e: React.MouseEvent) => {
      if (!col.sortable) return;
      const current = getSortDirection(col.field);
      // Tri-state cycle: none → asc → desc → none.
      const next: 'asc' | 'desc' | null =
        current === 'asc' ? 'desc' : current === 'desc' ? null : 'asc';
      const multi = e.shiftKey;
      if (multi) {
        const currentModel = api.getSortModel().filter((s) => s.colId !== col.field);
        if (next) {
          api.setSortModel([...currentModel, { colId: col.field, sort: next }]);
        } else {
          api.setSortModel(currentModel);
        }
      } else if (next) {
        api.setSortModel([{ colId: col.field, sort: next }]);
      } else {
        api.setSortModel([]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api, sortModel],
  );

  const handleResizeMouseDown = useCallback(
    (col: ColumnDef<TData>, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startWidth = api.columnModel.getEffectiveWidth(col.field);

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX;
        api.resizeColumn(col.field, startWidth + delta);
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [api],
  );

  const handleDragStart = useCallback((colId: string) => {
    dragSourceRef.current = colId;
  }, []);

  const handleDrop = useCallback(
    (targetColId: string) => {
      if (!dragSourceRef.current || dragSourceRef.current === targetColId) return;
      const cols = api.columnModel.getColumns();
      const targetIndex = cols.findIndex((c) => c.field === targetColId);
      api.moveColumn(dragSourceRef.current, targetIndex);
      dragSourceRef.current = null;
    },
    [api],
  );

  return (
    <div className="og-header" role="row">
      {columns.map((col) => {
        if (col.checkboxSelection) {
          return (
            <div
              key={col.field}
              className="og-header-cell og-checkbox-cell"
              style={{ width: columnWidths?.get(col.field) ?? col.width ?? 44 }}
              role="columnheader"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAll?.();
              }}
            >
              <input
                type="checkbox"
                checked={allSelected}
                readOnly
                tabIndex={-1}
                aria-label="Select all rows"
                ref={(el) => {
                  if (el) el.indeterminate = indeterminate;
                }}
              />
            </div>
          );
        }
        const sort = getSortDirection(col.field);
        return (
          <div
            key={col.field}
            className={`og-header-cell${sort ? ` og-sort-${sort}` : ''}`}
            style={{ width: columnWidths?.get(col.field) ?? col.width ?? 150, minWidth: col.minWidth, maxWidth: col.maxWidth }}
            role="columnheader"
            aria-sort={sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : 'none'}
            onClick={(e) => handleSortClick(col, e)}
            draggable
            onDragStart={() => handleDragStart(col.field)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.field)}
          >
            <span className="og-header-label">{col.headerName ?? col.field}</span>
            {sort && (
              <span className="og-sort-indicator" aria-hidden>
                {sort === 'asc' ? ' ↑' : ' ↓'}
              </span>
            )}
            {col.resizable !== false && (
              <div
                className="og-resize-handle"
                onMouseDown={(e) => handleResizeMouseDown(col, e)}
                role="separator"
                aria-orientation="vertical"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
