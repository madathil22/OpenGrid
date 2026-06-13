import React, { useState } from 'react';
import type { ColumnDef, RowData, GridController } from '@opengrid/core';

export interface FilterRowProps<TData = RowData> {
  columns: ColumnDef<TData>[];
  api: GridController<TData>;
}

export function FilterRow<TData = RowData>({ columns, api }: FilterRowProps<TData>) {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleChange = (colId: string, value: string) => {
    const next = { ...values, [colId]: value };
    setValues(next);

    if (value.trim() === '') {
      api.filterModel.removeFilter(colId);
      // Rebuild filter model
      const model = api.filterModel.getFilters();
      api.setFilterModel(model);
    } else {
      api.setFilterModel({
        ...api.getFilterModel(),
        [colId]: { type: 'text', operator: 'contains', value },
      });
    }
  };

  return (
    <div className="og-filter-row" role="row">
      {columns.map((col) => (
        <div
          key={col.field}
          className="og-header-cell og-filter-cell"
          style={{ width: col.width ?? 150 }}
        >
          {col.filterable ? (
            <input
              type="text"
              className="og-filter-input"
              placeholder={`Filter ${col.headerName ?? col.field}...`}
              value={values[col.field] ?? ''}
              onChange={(e) => handleChange(col.field, e.target.value)}
              aria-label={`Filter by ${col.headerName ?? col.field}`}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
