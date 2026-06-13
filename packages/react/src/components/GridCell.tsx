import React from 'react';
import type { ColumnDef, RowNode, RowData } from '@opengrid/core';

export interface GridCellProps<TData = RowData> {
  column: ColumnDef<TData>;
  node: RowNode<TData>;
  style?: React.CSSProperties;
}

function getFieldValue(data: unknown, field: string): unknown {
  if (data != null && typeof data === 'object') {
    return (data as Record<string, unknown>)[field];
  }
  return undefined;
}

export function GridCell<TData = RowData>({ column, node, style }: GridCellProps<TData>) {
  let value: unknown;

  if (column.valueGetter) {
    value = column.valueGetter({ data: node.data, colDef: column });
  } else {
    value = getFieldValue(node.data, column.field);
  }

  let displayValue: React.ReactNode;

  if (column.cellRenderer) {
    const rendered = column.cellRenderer({
      value,
      data: node.data,
      colDef: column,
      rowIndex: node.rowIndex,
    });
    if (typeof rendered === 'string') {
      displayValue = rendered;
    } else {
      // HTMLElement — convert to string representation for React
      displayValue = rendered.outerHTML;
    }
  } else if (column.valueFormatter) {
    displayValue = column.valueFormatter({ value, data: node.data, colDef: column });
  } else {
    displayValue = value != null ? String(value) : '';
  }

  return (
    <div
      className="og-cell"
      style={{
        width: column.width ?? 150,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
        ...style,
      }}
      role="gridcell"
    >
      {displayValue}
    </div>
  );
}
