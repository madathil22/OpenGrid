import React from 'react';
import type { ColumnDef, RowNode, RowData } from '@opengrid/core';
import { GridCell } from './GridCell.js';
import { GroupRow } from './GroupRow.js';

export interface GridRowProps<TData = RowData> {
  node: RowNode<TData>;
  columns: ColumnDef<TData>[];
  isSelected: boolean;
  rowHeight: number;
  offsetY: number;
  onClick: (node: RowNode<TData>, e: React.MouseEvent) => void;
  onGroupToggle: (groupId: string) => void;
  /** Map from colId → effective width */
  columnWidths?: Map<string, number>;
  /** Toggle this row's selection from a checkbox cell (shiftKey → range). */
  onCheckboxChange?: (node: RowNode<TData>, shiftKey: boolean) => void;
  /** Which pane this row is rendered in. Group/footer content renders only in
   * the center pane; pinned panes get a spacer to keep rows aligned. */
  pane?: 'left' | 'center' | 'right';
  /** All visible columns (for formatting group aggregates). */
  allColumns?: ColumnDef<TData>[];
}

export function GridRow<TData = RowData>({
  node,
  columns,
  isSelected,
  rowHeight,
  offsetY,
  onClick,
  onGroupToggle,
  columnWidths,
  onCheckboxChange,
  pane = 'center',
  allColumns,
}: GridRowProps<TData>) {
  const style: React.CSSProperties = {
    position: 'absolute',
    top: offsetY,
    left: 0,
    right: 0,
    height: rowHeight,
    display: 'flex',
    alignItems: 'center',
  };

  if (node.isGroup) {
    // Render the label + aggregates once (center pane); spacers elsewhere so the
    // pinned panes stay vertically aligned with the group/footer row.
    if (pane !== 'center') {
      const cls = node.isFooter ? 'og-row og-group-footer-row' : 'og-row og-group-row';
      return <div className={cls} style={style} role="row" aria-hidden />;
    }
    return (
      <GroupRow node={node} style={style} onToggle={onGroupToggle} columns={allColumns ?? columns} />
    );
  }

  return (
    <div
      className={`og-row${isSelected ? ' og-selected' : ''}`}
      style={style}
      role="row"
      aria-selected={isSelected}
      data-og-row-id={node.id}
      onClick={(e) => onClick(node, e)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(node, e as unknown as React.MouseEvent);
        }
      }}
    >
      {columns.map((col) =>
        col.checkboxSelection ? (
          <div
            key={col.field}
            className="og-cell og-checkbox-cell"
            style={{ width: columnWidths?.get(col.field) ?? col.width ?? 44 }}
            role="gridcell"
            onClick={(e) => {
              e.stopPropagation();
              onCheckboxChange?.(node, e.shiftKey);
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              readOnly
              tabIndex={-1}
              aria-label="Select row"
            />
          </div>
        ) : (
          <GridCell
            key={col.field}
            column={col}
            node={node}
            effectiveWidth={columnWidths?.get(col.field)}
          />
        ),
      )}
    </div>
  );
}
