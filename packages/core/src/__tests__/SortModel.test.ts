import { describe, it, expect, beforeEach } from 'vitest';
import { SortModel } from '../models/SortModel.js';
import type { RowNode, ColumnDef } from '../types/index.js';

type Row = { name: string; age: number };

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

const cols: ColumnDef<Row>[] = [
  { field: 'name' },
  { field: 'age' },
];

describe('SortModel', () => {
  let model: SortModel<Row>;

  beforeEach(() => {
    model = new SortModel<Row>();
  });

  it('adds and retrieves sorts', () => {
    model.addSort('name', 'asc');
    expect(model.getSorts()).toHaveLength(1);
    expect(model.getSorts()[0]?.sort).toBe('asc');
  });

  it('removes a sort', () => {
    model.addSort('name', 'asc');
    model.addSort('age', 'desc');
    model.removeSort('name');
    expect(model.getSorts()).toHaveLength(1);
    expect(model.getSorts()[0]?.colId).toBe('age');
  });

  it('clearSorts removes all', () => {
    model.addSort('name', 'asc');
    model.clearSorts();
    expect(model.getSorts()).toHaveLength(0);
  });

  it('sorts rows ascending by string', () => {
    model.addSort('name', 'asc');
    const nodes = makeNodes([
      { name: 'Charlie', age: 3 },
      { name: 'Alice', age: 1 },
      { name: 'Bob', age: 2 },
    ]);
    const sorted = model.applySorting(nodes, cols);
    expect(sorted.map((n) => n.data.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('sorts rows descending by number', () => {
    model.addSort('age', 'desc');
    const nodes = makeNodes([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 20 },
      { name: 'Charlie', age: 25 },
    ]);
    const sorted = model.applySorting(nodes, cols);
    expect(sorted.map((n) => n.data.age)).toEqual([30, 25, 20]);
  });

  it('does not mutate original array', () => {
    model.addSort('name', 'asc');
    const nodes = makeNodes([{ name: 'Z', age: 1 }, { name: 'A', age: 2 }]);
    const original = nodes.map((n) => n.data.name);
    model.applySorting(nodes, cols);
    expect(nodes.map((n) => n.data.name)).toEqual(original);
  });

  it('multi-column sort respects sortIndex order', () => {
    model.addSort('age', 'asc');
    model.addSort('name', 'asc');
    const nodes = makeNodes([
      { name: 'Bob', age: 30 },
      { name: 'Alice', age: 30 },
      { name: 'Carol', age: 20 },
    ]);
    const sorted = model.applySorting(nodes, cols);
    // primary: age asc → 20 first; secondary: name asc within age 30
    expect(sorted.map((n) => `${n.data.age}-${n.data.name}`)).toEqual([
      '20-Carol',
      '30-Alice',
      '30-Bob',
    ]);
  });

  it('sorts nulls/blanks to the end regardless of direction', () => {
    const nodes = makeNodes([
      { name: 'Bob', age: 2 },
      { name: '', age: 1 },
      { name: 'Alice', age: 3 },
    ]);
    model.addSort('name', 'asc');
    expect(model.applySorting(nodes, cols).map((n) => n.data.name)).toEqual(['Alice', 'Bob', '']);
    model.clearSorts();
    model.addSort('name', 'desc');
    expect(model.applySorting(nodes, cols).map((n) => n.data.name)).toEqual(['Bob', 'Alice', '']);
  });

  it('uses a custom comparator when provided', () => {
    // Sort by name length instead of lexicographically
    const lenCols: ColumnDef<Row>[] = [
      { field: 'name', comparator: (a, b) => String(a).length - String(b).length },
      { field: 'age' },
    ];
    model.addSort('name', 'asc');
    const nodes = makeNodes([
      { name: 'aaaa', age: 1 },
      { name: 'a', age: 2 },
      { name: 'aa', age: 3 },
    ]);
    const sorted = model.applySorting(nodes, lenCols);
    expect(sorted.map((n) => n.data.name)).toEqual(['a', 'aa', 'aaaa']);
  });

  it('sorts within expanded group children', () => {
    const groupNode: RowNode<Row> = {
      id: 'g-0',
      data: {} as Row,
      rowIndex: 0,
      level: 0,
      expanded: true,
      isGroup: true,
      groupKey: 'g',
      children: makeNodes([
        { name: 'Charlie', age: 3 },
        { name: 'Alice', age: 1 },
      ]),
    };
    model.addSort('name', 'asc');
    const [sortedGroup] = model.applySorting([groupNode], cols);
    expect(sortedGroup?.children?.map((c) => c.data.name)).toEqual(['Alice', 'Charlie']);
  });
});
