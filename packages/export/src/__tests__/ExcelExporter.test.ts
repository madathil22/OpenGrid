import { describe, it, expect, vi } from 'vitest';
import * as XLSX from 'xlsx';
import { ExcelExporter } from '../ExcelExporter.js';
import type { ExcelWriter } from '../ExcelExporter.js';

const columns = [
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'age', headerName: 'Age', width: 100 },
];

const rows = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
];

describe('ExcelExporter (default SheetJS writer)', () => {
  const exporter = new ExcelExporter();

  it('returns an ArrayBuffer', async () => {
    const result = await exporter.export({ columns, rows });
    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBeGreaterThan(0);
  });

  it('produces readable xlsx with correct data', async () => {
    const data = await exporter.export({ columns, rows });
    const wb = XLSX.read(data, { type: 'array' });
    const sheet = wb.Sheets['Sheet1'];
    expect(sheet).toBeTruthy();
    const parsed = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet!);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]?.['Name']).toBe('Alice');
    expect(parsed[1]?.['Age']).toBe(25);
  });

  it('uses custom sheet name', async () => {
    const data = await exporter.export({ columns, rows, sheetName: 'Data' });
    const wb = XLSX.read(data, { type: 'array' });
    expect(wb.SheetNames).toContain('Data');
  });

  it('works without headers', async () => {
    const data = await exporter.export({ columns, rows, includeHeaders: false });
    const wb = XLSX.read(data, { type: 'array' });
    const sheet = wb.Sheets['Sheet1'];
    const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet!, { header: 1 });
    expect(raw[0]?.[0]).toBe('Alice');
  });
});

describe('ExcelExporter (swappable writer)', () => {
  it('delegates to a custom writer and never touches xlsx', async () => {
    const writer: ExcelWriter = vi.fn(() => new ArrayBuffer(8));
    const exporter = new ExcelExporter(writer);

    const result = await exporter.export({ columns, rows, sheetName: 'Custom' });

    expect(result.byteLength).toBe(8);
    expect(writer).toHaveBeenCalledTimes(1);
    const sheet = (writer as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]![0] as {
      sheetName: string;
      aoa: unknown[][];
      colWidths: number[];
    };
    expect(sheet.sheetName).toBe('Custom');
    // header row + 2 data rows
    expect(sheet.aoa).toHaveLength(3);
    expect(sheet.aoa[0]).toEqual(['Name', 'Age']);
    expect(sheet.colWidths).toHaveLength(2);
  });

  it('supports async custom writers', async () => {
    const writer: ExcelWriter = async () => {
      await Promise.resolve();
      return new ArrayBuffer(16);
    };
    const exporter = new ExcelExporter(writer);
    const result = await exporter.export({ columns, rows });
    expect(result.byteLength).toBe(16);
  });
});
