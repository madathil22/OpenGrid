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

  describe('pinned column groups', () => {
    beforeEach(() => {
      model = new ColumnModel<Row>();
      model.setColumns([
        { field: 'name', width: 200, pinned: 'left' },
        { field: 'age', width: 100 },
        { field: 'city', width: 150 },
        { field: 'actions', width: 80, pinned: 'right' },
      ]);
    });

    it('splits columns into left / center / right groups', () => {
      expect(model.getPinnedLeftColumns().map((c) => c.field)).toEqual(['name']);
      expect(model.getCenterColumns().map((c) => c.field)).toEqual(['age', 'city']);
      expect(model.getPinnedRightColumns().map((c) => c.field)).toEqual(['actions']);
    });

    it('respects runtime pin state over the column def', () => {
      model.setPinned('age', 'left');
      expect(model.getPinnedLeftColumns().map((c) => c.field)).toEqual(['name', 'age']);
      expect(model.getCenterColumns().map((c) => c.field)).toEqual(['city']);
    });

    it('excludes hidden columns from all groups', () => {
      model.hideColumn('name');
      expect(model.getPinnedLeftColumns()).toHaveLength(0);
    });
  });

  describe('applyFlexWidths', () => {
    beforeEach(() => {
      model = new ColumnModel<Row>();
    });

    it('distributes remaining width across flex columns by ratio', () => {
      model.setColumns([
        { field: 'name', width: 100 },
        { field: 'age', flex: 1 },
        { field: 'city', flex: 3 },
      ]);
      // available 500, fixed 100 → 400 remaining, split 1:3 → 100 / 300
      model.applyFlexWidths(500);
      expect(model.getEffectiveWidth('age')).toBe(100);
      expect(model.getEffectiveWidth('city')).toBe(300);
    });

    it('clamps a flex column to its minWidth', () => {
      model.setColumns([
        { field: 'name', width: 400 },
        { field: 'age', flex: 1, minWidth: 120 },
      ]);
      // remaining = 50, but minWidth forces 120
      model.applyFlexWidths(450);
      expect(model.getEffectiveWidth('age')).toBe(120);
    });

    it('is a no-op when no columns are flex', () => {
      model.setColumns([{ field: 'name', width: 100 }]);
      model.applyFlexWidths(800);
      expect(model.getEffectiveWidth('name')).toBe(100);
    });
  });

  it('autoSizeColumn sets the measured width', () => {
    model.autoSizeColumn('name', 275);
    expect(model.getEffectiveWidth('name')).toBe(275);
  });
});
