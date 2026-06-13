import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGrid } from '../hooks/useGrid.js';
import type { ColumnDef } from '@opengrid/core';

type Row = { name: string; age: number };

const columns: ColumnDef<Row>[] = [
  { field: 'name', headerName: 'Name', sortable: true },
  { field: 'age', headerName: 'Age' },
];

const rowData: Row[] = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
];

describe('useGrid', () => {
  it('initialises with correct row count', () => {
    const { result } = renderHook(() => useGrid({ columnDefs: columns, rowData }));
    expect(result.current.visibleRows).toHaveLength(2);
  });

  it('returns stable api reference', () => {
    const { result, rerender } = renderHook(() => useGrid({ columnDefs: columns, rowData }));
    const first = result.current.api;
    rerender();
    expect(result.current.api).toBe(first);
  });

  it('updates visibleRows when sort model changes', () => {
    const { result } = renderHook(() => useGrid({ columnDefs: columns, rowData }));
    act(() => {
      result.current.api.setSortModel([{ colId: 'name', sort: 'desc' }]);
    });
    expect(result.current.visibleRows[0]?.data.name).toBe('Bob');
  });

  it('updates visibleRows when filter applied', () => {
    const { result } = renderHook(() => useGrid({ columnDefs: columns, rowData }));
    act(() => {
      result.current.api.setFilterModel({ name: { type: 'text', operator: 'contains', value: 'ali' } });
    });
    expect(result.current.visibleRows).toHaveLength(1);
  });

  it('returns selected rows after selection', () => {
    const { result } = renderHook(() => useGrid({ columnDefs: columns, rowData }));
    act(() => {
      result.current.api.selectRow('row-0');
    });
    expect(result.current.selectedRows).toHaveLength(1);
  });
});
