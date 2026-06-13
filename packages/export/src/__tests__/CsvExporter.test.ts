import { describe, it, expect } from 'vitest';
import { CsvExporter } from '../CsvExporter.js';

const columns = [
  { field: 'name', headerName: 'Name' },
  { field: 'age', headerName: 'Age' },
  { field: 'city', headerName: 'City' },
];

const rows = [
  { name: 'Alice', age: 30, city: 'London' },
  { name: 'Bob', age: 25, city: 'Paris' },
];

describe('CsvExporter', () => {
  const exporter = new CsvExporter();

  it('generates header + data rows', () => {
    const csv = exporter.export({ columns, rows });
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Name,Age,City');
    expect(lines[1]).toBe('Alice,30,London');
    expect(lines[2]).toBe('Bob,25,Paris');
  });

  it('skips header when includeHeaders=false', () => {
    const csv = exporter.export({ columns, rows, includeHeaders: false });
    expect(csv.startsWith('Alice')).toBe(true);
  });

  it('escapes commas', () => {
    const csv = exporter.export({
      columns,
      rows: [{ name: 'Smith, Jane', age: 30, city: 'London' }],
    });
    expect(csv).toContain('"Smith, Jane"');
  });

  it('escapes double quotes', () => {
    const csv = exporter.export({
      columns,
      rows: [{ name: 'Say "Hello"', age: 30, city: 'London' }],
    });
    expect(csv).toContain('"Say ""Hello"""');
  });

  it('supports custom delimiter', () => {
    const csv = exporter.export({ columns, rows, delimiter: ';', includeHeaders: false });
    expect(csv.split('\n')[0]).toBe('Alice;30;London');
  });

  it('handles null/undefined values', () => {
    const csv = exporter.export({
      columns,
      rows: [{ name: null, age: undefined, city: 'London' }],
      includeHeaders: false,
    });
    expect(csv).toBe(',,London');
  });
});
