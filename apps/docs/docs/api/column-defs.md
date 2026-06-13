---
sidebar_position: 1
---

# Column Definitions

Each column in OpenGrid is described by a `ColumnDef<TData>` object.

## Interface

```typescript
interface ColumnDef<TData> {
  field: string;             // key of TData to read
  headerName?: string;       // label shown in the header
  width?: number;            // fixed width (px)
  minWidth?: number;         // minimum width during resize (px)
  maxWidth?: number;         // maximum width during resize (px)
  sortable?: boolean;        // enable click-to-sort
  filterable?: boolean;      // show inline filter input
  resizable?: boolean;       // enable drag-to-resize (default true)
  pinned?: 'left' | 'right'; // pin column to edge
  hide?: boolean;            // initially hidden
  cellRenderer?: (params: CellRendererParams<TData>) => string | HTMLElement;
  valueGetter?: (params: ValueGetterParams<TData>) => unknown;
  valueFormatter?: (params: ValueFormatterParams<TData>) => string;
  aggFunc?: 'sum' | 'count' | 'min' | 'max' | 'avg';
  groupable?: boolean;       // can be used as a group-by field
}
```

## Example

```tsx
const columns: ColumnDef<Employee>[] = [
  {
    field: 'name',
    headerName: 'Full Name',
    width: 200,
    sortable: true,
    filterable: true,
  },
  {
    field: 'salary',
    headerName: 'Salary',
    width: 140,
    sortable: true,
    aggFunc: 'avg',
    valueFormatter: ({ value }) =>
      typeof value === 'number' ? `$${value.toLocaleString()}` : '',
  },
  {
    field: 'score',
    headerName: 'Score',
    cellRenderer: ({ value }) => {
      const pct = Number(value) * 100;
      return `<div style="background: hsl(${pct}, 80%, 50%); padding: 2px 6px; border-radius: 4px">${pct.toFixed(0)}%</div>`;
    },
  },
];
```

## valueGetter

Use `valueGetter` when the display value does not map directly to a single field:

```tsx
{
  field: 'fullName',
  headerName: 'Full Name',
  valueGetter: ({ data }) => `${data.firstName} ${data.lastName}`,
}
```

## cellRenderer

`cellRenderer` receives `{ value, data, colDef, rowIndex }` and returns either a string (rendered as text content) or an `HTMLElement`.
