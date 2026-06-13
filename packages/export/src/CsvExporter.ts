export interface CsvColumn {
  field: string;
  headerName?: string;
}

export interface CsvRow {
  [key: string]: unknown;
}

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export interface CsvExportOptions {
  columns: CsvColumn[];
  rows: CsvRow[];
  includeHeaders?: boolean;
  delimiter?: string;
  lineEnding?: '\n' | '\r\n';
}

export class CsvExporter {
  export(options: CsvExportOptions): string {
    const {
      columns,
      rows,
      includeHeaders = true,
      delimiter = ',',
      lineEnding = '\n',
    } = options;

    const lines: string[] = [];

    if (includeHeaders) {
      const header = columns.map((col) => escapeCsvCell(col.headerName ?? col.field)).join(delimiter);
      lines.push(header);
    }

    for (const row of rows) {
      const line = columns
        .map((col) => escapeCsvCell(row[col.field]))
        .join(delimiter);
      lines.push(line);
    }

    return lines.join(lineEnding);
  }

  downloadCsv(csvString: string, fileName = 'export.csv'): void {
    if (typeof document === 'undefined') return;
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
