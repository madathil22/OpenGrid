---
sidebar_position: 4
---

# Row Selection

OpenGrid supports single, multiple, and range row selection.

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

## Programmatic API

```typescript
// Get selected rows
const rows = api.getSelectedRows();

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
