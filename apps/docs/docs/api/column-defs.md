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
  flex?: number;             // flex-grow factor for remaining width
  autoSize?: boolean;        // size width to fit content
  cellRenderer?: (params: CellRendererParams<TData>) => string | HTMLElement;
  valueGetter?: (params: ValueGetterParams<TData>) => unknown;
  valueFormatter?: (params: ValueFormatterParams<TData>) => string;
  aggFunc?: 'sum' | 'count' | 'min' | 'max' | 'avg';
  groupable?: boolean;       // can be used as a group-by field
}
```

## Pinned columns

Set `pinned: 'left'` or `pinned: 'right'` to lock a column to the edge of the
grid. Pinned columns render in their own sticky panes and are never affected by
horizontal scrolling or column virtualization, so they stay visible at all times.

```tsx
const columns: ColumnDef<Employee>[] = [
  { field: 'id', width: 70, pinned: 'left' },
  { field: 'name', width: 180, pinned: 'left' },
  { field: 'department', width: 160 },
  { field: 'salary', width: 140 },
  { field: 'active', width: 90, pinned: 'right' },
];
```

The pin can also be changed at runtime via `api.getColumnState()` /
`api.setColumnState()`.

## Flex columns

Give a column a `flex` factor to have it grow to fill the space left over after
fixed-width columns are laid out. Flex space is divided in proportion to each
column's `flex` value, and respects `minWidth` / `maxWidth`.

```tsx
const columns: ColumnDef<Employee>[] = [
  { field: 'id', width: 80 },        // fixed
  { field: 'name', flex: 1 },        // gets 1/4 of remaining space
  { field: 'description', flex: 3 }, // gets 3/4 of remaining space
];
```

Call `api.applyFlexWidths(viewportWidth)` after mount (or on resize) to apply.

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
