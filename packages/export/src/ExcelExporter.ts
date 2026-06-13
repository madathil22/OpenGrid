import * as XLSX from 'xlsx';

export interface ExcelColumn {
  field: string;
  headerName?: string;
  width?: number;
}

export interface ExcelRow {
  [key: string]: unknown;
}

export interface ExcelExportOptions {
  columns: ExcelColumn[];
  rows: ExcelRow[];
  sheetName?: string;
  fileName?: string;
  includeHeaders?: boolean;
}

export class ExcelExporter {
  export(options: ExcelExportOptions): ArrayBuffer {
    const {
      columns,
      rows,
      sheetName = 'Sheet1',
      includeHeaders = true,
    } = options;

    const wsData: unknown[][] = [];

    if (includeHeaders) {
      wsData.push(columns.map((col) => col.headerName ?? col.field));
    }

    for (const row of rows) {
      wsData.push(columns.map((col) => row[col.field] ?? ''));
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = columns.map((col) => ({ wch: col.width ? Math.floor(col.width / 7) : 20 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const output = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
    return output;
  }

  downloadExcel(options: ExcelExportOptions): void {
    if (typeof document === 'undefined') return;
    const { fileName = 'export.xlsx' } = options;
    const data = this.export(options);
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
