---
sidebar_position: 4
---

# Row Selection

OpenGrid supports single, multiple, and range row selection.

## Try it out

Click the checkboxes, or shift+click a row to select a range. The header
checkbox selects all.

```jsx live
<OpenGrid
  rowData={employees}
  columnDefs={columns}
  height={280}
  selection="multiple"
  checkboxSelection
/>
```

## Enabling Selection

```tsx
<OpenGrid selection="multiple" ... />
```

Options: `'single'`, `'multiple'`, `'range'`, or `false` (no selection).

## User Interaction

| Mode | Click | Ctrl/Cmd+Click | Shift+Click |
|------|-------|----------------|-------------|
| `single` | Select row | Select row | Select row |
| `multiple` | Toggle single | Add/remove | Add/remove |
| `range` | Select row | Add/remove | Select range |

## Checkbox Selection

Set `checkboxSelection` to render a leading checkbox column (pinned left) with a
**select-all** checkbox in the header. The header checkbox shows an
indeterminate state when only some rows are selected.

```tsx
<OpenGrid selection="multiple" checkboxSelection columnDefs={columns} rowData={data} />
```

- Click a row checkbox to toggle that row.
- **Shift+click** a checkbox (or a row) to select a contiguous range from the
  last-selected anchor.
- The header checkbox selects/clears all currently visible (post-filter) rows.

## Programmatic API

```typescript
// Get selected rows / count
const rows = api.getSelectedRows();
const count = api.getSelectedCount();

// Select / clear all visible rows
api.selectAll();
api.deselectAll();

// React to selection changes
<OpenGrid
  onSelectionChanged={({ selectedRows }) => {
    console.log(selectedRows);
  }}
/>
```

## useGrid hook

```typescript
const { selectedRows } = useGrid({ columnDefs, rowData, selection: 'multiple' });
```

`selectedRows` is reactive and updates automatically.
