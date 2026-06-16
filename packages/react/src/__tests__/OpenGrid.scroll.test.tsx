import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { OpenGrid } from '../components/OpenGrid.js';
import type { ColumnDef } from '@opengrid/core';

type Row = { id: number; name: string; city: string };

const columns: ColumnDef<Row>[] = [
  { field: 'id', headerName: 'ID', width: 80, pinned: 'left' },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'city', headerName: 'City', width: 150 },
];

const rows: Row[] = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  name: `Name ${i}`,
  city: `City ${i}`,
}));

function rowIds(pane: Element | null): string[] {
  if (!pane) return [];
  return [...pane.querySelectorAll('.og-row')].map((r) => r.getAttribute('data-og-row-id') ?? '');
}

function scrollCenter(container: HTMLElement, top: number) {
  const center = container.querySelector('.og-body') as HTMLElement;
  // Drive scrollTop through the fired event so the handler reads the new value
  // regardless of jsdom's (non-)layout behavior.
  center.scrollTop = top;
  fireEvent.scroll(center, { target: { scrollTop: top } });
  return center;
}

describe('OpenGrid vertical scroll / pinned panes', () => {
  it('translates the pinned-left pane to track the center scroll position', () => {
    const { container } = render(
      <OpenGrid columnDefs={columns} rowData={rows} height={200} rowHeight={40} />,
    );
    const pinnedInner = container.querySelector('.og-pinned-left-body > div') as HTMLElement;
    // No scroll yet → no vertical offset
    expect(pinnedInner.style.transform).toBe('translateY(-0px)');

    scrollCenter(container, 400);

    // Regression: pinned pane must shift up by exactly the scroll amount so its
    // rows stay aligned with the natively-scrolled center pane.
    expect(pinnedInner.style.transform).toBe('translateY(-400px)');
  });

  it('does not apply a vertical transform to the natively-scrolled center pane', () => {
    const { container } = render(
      <OpenGrid columnDefs={columns} rowData={rows} height={200} rowHeight={40} />,
    );
    scrollCenter(container, 400);
    const centerInner = container.querySelector('.og-body > div') as HTMLElement;
    expect(centerInner.style.transform ?? '').not.toContain('translateY');
  });

  it('renders the same set of rows in the pinned and center panes after scrolling', () => {
    const { container } = render(
      <OpenGrid columnDefs={columns} rowData={rows} height={200} rowHeight={40} />,
    );
    scrollCenter(container, 400);

    const pinnedIds = rowIds(container.querySelector('.og-pinned-left-body'));
    const centerIds = rowIds(container.querySelector('.og-body'));
    expect(pinnedIds.length).toBeGreaterThan(0);
    expect(pinnedIds).toEqual(centerIds);
  });

  it('updates the virtualized window when scrolled (recycles rows)', () => {
    const { container } = render(
      <OpenGrid columnDefs={columns} rowData={rows} height={200} rowHeight={40} />,
    );
    // Row 0 is rendered at the top initially.
    expect(rowIds(container.querySelector('.og-body'))).toContain('row-0');

    scrollCenter(container, 800); // ~row 20

    const ids = rowIds(container.querySelector('.og-body'));
    expect(ids).not.toContain('row-0'); // scrolled out of the window
    expect(ids).toContain('row-20'); // now within the window
  });
});
