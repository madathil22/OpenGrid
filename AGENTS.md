# AGENTS.md — Orientation for AI coding agents

> **You are here because someone said: "Here is the OpenGrid library. Replace AG Grid
> in my project with it."** This file gives you everything you need to do that quickly
> and correctly. Read it top to bottom before editing the target project.

## What OpenGrid is

OpenGrid is a TypeScript-first, headless data-grid library and an open-source
(MIT) alternative to AG Grid. It deliberately mirrors AG Grid's mental model
(`rowData` + `columnDefs` + a grid API) so migration is mostly mechanical, while
keeping the API smaller and fully typed.

- **`@opengrid/core`** — framework-agnostic engine (models + engines, no DOM).
- **`@opengrid/react`** — React 18/19 wrapper: `<OpenGrid />` component + hooks.
- **`@opengrid/themes`** — light/dark CSS-variable themes.
- **`@opengrid/export`** — CSV + Excel (`.xlsx`) exporters.

## Repo map

```
packages/core/src/
  types/index.ts        ← START HERE. All public types: ColumnDef, GridOptions, GridApi, …
  GridController.ts      ← orchestrator; implements GridApi
  models/                ← ColumnModel, DataModel, SortModel, FilterModel, SelectionModel
  engines/               ← RenderEngine (virtual scroll), GroupingEngine, AggregationEngine, ExportEngine
packages/react/src/
  components/OpenGrid.tsx ← the React component (props === GridOptions + a few layout props)
  hooks/                  ← useGrid, useVirtualScroll
apps/playground/          ← live demo of every feature; copy patterns from src/App.tsx
apps/docs/docs/           ← human docs (also good source of truth for behavior)
```

**Ground truth for the API is [`packages/core/src/types/index.ts`](packages/core/src/types/index.ts).**
If this file and that file ever disagree, trust the type definitions.

## Commands

```bash
pnpm install
pnpm build          # build all packages (packages/* only)
pnpm test           # run all unit tests (vitest)
pnpm test:coverage  # tests + coverage
pnpm typecheck      # tsc --noEmit across packages (run AFTER build — deps resolve via dist/)
pnpm lint
```

## Migrating from AG Grid — the recipe

1. **Install:** add `@opengrid/react` and `@opengrid/themes`; remove `ag-grid-react` /
   `ag-grid-community` / `ag-grid-enterprise` once migration is verified.
2. **Swap the import + component:** `AgGridReact` → `OpenGrid` (see prop map below).
3. **Rename column-def props** per the table below (`filter` → `filterable`, etc.).
4. **Rename grid-level props** (`rowSelection` → `selection`, `paginationPageSize` → `pageSize`).
5. **Update API calls** captured from `onGridReady` (`exportDataAsCsv` → `exportToCsv`, …).
6. **Swap CSS:** replace the AG Grid theme stylesheet import with an OpenGrid theme
   (`@opengrid/themes/opengrid-light.css` or `…-dark.css`) and set the theme on a wrapper
   via `data-og-theme` (see `apps/playground/src/App.tsx`).
7. **Run `pnpm typecheck` + the app's tests.** OpenGrid is strongly typed — most
   mismatches surface as type errors that point you straight at the remaining work.

## API mapping: AG Grid → OpenGrid

### Component / grid-level options
| AG Grid | OpenGrid | Notes |
|---|---|---|
| `<AgGridReact … />` | `<OpenGrid … />` | props are `GridOptions<TData>` + `height`, `width`, `showFilterRow` |
| `rowData` | `rowData` | same |
| `columnDefs` | `columnDefs` | same |
| `rowSelection="single"\|"multiple"` | `selection="single"\|"multiple"\|"range"\|false` | |
| `pagination` | `pagination` | |
| `paginationPageSize` | `pageSize` | |
| `rowHeight` | `rowHeight` | fixed-height mode |
| `getRowHeight={p => …}` | `getRowHeight={({ data, rowIndex }) => …}` | variable heights |
| `headerHeight` | `headerHeight` | |
| `onGridReady={e => e.api}` | `onGridReady={e => e.api}` | `GridReadyEvent.api` is the `GridApi` |
| `onSelectionChanged` | `onSelectionChanged` | OpenGrid passes `{ selectedRows }` |
| `onSortChanged` | `onSortChanged` | passes `SortModel[]` |
| `onFilterChanged` | `onFilterChanged` | passes `FilterModel` |
| row grouping via `colDef.rowGroup` | grid-level `grouping` + `groupFields: string[]` | mark columns `groupable: true` |

### Column definitions (`ColumnDef<TData>`)
| AG Grid | OpenGrid | Notes |
|---|---|---|
| `field` | `field` | same |
| `headerName` | `headerName` | same |
| `sortable` | `sortable` | same; header click cycles asc → desc → none |
| `comparator` | `comparator` | `(a, b, rowA, rowB) => number`, compare ascending |
| `filter: true \| 'agTextColumnFilter'` | `filterable: true` | filter type is inferred from `FilterCondition.type` |
| `checkboxSelection` (colDef) | `<OpenGrid checkboxSelection />` (grid prop) | renders a pinned-left checkbox column + select-all header |
| `width` / `minWidth` / `maxWidth` | `width` / `minWidth` / `maxWidth` | same |
| `flex` | `flex` | call `api.applyFlexWidths(viewportWidth)` to apply |
| `pinned: 'left' \| 'right'` | `pinned: 'left' \| 'right'` | same |
| `hide` | `hide` | same |
| `resizable` | `resizable` | same |
| `cellRenderer` | `cellRenderer` | OpenGrid params: `{ value, data, colDef, rowIndex }`; returns `string \| HTMLElement` |
| `valueGetter` | `valueGetter` | params: `{ data, colDef }` |
| `valueFormatter` | `valueFormatter` | params: `{ value, data, colDef }` |
| `aggFunc: 'sum'\|'avg'\|…` | `aggFunc: 'sum'\|'count'\|'min'\|'max'\|'avg'` | custom aggs via the AggregationEngine |
| `enableRowGroup` / `rowGroup` | `groupable: true` (+ grid `groupFields`) | grouping is configured at grid level |

### Grid API (`GridApi<TData>`, obtained from `onGridReady`)
| AG Grid | OpenGrid |
|---|---|
| `api.getSelectedRows()` | `api.getSelectedRows()` |
| `api.exportDataAsCsv(params)` | `api.exportToCsv({ fileName?, includeHeaders? })` |
| `api.sizeColumnsToFit()` | `api.sizeColumnsToFit(viewportWidth)` |
| `api.setFilterModel(m)` / `getFilterModel()` | `api.setFilterModel(m)` / `getFilterModel()` |
| `api.setQuickFilter(text)` | `api.setQuickFilter(text)` / `getQuickFilter()` |
| `api.selectAll()` / `deselectAll()` | `api.selectAll()` / `deselectAll()` / `getSelectedCount()` |
| `api.setSortModel(m)` (legacy) | `api.setSortModel(m)` / `getSortModel()` |
| `api.getColumnState()` / `applyColumnState()` | `api.getColumnState()` / `setColumnState()` |
| `api.setGridOption('rowData', d)` | `api.setRowData(d)` |
| `columnApi.setColumnVisible(id, v)` | `api.showColumn(id)` / `api.hideColumn(id)` |
| Excel export (enterprise) | `@opengrid/export` → `ExcelExporter` |

## Feature parity — current status (be honest with the user)

OpenGrid is built in milestones. As of now, treat anything not listed as **present**
as **not yet available**, and tell the user rather than inventing an API.

- **Present:** virtual row + column scrolling, fixed/variable row height, pinned
  columns, flex/auto-size, multi-column sort with custom comparators (tri-state
  toggle, nulls-last), text/number/date/set/custom filters + global quick filter,
  single/multiple/row-range selection with checkbox column + select-all, client-side
  row grouping (multi-level, dynamic via api.setGroupColumns) with aggregations,
  custom aggregation functions, group footers + grand-total footer, CSV export,
  Excel export, light/dark themes.
- **Planned / partial (check the milestone before relying on it):** cell-range
  selection, master/detail rows, full column-state persistence, pagination UI.
- **Out of scope (AG Grid enterprise features OpenGrid does NOT aim to replicate):**
  pivoting, integrated charts, server-side/viewport row models, tree data, cell
  editing framework, the AG Grid theming class names.

If the target project depends on an out-of-scope feature, surface that to the user
as a migration blocker instead of silently approximating it.

## Conventions when editing this repo

- TypeScript strict; **no `any`** (use `unknown`). Public APIs must be fully typed.
- Every feature change ships with Vitest tests in the package's `__tests__/`.
- Keep `@opengrid/core` free of DOM/React imports — it is headless by design.
- Run `pnpm build` before `pnpm typecheck` (cross-package types resolve via `dist/`).

## Pointers

- Types / public API: `packages/core/src/types/index.ts`
- Worked examples of every feature: `apps/playground/src/App.tsx`
- Human docs (also a migration guide): `apps/docs/docs/` and the published site
  at https://madathil22.github.io/OpenGrid/
