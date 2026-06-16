import { describe, it, expect } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { OpenGrid } from '../components/OpenGrid.js';
import type { ColumnDef } from '@opengrid/core';

type Row = { id: number; name: string; city: string };

const columns: ColumnDef<Row>[] = [
  { field: 'id', headerName: 'ID', width: 80, sortable: true, pinned: 'left' },
  { field: 'name', headerName: 'Name', width: 150, sortable: true },
  { field: 'city', headerName: 'City', width: 150, pinned: 'right' },
];

const rows: Row[] = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  name: `Name ${i}`,
  city: `City ${i}`,
}));

function firstCenterRowId(container: HTMLElement): string | null {
  const first = container.querySelector('.og-body .og-row');
  return first?.getAttribute('data-og-row-id') ?? null;
}

describe('OpenGrid column behaviors', () => {
  it('renders pinned columns in their own panes, not the center', () => {
    const { container } = render(
      <OpenGrid columnDefs={columns} rowData={rows} height={300} rowHeight={40} />,
    );
    const leftHeader = container.querySelector('.og-pinned-left-header') as HTMLElement;
    const rightHeader = container.querySelector('.og-pinned-right-header') as HTMLElement;

    expect(within(leftHeader).getByText('ID')).toBeTruthy();
    expect(within(rightHeader).getByText('City')).toBeTruthy();
    // The pinned columns must not also appear in the (center) header.
    expect(within(leftHeader).queryByText('Name')).toBeNull();
    expect(within(rightHeader).queryByText('Name')).toBeNull();
  });

  it('cycles sort asc → desc → none on repeated header clicks', async () => {
    const user = userEvent.setup();
    const { container, getByText } = render(
      <OpenGrid columnDefs={columns} rowData={rows} height={300} rowHeight={40} />,
    );
    const idHeader = getByText('ID');

    // Original (insertion) order → row-0 first.
    expect(firstCenterRowId(container)).toBe('row-0');

    await user.click(idHeader); // asc by id → row-0 first
    expect(firstCenterRowId(container)).toBe('row-0');

    await user.click(idHeader); // desc by id → row-29 (id 29) first
    expect(firstCenterRowId(container)).toBe('row-29');

    await user.click(idHeader); // none → back to original order
    expect(firstCenterRowId(container)).toBe('row-0');
  });

  it('resizes a column by dragging its header handle', () => {
    const { container } = render(
      <OpenGrid columnDefs={columns} rowData={rows} height={300} rowHeight={40} />,
    );
    const nameHeader = [...container.querySelectorAll('.og-header-cell')].find(
      (el) => el.textContent?.includes('Name'),
    ) as HTMLElement;
    const handle = nameHeader.querySelector('.og-resize-handle') as HTMLElement;
    expect(handle).toBeTruthy();

    const before = nameHeader.getBoundingClientRect().width;
    fireEvent.mouseDown(handle, { clientX: 200 });
    fireEvent.mouseMove(window, { clientX: 260 }); // +60px
    fireEvent.mouseUp(window);

    const after = (
      [...container.querySelectorAll('.og-header-cell')].find((el) =>
        el.textContent?.includes('Name'),
      ) as HTMLElement
    ).style.width;
    // Width should reflect the drag delta (150 + 60 = 210px).
    expect(after).toBe('210px');
    expect(before).not.toBe(210);
  });
});
