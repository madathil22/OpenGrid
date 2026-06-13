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

```typescript
import { ExcelExporter } from '@opengrid/export';

const exporter = new ExcelExporter();
exporter.downloadExcel({
  columns,
  rows: data,
  sheetName: 'Employees',
  fileName: 'employees.xlsx',
});
```
