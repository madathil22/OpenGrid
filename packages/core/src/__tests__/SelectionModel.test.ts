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
});
