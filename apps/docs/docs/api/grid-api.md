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
  setFilterModel(model: FilterModel<TData>): void;
  getFilterModel(): FilterModel<TData>;
  setQuickFilter(text: string): void;   // global substring match across all columns
  getQuickFilter(): string;

  // Sorting
  setSortModel(model: SortModel[]): void;
  getSortModel(): SortModel[];

  // Selection
  selectAll(): void;                     // select all visible (post-filter) rows
  deselectAll(): void;
  getSelectedCount(): number;

  // Column visibility / layout
  showColumn(colId: string): void;
  hideColumn(colId: string): void;
  resizeColumn(colId: string, width: number): void;
  moveColumn(colId: string, toIndex: number): void;
  autoSizeColumn(colId: string, measuredWidth: number): void;
  applyFlexWidths(viewportWidth: number): void;

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
