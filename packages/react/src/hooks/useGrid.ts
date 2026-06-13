import { useState, useEffect, useRef, useCallback } from 'react';
import { GridController } from '@opengrid/core';
import type {
  GridOptions,
  RowData,
  ColumnDef,
  RowNode,
  SortModel,
  FilterModel,
} from '@opengrid/core';

export interface UseGridReturn<TData> {
  api: GridController<TData>;
  columnDefs: ColumnDef<TData>[];
  visibleRows: RowNode<TData>[];
  sortModel: SortModel[];
  filterModel: FilterModel<TData>;
  selectedRows: TData[];
}

export function useGrid<TData = RowData>(options: GridOptions<TData>): UseGridReturn<TData> {
  const controllerRef = useRef<GridController<TData> | null>(null);

  // Create controller once
  if (!controllerRef.current) {
    controllerRef.current = new GridController<TData>(options);
  }

  const api = controllerRef.current;

  const [columnDefs, setColumnDefs] = useState<ColumnDef<TData>[]>(
    () => api.columnModel.getVisibleColumns(),
  );
  const [visibleRows, setVisibleRows] = useState<RowNode<TData>[]>(
    () => api.getVisibleRows(),
  );
  const [sortModel, setSortModel] = useState<SortModel[]>(() => api.getSortModel());
  const [filterModel, setFilterModel] = useState<FilterModel<TData>>(() => api.getFilterModel());
  const [selectedRows, setSelectedRows] = useState<TData[]>(() => api.getSelectedRows());

  const syncState = useCallback(() => {
    setColumnDefs([...api.columnModel.getVisibleColumns()]);
    setVisibleRows([...api.getVisibleRows()]);
    setSortModel(api.getSortModel());
    setFilterModel(api.getFilterModel());
    setSelectedRows(api.getSelectedRows());
  }, [api]);

  useEffect(() => {
    const unsubscribe = api.onChanged(syncState);
    return unsubscribe;
  }, [api, syncState]);

  // When options change (rowData / columnDefs), push updates into the controller
  useEffect(() => {
    if (options.rowData !== undefined) {
      api.setRowData(options.rowData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.rowData]);

  useEffect(() => {
    if (options.columnDefs !== undefined) {
      api.setColumnDefs(options.columnDefs);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.columnDefs]);

  return { api, columnDefs, visibleRows, sortModel, filterModel, selectedRows };
}
