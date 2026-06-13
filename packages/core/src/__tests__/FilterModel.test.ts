import { describe, it, expect, beforeEach } from 'vitest';
import { FilterModel } from '../models/FilterModel.js';
import type { RowNode, ColumnDef } from '../types/index.js';

type Row = { name: string; age: number; city: string; joined: string };

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
  { field: 'city' },
  { field: 'joined' },
];

const data: Row[] = [
  { name: 'Alice', age: 30, city: 'London', joined: '2020-01-01' },
  { name: 'Bob', age: 25, city: 'Paris', joined: '2019-06-15' },
  { name: 'Charlie', age: 35, city: 'London', joined: '2021-03-20' },
];

describe('FilterModel', () => {
  let model: FilterModel<Row>;
  let nodes: RowNode<Row>[];

  beforeEach(() => {
    model = new FilterModel<Row>();
    nodes = makeNodes(data);
  });

  it('passes all rows when no filters', () => {
    expect(model.applyFilters(nodes, cols)).toHaveLength(3);
  });

  it('text contains filter', () => {
    model.setFilter('name', { type: 'text', operator: 'contains', value: 'li' });
    const result = model.applyFilters(nodes, cols);
    expect(result.map((n) => n.data.name)).toEqual(['Alice', 'Charlie']);
  });

  it('text equals filter (case insensitive)', () => {
    model.setFilter('name', { type: 'text', operator: 'equals', value: 'ALICE' });
    const result = model.applyFilters(nodes, cols);
    expect(result).toHaveLength(1);
  });

  it('text startsWith filter', () => {
    model.setFilter('name', { type: 'text', operator: 'startsWith', value: 'bo' });
    const result = model.applyFilters(nodes, cols);
    expect(result[0]?.data.name).toBe('Bob');
  });

  it('number greaterThan filter', () => {
    model.setFilter('age', { type: 'number', operator: 'greaterThan', value: 28 });
    const result = model.applyFilters(nodes, cols);
    expect(result.map((n) => n.data.age)).toEqual([30, 35]);
  });

  it('number between filter', () => {
    model.setFilter('age', { type: 'number', operator: 'between', value: 26, valueTo: 32 });
    const result = model.applyFilters(nodes, cols);
    expect(result.map((n) => n.data.age)).toEqual([30]);
  });

  it('set filter', () => {
    model.setFilter('city', { type: 'set', operator: 'inSet', value: ['London'] });
    const result = model.applyFilters(nodes, cols);
    expect(result).toHaveLength(2);
  });

  it('removeFilter works', () => {
    model.setFilter('name', { type: 'text', operator: 'equals', value: 'Alice' });
    model.removeFilter('name');
    expect(model.applyFilters(nodes, cols)).toHaveLength(3);
  });

  it('clearFilters removes all', () => {
    model.setFilter('name', { type: 'text', operator: 'equals', value: 'Alice' });
    model.setFilter('age', { type: 'number', operator: 'greaterThan', value: 100 });
    model.clearFilters();
    expect(model.applyFilters(nodes, cols)).toHaveLength(3);
  });

  it('getFilters returns current state', () => {
    model.setFilter('name', { type: 'text', operator: 'contains', value: 'x' });
    expect(model.getFilters()).toHaveProperty('name');
  });
});
