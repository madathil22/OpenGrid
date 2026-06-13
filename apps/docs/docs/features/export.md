---
sidebar_position: 5
---

# Export

OpenGrid can export data to CSV or Excel (.xlsx) format.

## CSV via GridApi

The built-in `GridApi.exportToCsv()` uses the core `ExportEngine`:

```typescript
const csv = api.exportToCsv({ includeHeaders: true });

// Download in browser
const blob = new Blob([csv], { type: 'text/csv' });
const a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = 'export.csv';
a.click();
```

## @opengrid/export

For more control, use the standalone export package:

```bash
pnpm add @opengrid/export
```

### CSV

```typescript
import { CsvExporter } from '@opengrid/export';

const exporter = new CsvExporter();

// Generate CSV string
const csv = exporter.export({
  columns: [{ field: 'name', headerName: 'Name' }, { field: 'age', headerName: 'Age' }],
  rows: data,
  includeHeaders: true,
  delimiter: ',',
});

// Download
exporter.downloadCsv(csv, 'employees.csv');
```

### Excel

Excel export lives behind an **optional** `xlsx` (SheetJS) peer dependency, so it
adds nothing to your bundle unless you actually use it. CSV export has no
dependencies at all.

```bash
# Only needed if you use the built-in Excel writer
pnpm add xlsx
```

```typescript
import { ExcelExporter } from '@opengrid/export';

const exporter = new ExcelExporter();

// export() and downloadExcel() are async — xlsx is lazily imported on first use
await exporter.downloadExcel({
  columns,
  rows: data,
  sheetName: 'Employees',
  fileName: 'employees.xlsx',
});
```

If `xlsx` is not installed, the call throws a clear error telling you to either
install it or provide your own writer.

#### Swappable writer (no `xlsx` required)

Pass a custom `ExcelWriter` to back Excel export with any library — ExcelJS, a
maintained SheetJS build, or a server endpoint — and skip the `xlsx` dependency
entirely:

```typescript
import { ExcelExporter, type ExcelWriter } from '@opengrid/export';

const writer: ExcelWriter = ({ sheetName, aoa, colWidths }) => {
  // aoa is array-of-arrays (header row first); return an ArrayBuffer (sync or async)
  return myExcelLibrary.build(sheetName, aoa, colWidths);
};

const exporter = new ExcelExporter(writer);
const buffer = await exporter.export({ columns, rows: data });
```

This is the recommended path for teams whose security policy disallows the npm
`xlsx@0.18.5` distribution.
