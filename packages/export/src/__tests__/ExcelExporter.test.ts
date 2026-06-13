import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { ExcelExporter } from '../ExcelExporter.js';

const columns = [
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'age', headerName: 'Age', width: 100 },
];

const rows = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
];

describe('ExcelExporter', () => {
  const exporter = new ExcelExporter();

  it('returns an ArrayBuffer', () => {
    const result = exporter.export({ columns, rows });
    expect(result).toBeInstanceOf(ArrayBuffer);
    expect((result as ArrayBuffer).byteLength).toBeGreaterThan(0);
  });

  it('produces readable xlsx with correct data', () => {
    const data = exporter.export({ columns, rows });
    const wb = XLSX.read(data, { type: 'array' });
    const sheet = wb.Sheets['Sheet1'];
    expect(sheet).toBeTruthy();
    const parsed = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet!);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]?.['Name']).toBe('Alice');
    expect(parsed[1]?.['Age']).toBe(25);
  });

  it('uses custom sheet name', () => {
    const data = exporter.export({ columns, rows, sheetName: 'Data' });
    const wb = XLSX.read(data, { type: 'array' });
    expect(wb.SheetNames).toContain('Data');
  });

  it('works without headers', () => {
    const data = exporter.export({ columns, rows, includeHeaders: false });
    const wb = XLSX.read(data, { type: 'array' });
    const sheet = wb.Sheets['Sheet1'];
    const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet!, { header: 1 }) as unknown[][];
    expect(raw[0]?.[0]).toBe('Alice');
  });
});
