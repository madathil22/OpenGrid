import type { ColumnDef, RowNode, RowData } from '../types/index.js';

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? '');
  // Escape if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getFieldValue(data: unknown, field: string): unknown {
  if (data != null && typeof data === 'object') {
    return (data as Record<string, unknown>)[field];
  }
  return undefined;
}

export class ExportEngine<TData = RowData> {
  toCsv(params: {
    columns: ColumnDef<TData>[];
    rows: RowNode<TData>[];
    includeHeaders?: boolean;
  }): string {
    const { columns, rows, includeHeaders = true } = params;
    const lines: string[] = [];

    if (includeHeaders) {
      const headerLine = columns
        .map((col) => escapeCsvCell(col.headerName ?? col.field))
        .join(',');
      lines.push(headerLine);
    }

    for (const node of rows) {
      if (node.isGroup) {
        // Export group row as a label row
        const groupLine = columns
          .map((col, i) => (i === 0 ? escapeCsvCell(node.groupKey ?? '') : ''))
          .join(',');
        lines.push(groupLine);
        continue;
      }

      const rowLine = columns
        .map((col) => {
          let value: unknown;
          if (col.valueGetter) {
            value = col.valueGetter({ data: node.data, colDef: col });
          } else {
            value = getFieldValue(node.data, col.field);
          }
          if (col.valueFormatter) {
            value = col.valueFormatter({ value, data: node.data, colDef: col });
          }
          return escapeCsvCell(value);
        })
        .join(',');

      lines.push(rowLine);
    }

    return lines.join('\n');
  }
}
