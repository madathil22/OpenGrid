import React from 'react';
import type { ColumnDef, RowNode, RowData } from '@opengrid/core';

export interface GroupRowProps<TData = RowData> {
  node: RowNode<TData>;
  style?: React.CSSProperties;
  onToggle: (groupId: string) => void;
  /** Visible columns, used to label + format aggregated values. */
  columns?: ColumnDef<TData>[];
}

function formatAgg<TData>(col: ColumnDef<TData>, value: unknown): string {
  if (value == null) return '';
  if (col.valueFormatter) {
    return col.valueFormatter({ value, data: {} as TData, colDef: col });
  }
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
}

export function GroupRow<TData = RowData>({ node, style, onToggle, columns }: GroupRowProps<TData>) {
  const indent = node.level * 16;
  const isFooter = node.isFooter ?? false;

  // Build the formatted aggregate summary from columns that declare an aggFunc.
  const aggParts: string[] = [];
  if (node.aggData && columns) {
    for (const col of columns) {
      const value = node.aggData[col.field];
      if (value === undefined) continue;
      aggParts.push(`${col.headerName ?? col.field}: ${formatAgg(col, value)}`);
    }
  }

  const label = node.isGrandTotal
    ? 'Grand Total'
    : isFooter
      ? `Total — ${node.groupKey ?? ''}`
      : (node.groupKey ?? '');

  return (
    <div
      className={`og-row ${isFooter ? 'og-group-footer-row' : 'og-group-row'}`}
      style={style}
      role="row"
      aria-expanded={isFooter ? undefined : node.expanded}
    >
      <div className="og-cell og-group-cell" style={{ paddingLeft: indent + 8 }} role="gridcell">
        {!isFooter && (
          <button
            className="og-group-toggle"
            onClick={() => onToggle(node.id)}
            aria-label={node.expanded ? 'Collapse group' : 'Expand group'}
            type="button"
          >
            {node.expanded ? '▾' : '▸'}
          </button>
        )}
        <span className="og-group-key">
          {label}
          {!isFooter && node.childCount != null && (
            <span className="og-group-count"> ({node.childCount})</span>
          )}
        </span>
        {aggParts.length > 0 && <span className="og-agg-data">{aggParts.join('  ·  ')}</span>}
      </div>
    </div>
  );
}
