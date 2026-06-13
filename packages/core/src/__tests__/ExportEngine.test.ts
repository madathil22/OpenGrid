import { describe, it, expect } from 'vitest';
import { ExportEngine } from '../engines/ExportEngine.js';
import type { ColumnDef, RowNode } from '../types/index.js';

type Row = { name: string; age: number; city: string };

const columns: ColumnDef<Row>[] = [
  { field: 'name', headerName: 'Name' },
  { field: 'age', headerName: 'Age' },
  { field: 'city', headerName: 'City' },
];

function makeNodes(rows: Row[]): RowNode<Row>[] {
  return rows.map((data, i) => ({
    id: `row-${i}`,
    data,
    rowIndex: i,
    level: 0,
    expanded: false,
    isGroup: false,
  }));
}

describe('ExportEngine', () => {
  const engine = new ExportEngine<Row>();

  it('generates header row', () => {
    const csv = engine.toCsv({ columns, rows: makeNodes([]), includeHeaders: true });
    expect(csv).toBe('Name,Age,City');
  });

  it('generates data rows', () => {
    const nodes = makeNodes([
      { name: 'Alice', age: 30, city: 'London' },
      { name: 'Bob', age: 25, city: 'Paris' },
    ]);
    const csv = engine.toCsv({ columns, rows: nodes, includeHeaders: false });
    expect(csv).toBe('Alice,30,London\nBob,25,Paris');
  });

  it('escapes commas in values', () => {
    const nodes = makeNodes([{ name: 'Smith, John', age: 30, city: 'London' }]);
    const csv = engine.toCsv({ columns, rows: nodes, includeHeaders: false });
    expect(csv).toContain('"Smith, John"');
  });

  it('escapes quotes in values', () => {
    const nodes = makeNodes([{ name: 'Say "Hi"', age: 30, city: 'London' }]);
    const csv = engine.toCsv({ columns, rows: nodes, includeHeaders: false });
    expect(csv).toContain('"Say ""Hi"""');
  });

  it('includes headers by default', () => {
    const csv = engine.toCsv({ columns, rows: makeNodes([]) });
    expect(csv.split('\n')[0]).toBe('Name,Age,City');
  });
});
