import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { OpenGrid } from '../components/OpenGrid.js';
import type { ColumnDef } from '@opengrid/core';

type Row = { name: string; age: number };

const columns: ColumnDef<Row>[] = [
  { field: 'name', headerName: 'Name', sortable: true, filterable: true, width: 200 },
  { field: 'age', headerName: 'Age', sortable: true, width: 100 },
];

const rowData: Row[] = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 },
];

describe('OpenGrid', () => {
  it('renders header cells', () => {
    render(<OpenGrid columnDefs={columns} rowData={rowData} />);
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Age')).toBeTruthy();
  });

  it('renders data rows', () => {
    render(<OpenGrid columnDefs={columns} rowData={rowData} height={500} rowHeight={40} />);
    // Virtual scroll starts from index 0 so Alice should be visible
    expect(screen.getByText('Alice')).toBeTruthy();
  });

  it('renders with empty data', () => {
    const { container } = render(<OpenGrid columnDefs={columns} rowData={[]} />);
    expect(container.querySelector('.og-grid')).toBeTruthy();
  });

  it('renders filter row when showFilterRow=true', () => {
    render(
      <OpenGrid columnDefs={columns} rowData={rowData} showFilterRow height={300} />,
    );
    expect(screen.getAllByPlaceholderText(/Filter Name/i).length).toBeGreaterThan(0);
  });

  it('clicking a sortable header triggers sort', async () => {
    const user = userEvent.setup();
    render(<OpenGrid columnDefs={columns} rowData={rowData} height={500} rowHeight={40} />);
    const nameHeader = screen.getByText('Name');
    await user.click(nameHeader);
    // After sort asc, Alice should still appear first
    expect(screen.getByText('Alice')).toBeTruthy();
  });
});
