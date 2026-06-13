import React, { useState, useRef } from 'react';
import { OpenGrid } from '@opengrid/react';
import type { GridOptions, ColumnDef, GridApi, RowData } from '@opengrid/core';
import { CsvExporter } from '@opengrid/export';

// ─── Generate 10,000 demo rows ──────────────────────────────────────────────

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Legal', 'Design'];
const ROLES = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director'];
const FIRST_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank', 'Iris', 'Jack'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Davis', 'Wilson'];

interface EmployeeRow extends RowData {
  id: number;
  name: string;
  department: string;
  role: string;
  salary: number;
  startDate: string;
  active: boolean;
}

function generateData(count: number): EmployeeRow[] {
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST_NAMES[i % FIRST_NAMES.length]!;
    const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]!;
    const dept = DEPARTMENTS[i % DEPARTMENTS.length]!;
    const role = ROLES[i % ROLES.length]!;
    const baseSalary = 50000 + (ROLES.indexOf(role) * 15000) + (i % 10000);
    const year = 2015 + (i % 10);
    const month = String((i % 12) + 1).padStart(2, '0');
    const day = String((i % 28) + 1).padStart(2, '0');

    return {
      id: i + 1,
      name: `${first} ${last}`,
      department: dept,
      role,
      salary: baseSalary,
      startDate: `${year}-${month}-${day}`,
      active: i % 7 !== 0,
    };
  });
}

const ALL_DATA = generateData(10000);

// ─── Column definitions ──────────────────────────────────────────────────────

const columns: ColumnDef<EmployeeRow>[] = [
  { field: 'id', headerName: 'ID', width: 70, sortable: true, pinned: 'left' },
  { field: 'name', headerName: 'Name', width: 180, sortable: true, filterable: true, pinned: 'left' },
  { field: 'department', headerName: 'Department', width: 160, sortable: true, filterable: true, groupable: true },
  { field: 'role', headerName: 'Role', width: 120, sortable: true, filterable: true, groupable: true },
  {
    field: 'salary',
    headerName: 'Salary',
    width: 120,
    sortable: true,
    aggFunc: 'avg',
    valueFormatter: ({ value }) =>
      typeof value === 'number' ? `$${value.toLocaleString()}` : String(value ?? ''),
  },
  { field: 'startDate', headerName: 'Start Date', width: 130, sortable: true },
  {
    field: 'active',
    headerName: 'Active',
    width: 90,
    pinned: 'right',
    valueFormatter: ({ value }) => (value ? '✓' : '✗'),
  },
];

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showFilterRow, setShowFilterRow] = useState(false);
  const [rowCount, setRowCount] = useState(10000);
  const [variableHeight, setVariableHeight] = useState(false);
  const [quickFilter, setQuickFilter] = useState('');
  const apiRef = useRef<GridApi<EmployeeRow> | null>(null);

  const handleGridReady = (api: GridApi<EmployeeRow>) => {
    apiRef.current = api;
  };

  const handleExportCsv = () => {
    if (!apiRef.current) return;
    const csv = apiRef.current.exportToCsv({ includeHeaders: true });
    const exporter = new CsvExporter();
    exporter.downloadCsv(csv, 'employees.csv');
  };

  const handleSizeToFit = () => {
    apiRef.current?.sizeColumnsToFit(window.innerWidth - 40);
  };

  const handleQuickFilter = (text: string) => {
    setQuickFilter(text);
    apiRef.current?.setQuickFilter(text);
  };

  const gridOptions: GridOptions<EmployeeRow> = {
    columnDefs: columns,
    rowData: ALL_DATA.slice(0, rowCount),
    rowHeight: 40,
    headerHeight: 40,
    selection: 'multiple',
    onGridReady: (e) => handleGridReady(e.api),
    // Variable row height: every 3rd row is taller
    getRowHeight: variableHeight
      ? ({ rowIndex }) => (rowIndex % 3 === 0 ? 64 : 40)
      : undefined,
  };

  return (
    <div
      data-og-theme={`opengrid-${theme}`}
      style={{
        minHeight: '100vh',
        background: theme === 'dark' ? '#1e1e2e' : '#f4f6fb',
        color: theme === 'dark' ? '#cdd6f4' : '#1a1a2e',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '24px',
      }}
    >
      <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700 }}>OpenGrid Playground</h1>
      <p style={{ margin: '0 0 20px', opacity: 0.7, fontSize: 14 }}>
        Showing {rowCount.toLocaleString()} rows — virtual scrolling, pinned columns (ID/Name left, Active right),
        checkbox selection, quick filter, multi-sort, filtering{variableHeight ? ', variable row heights' : ''}
      </p>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Quick filter…"
          value={quickFilter}
          onChange={(e) => handleQuickFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.2)', minWidth: 200 }}
        />
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? 'Dark' : 'Light'} Theme
        </button>
        <button onClick={() => setShowFilterRow(!showFilterRow)}>
          {showFilterRow ? 'Hide' : 'Show'} Filter Row
        </button>
        <button onClick={() => setVariableHeight(!variableHeight)}>
          {variableHeight ? 'Fixed' : 'Variable'} Row Height
        </button>
        <button onClick={handleExportCsv}>Export CSV</button>
        <button onClick={handleSizeToFit}>Size Columns to Fit</button>
        <select
          value={rowCount}
          onChange={(e) => setRowCount(Number(e.target.value))}
        >
          <option value={100}>100 rows</option>
          <option value={1000}>1,000 rows</option>
          <option value={5000}>5,000 rows</option>
          <option value={10000}>10,000 rows</option>
        </select>
      </div>

      {/* Grid */}
      <div style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6, overflow: 'hidden' }}>
        <OpenGrid<EmployeeRow>
          {...gridOptions}
          height={600}
          width="100%"
          showFilterRow={showFilterRow}
          checkboxSelection
        />
      </div>

      <p style={{ marginTop: 16, fontSize: 12, opacity: 0.5 }}>
        Tip: Click headers to sort (cycles asc → desc → none; Shift+click for multi-sort). Use the checkboxes to
        select rows (Shift+click a checkbox or row for range select; header checkbox selects all). Drag headers to
        reorder, drag the resize handle to resize.
      </p>

      <style>{`
        button, select {
          padding: 8px 14px;
          border-radius: 6px;
          border: 1px solid rgba(0,0,0,0.2);
          background: ${theme === 'dark' ? '#313150' : '#fff'};
          color: ${theme === 'dark' ? '#cdd6f4' : '#1a1a2e'};
          cursor: pointer;
          font-size: 13px;
        }
        button:hover {
          background: ${theme === 'dark' ? '#45475a' : '#f0f0f0'};
        }

        /* Light theme grid styles */
        .og-grid {
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: #fff;
          color: #1a1a2e;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          box-sizing: border-box;
        }
        .og-grid * { box-sizing: border-box; }
        .og-header {
          display: flex;
          align-items: center;
          height: 40px;
          background: #f8f9fa;
          border-bottom: 2px solid #e0e0e0;
          user-select: none;
        }
        .og-header-cell {
          position: relative;
          display: flex;
          align-items: center;
          height: 100%;
          padding: 0 12px;
          font-weight: 600;
          font-size: 13px;
          border-right: 1px solid #e0e0e0;
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
        }
        .og-header-cell:last-child { border-right: none; }
        .og-header-cell:hover { background: rgba(0,0,0,0.04); }
        .og-header-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .og-sort-indicator { font-size: 12px; margin-left: 4px; color: #4285f4; }
        .og-resize-handle {
          position: absolute; right: 0; top: 20%; height: 60%; width: 4px;
          cursor: col-resize; background: #bdbdbd; border-radius: 2px;
          opacity: 0; transition: opacity 0.15s; z-index: 1;
        }
        .og-header-cell:hover .og-resize-handle { opacity: 1; }
        .og-resize-handle:hover { background: #4285f4; opacity: 1; }
        .og-body { position: relative; overflow: auto; }
        .og-checkbox-cell { display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; }
        .og-checkbox-cell input { cursor: pointer; width: 16px; height: 16px; }
        .og-pinned-left-header, .og-pinned-left-body { box-shadow: 2px 0 4px rgba(0,0,0,0.08); background: #fff; }
        .og-pinned-right-header, .og-pinned-right-body { box-shadow: -2px 0 4px rgba(0,0,0,0.08); background: #fff; }
        .og-pinned-left-header, .og-pinned-right-header { background: #f8f9fa; }
        .og-row {
          display: flex; align-items: center; position: absolute;
          left: 0; right: 0; background: #fff; border-bottom: 1px solid #e0e0e0;
          cursor: pointer; outline: none;
        }
        .og-row:hover { background: #e8f0fe; }
        .og-row.og-selected { background: #c2d4f8; }
        .og-cell {
          display: flex; align-items: center; height: 100%; padding: 0 12px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          border-right: 1px solid #e0e0e0; flex-shrink: 0;
        }
        .og-cell:last-child { border-right: none; }
        .og-group-row { background: #f0f4ff; font-weight: 600; }
        .og-group-cell { flex: 1; gap: 8px; display: flex; align-items: center; padding: 0 8px; }
        .og-group-toggle {
          background: none; border: none; cursor: pointer; font-size: 12px;
          padding: 2px 4px; width: 20px; height: 20px; display: inline-flex;
          align-items: center; justify-content: center;
        }
        .og-group-toggle:hover { background: rgba(0,0,0,0.08); border-radius: 2px; }
        .og-filter-row {
          display: flex; align-items: center; height: 40px;
          background: #f8f9fa; border-bottom: 1px solid #e0e0e0;
        }
        .og-filter-cell {
          padding: 4px 8px; border-right: 1px solid #e0e0e0;
          height: 100%; display: flex; align-items: center; flex-shrink: 0;
        }
        .og-filter-input {
          width: 100%; height: 26px; padding: 2px 6px;
          border: 1px solid #bdbdbd; border-radius: 3px; font-size: 12px; outline: none;
        }
        .og-filter-input:focus { border-color: #4285f4; }
        .og-agg-data { font-weight: 400; font-size: 12px; color: #5f6368; margin-left: 8px; }
      `}</style>
    </div>
  );
}
