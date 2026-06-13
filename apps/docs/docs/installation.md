---
sidebar_position: 2
---

# Installation

## Prerequisites

- Node.js 18+
- pnpm, npm, or yarn

## React

```bash
pnpm add @opengrid/react @opengrid/themes
```

Import the CSS theme in your app entry point:

```ts
import '@opengrid/themes/dist/opengrid-light.css';
// or dark theme:
import '@opengrid/themes/dist/opengrid-dark.css';
```

## Core only (headless)

```bash
pnpm add @opengrid/core
```

## Export utilities

```bash
pnpm add @opengrid/export
```

`@opengrid/export` depends on `xlsx` (SheetJS). It is included as a direct dependency.

## TypeScript

All packages ship with full TypeScript declarations. No `@types/*` packages are needed.

The library targets **TypeScript 5.0+** with strict mode. Your `tsconfig.json` should include:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```
