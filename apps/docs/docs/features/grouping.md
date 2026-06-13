---
sidebar_position: 3
---

# Grouping

Group rows by one or more fields to display hierarchical data with aggregations.

## Enabling Grouping

```tsx
<OpenGrid
  columnDefs={columns}
  rowData={data}
  grouping
  groupFields={['department']}
/>
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

Available aggregation functions: `sum`, `count`, `min`, `max`, `avg`.

## Expand / Collapse

Groups are expanded by default. Users can click the toggle arrow to collapse/expand. Programmatic toggle:

```typescript
// The GridController exposes toggleGroupExpand
// (when using useGrid hook, call api.toggleGroupExpand(groupId))
api.toggleGroupExpand(groupId);
```

## GroupingEngine

The `@opengrid/core` `GroupingEngine` class handles grouping and can be used independently:

```typescript
import { GroupingEngine } from '@opengrid/core';

const engine = new GroupingEngine<MyRow>();
const grouped = engine.groupData(rowNodes, ['department'], { salary: 'avg' });
const flat = engine.flattenGroups(grouped); // only expanded nodes
```
