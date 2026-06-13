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

/** Normalised sheet payload handed to an {@link ExcelWriter}. */
export interface ExcelSheetData {
  sheetName: string;
  /** Array-of-arrays. The first row is the header row when headers are included. */
  aoa: unknown[][];
  /** Column widths, in characters. */
  colWidths: number[];
}

/**
 * Pluggable engine that turns sheet data into an `.xlsx` byte buffer.
 *
 * Pass a custom writer to {@link ExcelExporter} to swap the underlying library
 * (e.g. ExcelJS, or a maintained SheetJS build) — no `xlsx` dependency required.
 */
export type ExcelWriter = (sheet: ExcelSheetData) => ArrayBuffer | Promise<ArrayBuffer>;

let cachedDefaultWriter: ExcelWriter | null = null;

/**
 * Lazily resolves the built-in SheetJS-backed writer. `xlsx` is an *optional*
 * peer dependency: it is only imported the first time Excel export actually
 * runs, and only when no custom writer was supplied.
 */
async function getDefaultWriter(): Promise<ExcelWriter> {
  if (cachedDefaultWriter) return cachedDefaultWriter;

  let XLSX: typeof import('xlsx');
  try {
    XLSX = await import('xlsx');
  } catch {
    throw new Error(
      '@opengrid/export: Excel export requires the optional "xlsx" peer dependency. ' +
        'Install it with `npm install xlsx`, or pass a custom ExcelWriter to ' +
        '`new ExcelExporter(writer)`.',
    );
  }

  cachedDefaultWriter = ({ sheetName, aoa, colWidths }) => {
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = colWidths.map((wch) => ({ wch }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  };

  return cachedDefaultWriter;
}

export class ExcelExporter {
  /**
   * @param writer Optional custom writer. When omitted, a SheetJS-backed writer
   * is lazily loaded from the optional `xlsx` peer dependency.
   */
  constructor(private readonly writer?: ExcelWriter) {}

  async export(options: ExcelExportOptions): Promise<ArrayBuffer> {
    const { columns, rows, sheetName = 'Sheet1', includeHeaders = true } = options;

    const aoa: unknown[][] = [];
    if (includeHeaders) {
      aoa.push(columns.map((col) => col.headerName ?? col.field));
    }
    for (const row of rows) {
      aoa.push(columns.map((col) => row[col.field] ?? ''));
    }

    const colWidths = columns.map((col) => (col.width ? Math.floor(col.width / 7) : 20));

    const writer = this.writer ?? (await getDefaultWriter());
    return writer({ sheetName, aoa, colWidths });
  }

  async downloadExcel(options: ExcelExportOptions): Promise<void> {
    if (typeof document === 'undefined') return;
    const { fileName = 'export.xlsx' } = options;
    const data = await this.export(options);
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
