---
slug: /
sidebar_position: 1
---

# Getting Started

OpenGrid is a production-grade, open-source data grid library designed as an alternative to AG Grid.

## What is OpenGrid?

OpenGrid is a monorepo containing:

- **`@opengrid/core`** — A headless TypeScript grid engine with zero framework dependencies.
- **`@opengrid/react`** — React 19 hooks and components wrapping the core engine.
- **`@opengrid/themes`** — CSS variable-based light and dark themes.
- **`@opengrid/export`** — CSV and Excel export utilities.

## Key Features

- Virtual scrolling — renders only visible rows (handles 100k+ rows)
- Multi-column sorting
- Text, number, date, and set filters
- Row grouping with sum/count/min/max/avg aggregations
- Single, multiple, and range row selection
- Column reordering, resizing, pinning, and visibility toggling
- CSV and Excel (.xlsx) export
- Fully typed with TypeScript generics
- MIT licensed

## Quick Start

```bash
pnpm add @opengrid/react @opengrid/themes
```

```tsx
import { OpenGrid } from '@opengrid/react';
import '@opengrid/themes/dist/opengrid-light.css';

const columns = [
  { field: 'name', headerName: 'Name', sortable: true, filterable: true, width: 200 },
  { field: 'age', headerName: 'Age', sortable: true, width: 100 },
];

const data = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
];

export default function App() {
  return (
    <OpenGrid
      columnDefs={columns}
      rowData={data}
      rowHeight={40}
      height={400}
    />
  );
}
```
