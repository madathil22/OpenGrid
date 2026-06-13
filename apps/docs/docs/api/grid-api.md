---
sidebar_position: 3
---

# Grid API

The `GridApi<TData>` is returned by `onGridReady` and by `useGrid().api`.

## Interface

```typescript
interface GridApi<TData> {
  // Data
  getSelectedRows(): TData[];
  setRowData(data: TData[]): void;
  setColumnDefs(defs: ColumnDef<TData>[]): void;

  // Export
  exportToCsv(params?: { fileName?: string; includeHeaders?: boolean }): string;

  // Layout
  sizeColumnsToFit(viewportWidth: number): void;

  // Filtering
  setFilterModel(model: FilterModel): void;
  getFilterModel(): FilterModel;

  // Sorting
  setSortModel(model: SortModel[]): void;
  getSortModel(): SortModel[];

  // Column visibility
  showColumn(colId: string): void;
  hideColumn(colId: string): void;

  // Column state
  getColumnState(): ColumnState[];
  setColumnState(states: ColumnState[]): void;
}
```

## Usage

```tsx
function App() {
  const apiRef = useRef<GridApi<Employee>>(null);

  return (
    <>
      <button onClick={() => {
        const csv = apiRef.current?.exportToCsv();
        console.log(csv);
      }}>Export</button>

      <OpenGrid
        columnDefs={columns}
        rowData={data}
        onGridReady={({ api }) => { apiRef.current = api; }}
      />
    </>
  );
}
```

## Column State

Column state lets you save and restore the full column configuration (width, sort, pinning, visibility, order):

```typescript
// Save
const state = api.getColumnState();
localStorage.setItem('gridState', JSON.stringify(state));

// Restore
const saved = JSON.parse(localStorage.getItem('gridState') ?? '[]');
api.setColumnState(saved);
```
