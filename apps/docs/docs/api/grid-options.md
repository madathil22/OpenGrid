---
sidebar_position: 2
---

# Grid Options

`GridOptions<TData>` is passed to `<OpenGrid>` as props or to `new GridController()`.

## Interface

```typescript
interface GridOptions<TData> {
  rowData?: TData[];
  columnDefs?: ColumnDef<TData>[];
  rowHeight?: number;           // default: 40
  headerHeight?: number;        // default: 40
  pagination?: boolean;
  pageSize?: number;
  grouping?: boolean;
  groupFields?: string[];       // fields to group by
  selection?: 'single' | 'multiple' | 'range' | false;
  onSelectionChanged?: (event: SelectionChangedEvent<TData>) => void;
  onSortChanged?: (model: SortModel[]) => void;
  onFilterChanged?: (model: FilterModel) => void;
  onColumnResized?: (colId: string, width: number) => void;
  onColumnMoved?: (colId: string, toIndex: number) => void;
  onGridReady?: (event: GridReadyEvent<TData>) => void;
}
```

## React Component props

`<OpenGrid>` extends `GridOptions` with:

```typescript
interface OpenGridProps<TData> extends GridOptions<TData> {
  height?: number;         // viewport height in px (default: 500)
  width?: number | string; // default: '100%'
  showFilterRow?: boolean; // inline filter inputs (default: false)
}
```

## Example

```tsx
<OpenGrid<Employee>
  columnDefs={columns}
  rowData={employees}
  rowHeight={40}
  height={600}
  selection="multiple"
  showFilterRow
  onGridReady={({ api }) => {
    // store api for later use
    gridApiRef.current = api;
  }}
  onSelectionChanged={({ selectedRows }) => {
    console.log('Selected:', selectedRows);
  }}
/>
```
