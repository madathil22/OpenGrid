import { describe, it, expect } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { OpenGrid } from '../components/OpenGrid.js';
import type { ColumnDef } from '@opengrid/core';

type Row = { name: string; dept: string; salary: number };

const columns: ColumnDef<Row>[] = [
  { field: 'name', headerName: 'Name', width: 160 },
  { field: 'dept', headerName: 'Department', width: 160, groupable: true },
  {
    field: 'salary',
    headerName: 'Salary',
    width: 120,
    aggFunc: 'sum',
    valueFormatter: ({ value }) => (typeof value === 'number' ? `$${value.toLocaleString()}` : ''),
  },
];

const rows: Row[] = [
  { name: 'Alice', dept: 'Engineering', salary: 100000 },
  { name: 'Bob', dept: 'Engineering', salary: 90000 },
  { name: 'Carol', dept: 'Marketing', salary: 70000 },
];

function leafRowCount(container: HTMLElement): number {
  return container.querySelectorAll('.og-body .og-row[data-og-row-id]').length;
}

describe('OpenGrid grouping', () => {
  it('renders group header rows with count and formatted aggregate', () => {
    const { container } = render(
      <OpenGrid columnDefs={columns} rowData={rows} grouping groupFields={['dept']} height={400} />,
    );
    const groupRows = container.querySelectorAll('.og-body .og-group-row');
    expect(groupRows.length).toBe(2);

    const engGroup = [...groupRows].find((g) => g.textContent?.includes('Engineering'))!;
    expect(engGroup.textContent).toContain('(2)'); // child count
    expect(engGroup.textContent).toContain('$190,000'); // sum, formatted
  });

  it('collapses a group when its toggle is clicked', () => {
    const { container } = render(
      <OpenGrid columnDefs={columns} rowData={rows} grouping groupFields={['dept']} height={400} />,
    );
    expect(leafRowCount(container)).toBe(3);

    const engGroup = [...container.querySelectorAll('.og-body .og-group-row')].find((g) =>
      g.textContent?.includes('Engineering'),
    ) as HTMLElement;
    fireEvent.click(within(engGroup).getByLabelText('Collapse group'));

    // Engineering's 2 leaves are hidden → only Marketing's 1 leaf remains.
    expect(leafRowCount(container)).toBe(1);
  });

  it('renders group footer rows when groupIncludeFooter is set', () => {
    const { container } = render(
      <OpenGrid
        columnDefs={columns}
        rowData={rows}
        grouping
        groupFields={['dept']}
        groupIncludeFooter
        height={400}
      />,
    );
    const footers = container.querySelectorAll('.og-body .og-group-footer-row');
    expect(footers.length).toBe(2);
    const engFooter = [...footers].find((f) => f.textContent?.includes('$190,000'));
    expect(engFooter).toBeTruthy();
  });
});
