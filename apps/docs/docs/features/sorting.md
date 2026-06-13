---
sidebar_position: 1
---

# Sorting

OpenGrid supports multi-column sorting out of the box.

## Try it out

Click a header to cycle asc → desc → none. Shift+click a second header for
multi-column sort.

```jsx live
<OpenGrid rowData={employees} columnDefs={columns} height={280} />
```

## Enabling Sorting

Set `sortable: true` on any `ColumnDef`:

```tsx
const columns = [
  { field: 'name', sortable: true },
  { field: 'age', sortable: true },
];
```

## User Interaction

- **Click** a sortable header to cycle its sort: **ascending → descending → none**.
- **Shift+click** to add a secondary (tertiary, …) sort column; shift-clicking
  through to "none" removes just that column from the multi-sort.

## Custom Comparators

Provide a `comparator` on a column to control ordering (natural sort, sorting by
a derived key, etc.). Always compare in ascending order — the engine applies the
asc/desc direction on top of your result.

```tsx
const columns = [
  {
    field: 'version',
    sortable: true,
    comparator: (a, b) =>
      String(a).localeCompare(String(b), undefined, { numeric: true }),
  },
];
```

The comparator also receives the underlying row nodes (`(a, b, rowA, rowB)`) if
you need sibling fields.

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

Sorting uses locale-aware string comparison for strings and numeric comparison
for numbers. `null`, `undefined`, and empty-string values always sort to the
**end**, regardless of direction. Sorting also recurses into expanded group
children so nested rows stay ordered.
