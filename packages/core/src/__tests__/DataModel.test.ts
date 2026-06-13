import { describe, it, expect, beforeEach } from 'vitest';
import { DataModel } from '../models/DataModel.js';

type Row = { name: string; value: number };

const rows: Row[] = [
  { name: 'Alice', value: 10 },
  { name: 'Bob', value: 20 },
  { name: 'Charlie', value: 30 },
];

describe('DataModel', () => {
  let model: DataModel<Row>;

  beforeEach(() => {
    model = new DataModel<Row>();
    model.setData(rows);
  });

  it('stores and retrieves raw data', () => {
    expect(model.getData()).toHaveLength(3);
    expect(model.getData()[0]?.name).toBe('Alice');
  });

  it('creates row nodes with correct ids', () => {
    const nodes = model.getRowNodes();
    expect(nodes).toHaveLength(3);
    expect(nodes[0]?.id).toBe('row-0');
    expect(nodes[0]?.isGroup).toBe(false);
    expect(nodes[0]?.level).toBe(0);
  });

  it('getRowCount returns correct count', () => {
    expect(model.getRowCount()).toBe(3);
  });

  it('getRowNode returns correct node', () => {
    expect(model.getRowNode(1)?.data.name).toBe('Bob');
    expect(model.getRowNode(99)).toBeUndefined();
  });

  it('updateRow modifies data in place', () => {
    model.updateRow(0, { value: 99 });
    expect(model.getRowNode(0)?.data.value).toBe(99);
  });

  it('replaces data on setData', () => {
    model.setData([{ name: 'Dave', value: 5 }]);
    expect(model.getRowCount()).toBe(1);
    expect(model.getData()[0]?.name).toBe('Dave');
  });
});
