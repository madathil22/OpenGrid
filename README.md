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
