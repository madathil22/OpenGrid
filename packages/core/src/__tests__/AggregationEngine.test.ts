import { describe, it, expect } from 'vitest';
import { aggregations, aggregate } from '../engines/AggregationEngine.js';

describe('AggregationEngine', () => {
  it('sum adds numbers', () => {
    expect(aggregations.sum([1, 2, 3, 4])).toBe(10);
  });

  it('sum ignores non-numbers', () => {
    expect(aggregations.sum([1, 'x', null, 2])).toBe(3);
  });

  it('count returns array length', () => {
    expect(aggregations.count([1, 2, 3])).toBe(3);
    expect(aggregations.count([])).toBe(0);
  });

  it('min returns minimum', () => {
    expect(aggregations.min([5, 3, 8, 1])).toBe(1);
  });

  it('max returns maximum', () => {
    expect(aggregations.max([5, 3, 8, 1])).toBe(8);
  });

  it('avg computes average', () => {
    expect(aggregations.avg([10, 20, 30])).toBe(20);
  });

  it('avg on empty array returns null', () => {
    expect(aggregations.avg([])).toBeNull();
  });

  it('aggregate function dispatches correctly', () => {
    expect(aggregate('sum', [1, 2, 3])).toBe(6);
    expect(aggregate('count', [1, 2])).toBe(2);
    expect(aggregate('min', [5, 3, 9])).toBe(3);
    expect(aggregate('max', [5, 3, 9])).toBe(9);
    expect(aggregate('avg', [10, 30])).toBe(20);
  });
});
