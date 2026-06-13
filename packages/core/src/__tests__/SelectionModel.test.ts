import { describe, it, expect, beforeEach } from 'vitest';
import { SelectionModel } from '../models/SelectionModel.js';
import type { RowNode } from '../types/index.js';

type Row = { name: string };

function makeNodes(count: number): RowNode<Row>[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i}`,
    data: { name: `Row ${i}` },
    rowIndex: i,
    level: 0,
    expanded: false,
    isGroup: false,
  }));
}

describe('SelectionModel', () => {
  let model: SelectionModel<Row>;
  const nodes = makeNodes(5);

  beforeEach(() => {
    model = new SelectionModel<Row>('multiple');
  });

  it('selects a row', () => {
    model.selectRow('row-0');
    expect(model.isSelected('row-0')).toBe(true);
  });

  it('deselects a row', () => {
    model.selectRow('row-0');
    model.deselectRow('row-0');
    expect(model.isSelected('row-0')).toBe(false);
  });

  it('toggleRow selects then deselects', () => {
    model.toggleRow('row-1');
    expect(model.isSelected('row-1')).toBe(true);
    model.toggleRow('row-1');
    expect(model.isSelected('row-1')).toBe(false);
  });

  it('single mode clears previous selection', () => {
    model.setMode('single');
    model.selectRow('row-0');
    model.selectRow('row-1');
    expect(model.getSelectedIds()).toHaveLength(1);
    expect(model.getSelectedIds()[0]).toBe('row-1');
  });

  it('multiple mode with multi=false replaces selection', () => {
    model.selectRow('row-0');
    model.selectRow('row-1', false);
    expect(model.getSelectedIds()).toHaveLength(1);
  });

  it('multiple mode with multi=true adds to selection', () => {
    model.selectRow('row-0');
    model.selectRow('row-1', true);
    expect(model.getSelectedIds()).toHaveLength(2);
  });

  it('selectAll selects all provided ids', () => {
    const ids = nodes.map((n) => n.id);
    model.selectAll(ids);
    expect(model.getSelectedIds()).toHaveLength(5);
  });

  it('clearSelection empties selections', () => {
    model.selectAll(nodes.map((n) => n.id));
    model.clearSelection();
    expect(model.getSelectedIds()).toHaveLength(0);
  });

  it('getSelectedRows returns correct data', () => {
    model.selectRow('row-2');
    const selected = model.getSelectedRows(nodes);
    expect(selected).toHaveLength(1);
    expect(selected[0]?.name).toBe('Row 2');
  });

  it('false mode prevents selection', () => {
    model.setMode(false);
    model.selectRow('row-0');
    expect(model.getSelectedIds()).toHaveLength(0);
  });

  it('selectRange selects a contiguous block by anchor/target', () => {
    const ids = nodes.map((n) => n.id);
    model.selectRange(ids, 'row-1', 'row-3');
    expect(model.getSelectedIds().sort()).toEqual(['row-1', 'row-2', 'row-3']);
  });

  it('getSelectedCount reflects selection size', () => {
    model.selectRow('row-0');
    model.selectRow('row-1', true);
    expect(model.getSelectedCount()).toBe(2);
  });

  it('isAllSelected / isIndeterminate over a set', () => {
    const ids = nodes.map((n) => n.id);
    expect(model.isAllSelected(ids)).toBe(false);
    model.selectRow('row-0', true);
    expect(model.isIndeterminate(ids)).toBe(true);
    expect(model.isAllSelected(ids)).toBe(false);
    model.selectAll(ids);
    expect(model.isAllSelected(ids)).toBe(true);
    expect(model.isIndeterminate(ids)).toBe(false);
  });

  it('toggleAll selects then deselects the whole set', () => {
    const ids = nodes.map((n) => n.id);
    model.toggleAll(ids);
    expect(model.isAllSelected(ids)).toBe(true);
    model.toggleAll(ids);
    expect(model.getSelectedCount()).toBe(0);
  });

  it('toggleAll is a no-op in single mode', () => {
    model.setMode('single');
    model.toggleAll(nodes.map((n) => n.id));
    expect(model.getSelectedCount()).toBe(0);
  });

  it('deselectAll clears everything', () => {
    model.selectAll(nodes.map((n) => n.id));
    model.deselectAll();
    expect(model.getSelectedCount()).toBe(0);
  });
});
