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
});
