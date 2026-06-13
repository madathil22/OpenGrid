import React from 'react';
import type { RowNode, RowData } from '@opengrid/core';

export interface GroupRowProps<TData = RowData> {
  node: RowNode<TData>;
  style?: React.CSSProperties;
  onToggle: (groupId: string) => void;
}

export function GroupRow<TData = RowData>({ node, style, onToggle }: GroupRowProps<TData>) {
  const indent = node.level * 16;

  return (
    <div
      className="og-row og-group-row"
      style={style}
      role="row"
      aria-expanded={node.expanded}
    >
      <div
        className="og-cell og-group-cell"
        style={{ paddingLeft: indent + 8 }}
        role="gridcell"
      >
        <button
          className="og-group-toggle"
          onClick={() => onToggle(node.id)}
          aria-label={node.expanded ? 'Collapse group' : 'Expand group'}
          type="button"
        >
          {node.expanded ? '▾' : '▸'}
        </button>
        <span className="og-group-key">{node.groupKey ?? ''}</span>
        {node.aggData != null && (
          <span className="og-agg-data">
            {Object.entries(node.aggData)
              .map(([k, v]) => `${k}: ${String(v)}`)
              .join(' | ')}
          </span>
        )}
      </div>
    </div>
  );
}
