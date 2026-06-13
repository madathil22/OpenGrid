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

  it('text notContains and notEqual', () => {
    model.setFilter('name', { type: 'text', operator: 'notContains', value: 'li' });
    expect(model.applyFilters(nodes, cols).map((n) => n.data.name)).toEqual(['Bob']);
    model.clearFilters();
    model.setFilter('name', { type: 'text', operator: 'notEqual', value: 'Alice' });
    expect(model.applyFilters(nodes, cols).map((n) => n.data.name)).toEqual(['Bob', 'Charlie']);
  });

  it('text blank / notBlank', () => {
    const withBlank = makeNodes([
      { name: '', age: 1, city: 'X', joined: '2020-01-01' },
      { name: 'Bob', age: 2, city: 'Y', joined: '2020-01-01' },
    ]);
    model.setFilter('name', { type: 'text', operator: 'blank' });
    expect(model.applyFilters(withBlank, cols)).toHaveLength(1);
    model.clearFilters();
    model.setFilter('name', { type: 'text', operator: 'notBlank' });
    expect(model.applyFilters(withBlank, cols).map((n) => n.data.name)).toEqual(['Bob']);
  });

  it('number >=, <=, notEqual', () => {
    model.setFilter('age', { type: 'number', operator: 'greaterThanOrEqual', value: 30 });
    expect(model.applyFilters(nodes, cols).map((n) => n.data.age)).toEqual([30, 35]);
    model.clearFilters();
    model.setFilter('age', { type: 'number', operator: 'lessThanOrEqual', value: 30 });
    expect(model.applyFilters(nodes, cols).map((n) => n.data.age)).toEqual([30, 25]);
    model.clearFilters();
    model.setFilter('age', { type: 'number', operator: 'notEqual', value: 30 });
    expect(model.applyFilters(nodes, cols).map((n) => n.data.age)).toEqual([25, 35]);
  });

  it('date before/after/between', () => {
    model.setFilter('joined', { type: 'date', operator: 'after', value: '2020-06-01' });
    expect(model.applyFilters(nodes, cols).map((n) => n.data.name)).toEqual(['Charlie']);
    model.clearFilters();
    model.setFilter('joined', {
      type: 'date',
      operator: 'between',
      value: '2019-01-01',
      valueTo: '2020-12-31',
    });
    expect(model.applyFilters(nodes, cols).map((n) => n.data.name)).toEqual(['Alice', 'Bob']);
  });

  it('custom predicate filter', () => {
    model.setFilter('age', {
      type: 'custom',
      predicate: ({ value }) => typeof value === 'number' && value % 2 === 1,
    });
    // 30 even, 25 odd, 35 odd
    expect(model.applyFilters(nodes, cols).map((n) => n.data.age)).toEqual([25, 35]);
  });

  it('combines column filters with AND', () => {
    model.setFilter('city', { type: 'set', operator: 'inSet', value: ['London'] });
    model.setFilter('age', { type: 'number', operator: 'greaterThan', value: 32 });
    expect(model.applyFilters(nodes, cols).map((n) => n.data.name)).toEqual(['Charlie']);
  });

  it('quick filter matches across all columns', () => {
    model.setQuickFilter('paris');
    expect(model.applyFilters(nodes, cols).map((n) => n.data.name)).toEqual(['Bob']);
    model.setQuickFilter('london');
    expect(model.applyFilters(nodes, cols)).toHaveLength(2);
    model.setQuickFilter('');
    expect(model.applyFilters(nodes, cols)).toHaveLength(3);
  });

  it('quick filter combines with column filters (AND)', () => {
    model.setFilter('city', { type: 'set', operator: 'inSet', value: ['London'] });
    model.setQuickFilter('charlie');
    expect(model.applyFilters(nodes, cols).map((n) => n.data.name)).toEqual(['Charlie']);
  });

  it('getUniqueValues returns distinct cell values', () => {
    expect(model.getUniqueValues(nodes, 'city')).toEqual(['London', 'Paris']);
  });
});
