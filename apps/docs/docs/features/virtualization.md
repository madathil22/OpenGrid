---
sidebar_position: 0
---

# Virtual Scrolling & Rendering

OpenGrid renders only the rows and columns that are actually visible in the
viewport (plus a small overscan buffer). This lets it display datasets of
100,000+ rows and 500+ columns with smooth scrolling and a flat DOM node count.

## How it works

The headless `RenderEngine` computes the visible window from the current scroll
position:

```typescript
import { RenderEngine } from '@opengrid/core';

const engine = new RenderEngine();
const { startIndex, endIndex, offsetY, totalHeight } = engine.computeRowWindow({
  scrollTop: 1200,
  viewportHeight: 600,
  rowHeight: 40,
  totalRows: 100_000,
  overscan: 5,
});
```

- `startIndex` / `endIndex` — the slice of rows to mount.
- `offsetY` — how far to translate the rendered block so rows line up under the
  scrollbar.
- `totalHeight` — the height of the full virtual content, used to size the
  scroll spacer.

Column virtualization works the same way horizontally via
`computeColumnWindow`, so wide grids only mount the columns inside the
horizontal viewport.

## Fixed row height

By default every row is `rowHeight` pixels tall (40 by default). This is the
fastest mode — offsets are computed with simple arithmetic.

```tsx
<OpenGrid rowData={rows} columnDefs={cols} rowHeight={36} />
```

## Variable / dynamic row height

Provide `getRowHeight` to give each row its own height. OpenGrid builds a
`RowHeightCache` — a prefix-sum index of row offsets — so it can still find the
visible window in `O(log n)` with a binary search, no matter how the heights
vary.

```tsx
<OpenGrid
  rowData={rows}
  columnDefs={cols}
  getRowHeight={({ data, rowIndex }) => (data.expanded ? 120 : 40)}
/>
```

You can also use the cache directly in headless usage:

```typescript
import { RowHeightCache } from '@opengrid/core';

const cache = new RowHeightCache(40);
cache.setHeights(rows.map((r) => (r.expanded ? 120 : 40)));
cache.getOffset(500);          // top pixel of row 500
cache.getRowAtOffset(8000, n); // which row is at scrollTop 8000
```

## Performance notes

- **Overscan** defaults to 3–5 rows. Increasing it reduces blank flashes during
  fast scrolling at the cost of mounting a few more nodes.
- Row windowing is `O(1)` for fixed heights and `O(log n)` for variable heights
  thanks to the prefix-sum cache.
- Pinned columns are excluded from column virtualization (they are always
  mounted), so keep the number of pinned columns small.
- The React wrapper memoizes the row slice and column-width map so scrolling
  does not re-render unchanged rows.
