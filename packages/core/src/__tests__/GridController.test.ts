import { describe, it, expect, vi } from 'vitest';
import { GridController } from '../GridController.js';
import type { ColumnDef } from '../types/index.js';

type Row = { name: string; age: number; dept: string };

const columns: ColumnDef<Row>[] = [
  { field: 'name', headerName: 'Name', sortable: true, filterable: true },
  { field: 'age', headerName: 'Age', sortable: true },
  { field: 'dept', headerName: 'Department', groupable: true },
];

const rowData: Row[] = [
  { name: 'Alice', age: 30, dept: 'Engineering' },
  { name: 'Bob', age: 25, dept: 'Marketing' },
  { name: 'Charlie', age: 35, dept: 'Engineering' },
];

describe('GridController', () => {
  it('fires onGridReady on construction', () => {
    const onGridReady = vi.fn();
    new GridController({ columnDefs: columns, rowData, onGridReady });
    expect(onGridReady).toHaveBeenCalledOnce();
  });

  it('getSelectedRows returns empty initially', () => {
    const ctrl = new GridController({ columnDefs: columns, rowData });
    expect(ctrl.getSelectedRows()).toHaveLength(0);
  });

  it('setRowData updates visible rows', () => {
    const ctrl = new GridController({ columnDefs: columns, rowData });
    ctrl.setRowData([{ name: 'Dave', age: 40, dept: 'HR' }]);
    expect(ctrl.getVisibleRows()).toHaveLength(1);
  });

  it('setSortModel sorts rows', () => {
    const ctrl = new GridController({ columnDefs: columns, rowData });
    ctrl.setSortModel([{ colId: 'name', sort: 'asc' }]);
    const rows = ctrl.getVisibleRows();
    expect(rows[0]?.data.name).toBe('Alice');
    expect(rows[1]?.data.name).toBe('Bob');
    expect(rows[2]?.data.name).toBe('Charlie');
  });

  it('setFilterModel filters rows', () => {
    const ctrl = new GridController({ columnDefs: columns, rowData });
    ctrl.setFilterModel({ name: { type: 'text', operator: 'contains', value: 'ali' } });
    expect(ctrl.getVisibleRows()).toHaveLength(1);
    expect(ctrl.getVisibleRows()[0]?.data.name).toBe('Alice');
  });

  it('exportToCsv returns csv string', () => {
    const ctrl = new GridController({ columnDefs: columns, rowData });
    const csv = ctrl.exportToCsv();
    expect(csv).toContain('Name');
    expect(csv).toContain('Alice');
  });

  it('showColumn / hideColumn toggles visibility', () => {
    const ctrl = new GridController({
      columnDefs: [{ field: 'name' }, { field: 'age', hide: true }],
      rowData,
    });
    expect(ctrl.columnModel.getVisibleColumns()).toHaveLength(1);
    ctrl.showColumn('age');
    expect(ctrl.columnModel.getVisibleColumns()).toHaveLength(2);
    ctrl.hideColumn('name');
    expect(ctrl.columnModel.getVisibleColumns()).toHaveLength(1);
  });

  it('onSelectionChanged fires when selectRow is called', () => {
    const onSelectionChanged = vi.fn();
    const ctrl = new GridController({ columnDefs: columns, rowData, onSelectionChanged });
    ctrl.selectRow('row-0');
    expect(onSelectionChanged).toHaveBeenCalled();
  });

  it('onChanged listeners fire on data change', () => {
    const ctrl = new GridController({ columnDefs: columns, rowData });
    const listener = vi.fn();
    ctrl.onChanged(listener);
    ctrl.setRowData([...rowData]);
    expect(listener).toHaveBeenCalled();
  });

  it('onChanged unsubscribe works', () => {
    const ctrl = new GridController({ columnDefs: columns, rowData });
    const listener = vi.fn();
    const unsub = ctrl.onChanged(listener);
    unsub();
    ctrl.setRowData([...rowData]);
    expect(listener).not.toHaveBeenCalled();
  });

  it('setQuickFilter narrows rows across all columns', () => {
    const ctrl = new GridController({ columnDefs: columns, rowData });
    ctrl.setQuickFilter('marketing');
    expect(ctrl.getVisibleRows().map((r) => r.data.name)).toEqual(['Bob']);
    expect(ctrl.getQuickFilter()).toBe('marketing');
    ctrl.setQuickFilter('');
    expect(ctrl.getVisibleRows()).toHaveLength(3);
  });

  it('selectAll / deselectAll / getSelectedCount operate on visible rows', () => {
    const ctrl = new GridController({ columnDefs: columns, rowData });
    ctrl.selectAll();
    expect(ctrl.getSelectedCount()).toBe(3);
    expect(ctrl.isAllSelected()).toBe(true);
    ctrl.deselectAll();
    expect(ctrl.getSelectedCount()).toBe(0);
  });

  it('selectAll respects active filters', () => {
    const ctrl = new GridController({ columnDefs: columns, rowData });
    ctrl.setFilterModel({ dept: { type: 'set', operator: 'inSet', value: ['Engineering'] } });
    ctrl.selectAll();
    expect(ctrl.getSelectedCount()).toBe(2);
  });

  it('selectRange selects a contiguous block from the anchor', () => {
    const ctrl = new GridController({ columnDefs: columns, rowData });
    ctrl.selectRow('row-0');
    ctrl.selectRange('row-2');
    expect(ctrl.getSelectedCount()).toBe(3);
  });

  it('toggleSelectAll flips between all and none', () => {
    const ctrl = new GridController({ columnDefs: columns, rowData });
    ctrl.toggleSelectAll();
    expect(ctrl.isAllSelected()).toBe(true);
    ctrl.toggleSelectAll();
    expect(ctrl.getSelectedCount()).toBe(0);
  });
});
