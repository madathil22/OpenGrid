---
sidebar_position: 1
---

# Sorting

OpenGrid supports multi-column sorting out of the box.

## Enabling Sorting

Set `sortable: true` on any `ColumnDef`:

```tsx
const columns = [
  { field: 'name', sortable: true },
  { field: 'age', sortable: true },
];
```

## User Interaction

- **Click** a sortable header to sort ascending.
- **Click again** to sort descending.
- **Shift+click** to add a secondary (tertiary, …) sort column.

## Programmatic API

```typescript
// Single column sort
api.setSortModel([{ colId: 'name', sort: 'asc' }]);

// Multi-column sort
api.setSortModel([
  { colId: 'department', sort: 'asc' },
  { colId: 'salary', sort: 'desc' },
]);

// Clear sort
api.setSortModel([]);

// Read current sort
const current = api.getSortModel();
```

## onChange callback

```tsx
<OpenGrid
  onSortChanged={(model) => {
    console.log('Sort changed:', model);
  }}
/>
```

## Sort Types

Sorting uses locale-aware string comparison for strings and numeric comparison for numbers. `null`/`undefined` values are sorted to the bottom in ascending order.
