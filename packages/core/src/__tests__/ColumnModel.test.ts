import { describe, it, expect, beforeEach } from 'vitest';
import { ColumnModel } from '../models/ColumnModel.js';
import type { ColumnDef } from '../types/index.js';

type Row = { name: string; age: number; city: string };

const sampleCols: ColumnDef<Row>[] = [
  { field: 'name', headerName: 'Name', width: 200, sortable: true },
  { field: 'age', headerName: 'Age', width: 100 },
  { field: 'city', headerName: 'City', width: 150, hide: true },
];

describe('ColumnModel', () => {
  let model: ColumnModel<Row>;

  beforeEach(() => {
    model = new ColumnModel<Row>();
    model.setColumns(sampleCols);
  });

  it('returns all columns', () => {
    expect(model.getColumns()).toHaveLength(3);
  });

  it('filters hidden columns from getVisibleColumns', () => {
    const visible = model.getVisibleColumns();
    expect(visible).toHaveLength(2);
    expect(visible.map((c) => c.field)).not.toContain('city');
  });

  it('shows a hidden column', () => {
    model.showColumn('city');
    expect(model.getVisibleColumns()).toHaveLength(3);
  });

  it('hides a visible column', () => {
    model.hideColumn('name');
    const visible = model.getVisibleColumns();
    expect(visible.map((c) => c.field)).not.toContain('name');
  });

  it('getColumnById returns correct column', () => {
    expect(model.getColumnById('age')?.field).toBe('age');
    expect(model.getColumnById('nope')).toBeUndefined();
  });

  it('moves a column', () => {
    model.moveColumn('city', 0);
    expect(model.getColumns()[0]?.field).toBe('city');
  });

  it('resizes a column and clamps to minWidth', () => {
    const colsWithMin: ColumnDef<Row>[] = [
      { field: 'name', minWidth: 100, width: 200 },
    ];
    model.setColumns(colsWithMin);
    model.resizeColumn('name', 50); // below min
    const state = model.getColumnState();
    expect(state[0]?.width).toBe(100);
  });

  it('getColumnState returns state for all columns', () => {
    const states = model.getColumnState();
    expect(states).toHaveLength(3);
    expect(states[2]?.colId).toBe('city');
    expect(states[2]?.hide).toBe(true);
  });

  it('setColumnState restores state', () => {
    model.setColumnState([{ colId: 'name', width: 300, hide: false, pinned: null }]);
    const state = model.getColumnState().find((s) => s.colId === 'name');
    expect(state?.width).toBe(300);
  });
});
