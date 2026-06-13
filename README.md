# OpenGrid

The open-source enterprise data grid — a production-grade alternative to AG Grid.

## Features

- Virtual scrolling for 100k+ rows
- Multi-column sorting
- Column filtering (text, number, date, set)
- Row grouping with aggregations
- Single / multi / range row selection
- Column reordering, resizing, pinning, hiding
- CSV and Excel export
- Light and dark themes via CSS variables
- Headless core — bring your own UI framework

## Packages

| Package | Description |
|---|---|
| `@opengrid/core` | Headless TypeScript grid engine |
| `@opengrid/react` | React 19 wrapper hooks + component |
| `@opengrid/themes` | CSS variable-based themes |
| `@opengrid/export` | CSV + Excel export engine |

## Quick Start

```bash
pnpm add @opengrid/react @opengrid/themes
```

```tsx
import { OpenGrid } from '@opengrid/react';
import '@opengrid/themes/dist/opengrid-light.css';

const columns = [
  { field: 'name', headerName: 'Name', sortable: true, filterable: true },
  { field: 'age', headerName: 'Age', sortable: true },
];

const data = [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }];

export default function App() {
  return <OpenGrid rowData={data} columnDefs={columns} rowHeight={40} />;
}
```

## Development

```bash
pnpm install
pnpm build
pnpm test
```

## Migrating from AG Grid

OpenGrid mirrors AG Grid's `rowData` / `columnDefs` / grid-`api` model, so most
migrations are mechanical renames (`filter` → `filterable`, `rowSelection` →
`selection`, `exportDataAsCsv` → `exportToCsv`, …). See the
[migration guide](https://madathil22.github.io/OpenGrid/docs/migration/from-ag-grid).

**Using an AI coding agent to do the migration?** Point it at
[`AGENTS.md`](./AGENTS.md) — it contains the full API mapping, a step-by-step
migration recipe, and an honest feature-parity matrix written for agent consumption.

## License

[MIT](./LICENSE) © OpenGrid contributors. Free for any use, commercial or
otherwise, including in proprietary and enterprise applications — no fees, no
feature gates, no contributor license agreement required.

`@opengrid/core` and `@opengrid/themes` have **zero runtime dependencies**.
Excel export depends on `xlsx` only as an **optional** peer dependency. See
[THIRD-PARTY-LICENSES.md](./THIRD-PARTY-LICENSES.md) for the full dependency and
license audit.
