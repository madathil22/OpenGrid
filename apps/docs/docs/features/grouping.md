---
sidebar_position: 3
---

# Grouping

Group rows by one or more fields to display hierarchical data with aggregations,
group footers, and a grand-total footer.

## Try it out

```jsx live
<OpenGrid
  rowData={employees}
  columnDefs={columns}
  grouping
  groupFields={['department']}
  groupIncludeFooter
  height={320}
/>
```

## Enabling Grouping

```tsx
<OpenGrid
  columnDefs={columns}
  rowData={data}
  grouping
  groupFields={['department']}
/>
```

### Grouping dynamically via the API

```typescript
api.setGroupColumns(['department']); // group
api.setGroupColumns([]);             // ungroup
const fields = api.getGroupColumns();
```

## Multi-level Grouping

```tsx
<OpenGrid
  grouping
  groupFields={['department', 'role']}
  ...
/>
```

## Aggregations

Set `aggFunc` on a `ColumnDef` to compute aggregated values in group rows:

```tsx
const columns = [
  { field: 'department', groupable: true },
  { field: 'salary', aggFunc: 'avg', headerName: 'Avg Salary' },
  { field: 'count', aggFunc: 'count' },
];
```

Available aggregation functions: `sum`, `count`, `min`, `max`, `avg`. Group
header values are formatted with the column's `valueFormatter`. Aggregations roll
up correctly through nested groups.

### Custom aggregation

Pass a function instead of a name to aggregate however you like. It receives the
leaf `values`, the leaf `nodes`, and the `field`:

```tsx
const columns = [
  { field: 'department', groupable: true },
  {
    field: 'salary',
    // median instead of a built-in
    aggFunc: ({ values }) => {
      const nums = (values as number[]).slice().sort((a, b) => a - b);
      return nums[Math.floor(nums.length / 2)];
    },
  },
];
```

## Group Footers & Grand Total

```tsx
<OpenGrid
  grouping
  groupFields={['department']}
  groupIncludeFooter      // a summary footer at the bottom of each group
  groupIncludeTotalFooter // a grand-total footer at the very bottom
/>
```

The grand-total footer also works without grouping, as long as columns declare
an `aggFunc`.

## Expand / Collapse

Groups are expanded by default and **stay** collapsed/expanded across re-renders
(sorting, filtering, selection). Users click the toggle arrow; programmatically:

```typescript
api.toggleGroupExpand(groupId);
api.setGroupExpanded(groupId, false);
api.expandAll();
api.collapseAll();
```

## GroupingEngine

The `@opengrid/core` `GroupingEngine` class handles grouping and can be used independently:

```typescript
import { GroupingEngine } from '@opengrid/core';

const engine = new GroupingEngine<MyRow>();
const grouped = engine.groupData(rowNodes, ['department'], { salary: 'avg' });
const flat = engine.flattenGroups(grouped); // only expanded nodes
```
