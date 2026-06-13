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
    return <GroupRow node={node} style={style} onToggle={onGroupToggle} />;
  }

  return (
    <div
      className={`og-row${isSelected ? ' og-selected' : ''}`}
      style={style}
      role="row"
      aria-selected={isSelected}
      onClick={(e) => onClick(node, e)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(node, e as unknown as React.MouseEvent);
        }
      }}
    >
      {columns.map((col) => (
        <GridCell
          key={col.field}
          column={col}
          node={node}
          effectiveWidth={columnWidths?.get(col.field)}
        />
      ))}
    </div>
  );
}
