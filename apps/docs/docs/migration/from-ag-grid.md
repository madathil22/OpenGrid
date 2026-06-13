---
sidebar_position: 1
---

# Migrating from AG Grid

OpenGrid intentionally mirrors AG Grid's mental model — `rowData`, `columnDefs`,
and a grid `api` from `onGridReady` — so most migrations are mechanical renames.
This page is the human-facing companion to the repo's
[`AGENTS.md`](https://github.com/madathil22/OpenGrid/blob/main/AGENTS.md), which
is written so an AI coding agent can perform the replacement for you.

## Before / after

```tsx
// ── Before: AG Grid ──────────────────────────────────────────────
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

const columnDefs = [
  { field: 'name', sortable: true, filter: true },
  { field: 'salary', sortable: true, aggFunc: 'avg' },
];

<div className="ag-theme-quartz" style={{ height: 500 }}>
  <AgGridReact
    rowData={rows}
    columnDefs={columnDefs}
    rowSelection="multiple"
    onGridReady={(e) => (apiRef.current = e.api)}
  />
</div>
```

```tsx
// ── After: OpenGrid ──────────────────────────────────────────────
import { OpenGrid } from '@opengrid/react';
import '@opengrid/themes/opengrid-light.css';

const columnDefs = [
  { field: 'name', sortable: true, filterable: true },
  { field: 'salary', sortable: true, aggFunc: 'avg' },
];

<div data-og-theme="opengrid-light">
  <OpenGrid
    rowData={rows}
    columnDefs={columnDefs}
    selection="multiple"
    height={500}
    onGridReady={(e) => (apiRef.current = e.api)}
  />
</div>
```

## What changes

| Concern | AG Grid | OpenGrid |
|---|---|---|
| Component | `<AgGridReact />` | `<OpenGrid />` |
| Column filter | `filter: true` | `filterable: true` |
| Selection | `rowSelection="multiple"` | `selection="multiple"` |
| Page size | `paginationPageSize` | `pageSize` |
| Sizing | wrapper `height` via CSS theme class | `height` / `width` props |
| Theme | `className="ag-theme-quartz"` + CSS | `data-og-theme="opengrid-light"` + CSS |
| CSV export | `api.exportDataAsCsv()` | `api.exportToCsv()` |
| Fit columns | `api.sizeColumnsToFit()` | `api.sizeColumnsToFit(viewportWidth)` |
| Column visibility | `columnApi.setColumnVisible(id, v)` | `api.showColumn(id)` / `api.hideColumn(id)` |
| Row grouping | `colDef.rowGroup: true` | grid `grouping` + `groupFields`, column `groupable: true` |

The full prop-by-prop and API-by-API mapping lives in
[`AGENTS.md`](https://github.com/madathil22/OpenGrid/blob/main/AGENTS.md#api-mapping-ag-grid--opengrid).

## Feature parity

OpenGrid covers the majority of everyday AG Grid Community use cases — virtual
scrolling, sorting, filtering, selection, grouping, aggregation, pinned columns,
and CSV/Excel export. Some AG Grid **Enterprise** features (pivoting, integrated
charts, server-side row model, tree data) are intentionally out of scope. If your
app depends on one of those, check the
[project milestones](https://github.com/madathil22/OpenGrid) before migrating.

## Suggested order of work

1. Install `@opengrid/react` + `@opengrid/themes`.
2. Replace the component and swap the theme stylesheet/class.
3. Rename column-def and grid-level props (table above).
4. Update any `api.*` calls captured from `onGridReady`.
5. Run your type-checker — OpenGrid's strict types flag most remaining gaps.
6. Remove the `ag-grid-*` dependencies once the app builds and tests pass.
