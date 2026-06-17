import { test, expect, type Page, type Locator } from '@playwright/test';

// The playground renders 10k rows with ID/Name pinned left, Active pinned right,
// checkbox selection, a quick filter, and a "Group by Department" toggle — a good
// surface for the layout invariants that jsdom cannot verify.

/** Set scroll position and notify React. Timing is handled by web-first
 * (auto-retrying) assertions in the tests, so no fixed wait is needed here. */
async function setScroll(page: Page, top: number, left = 0) {
  await page.locator('.og-body').evaluate(
    (el, p) => {
      el.scrollTop = p.top;
      el.scrollLeft = p.left;
      el.dispatchEvent(new Event('scroll', { bubbles: true }));
    },
    { top, left },
  );
}

/** Top of an element relative to the viewport, or null if not present. */
async function boxTop(locator: Locator): Promise<number | null> {
  const box = await locator.boundingBox();
  return box ? box.y : null;
}

test.describe('OpenGrid layout smoke tests', () => {
  test('renders the grid with a header and data rows', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.og-grid')).toBeVisible();
    await expect(page.locator('.og-header').first()).toBeVisible();
    await expect(page.locator('.og-body .og-row').first()).toBeVisible();
  });

  test('pinned column stays pixel-aligned with center rows after vertical scroll', async ({
    page,
  }) => {
    await page.goto('/');
    await setScroll(page, 600);

    // Poll until React has applied the scroll: a row mid-window in the pinned pane.
    const pinnedRow = page.locator('.og-pinned-left-body .og-row').nth(2);
    await expect(pinnedRow).toBeVisible();
    const rowId = await pinnedRow.getAttribute('data-og-row-id');
    expect(rowId).toBeTruthy();

    const pinned = page.locator(`.og-pinned-left-body [data-og-row-id="${rowId}"]`);
    const center = page.locator(`.og-body [data-og-row-id="${rowId}"]`);

    // The same row must sit at the same vertical position in both panes.
    // (Regression guard for the pinned-pane scroll-desync bug.)
    await expect
      .poll(async () => {
        const [p, c] = [await boxTop(pinned), await boxTop(center)];
        return p != null && c != null ? Math.abs(p - c) : Infinity;
      })
      .toBeLessThanOrEqual(1);
  });

  test('pinned panes stay fixed horizontally while the center scrolls', async ({ page }) => {
    // Narrow viewport so the center columns overflow and can actually scroll.
    await page.setViewportSize({ width: 640, height: 700 });
    await page.goto('/');

    const pinnedHeaderCell = page.locator('.og-pinned-left-header .og-header-cell').nth(1);
    const dept = page.getByText('Department', { exact: true });

    const pinnedXBefore = (await pinnedHeaderCell.boundingBox())!.x;
    const deptBefore = (await dept.boundingBox())!.x;

    await setScroll(page, 0, 200);

    // Sanity: the center pane genuinely scrolled horizontally.
    await expect.poll(() => page.locator('.og-body').evaluate((el) => el.scrollLeft)).toBeGreaterThan(150);

    // Pinned header does not move; the center column shifts left by ~scrollLeft.
    await expect
      .poll(async () => Math.abs((await pinnedHeaderCell.boundingBox())!.x - pinnedXBefore))
      .toBeLessThanOrEqual(1);
    await expect
      .poll(async () => deptBefore - (await dept.boundingBox())!.x)
      .toBeGreaterThan(150);
  });

  test('scrolls 10k rows without console or page errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    for (const top of [4000, 40000, 0]) {
      await setScroll(page, top);
      // Settle point: the body still has rendered rows after each scroll.
      await expect(page.locator('.og-body .og-row').first()).toBeVisible();
    }

    expect(errors).toEqual([]);
  });
});

test.describe('OpenGrid grouping (browser layout)', () => {
  async function groupByDepartment(page: Page) {
    await page.goto('/');
    await page.getByRole('button', { name: 'Group by Department' }).click();
    await expect(page.locator('.og-body .og-group-row').first()).toBeVisible();
  }

  test('group rows in the center align with the pinned-pane spacers', async ({ page }) => {
    await groupByDepartment(page);

    // The first group header renders in the center; the pinned-left pane renders
    // an aligned spacer (same class, no content) so rows stay level.
    const centerGroup = page.locator('.og-body .og-group-row').first();
    const pinnedSpacer = page.locator('.og-pinned-left-body .og-group-row').first();

    await expect(pinnedSpacer).toBeVisible();
    await expect
      .poll(async () => {
        const [c, p] = [await boxTop(centerGroup), await boxTop(pinnedSpacer)];
        return c != null && p != null ? Math.abs(c - p) : Infinity;
      })
      .toBeLessThanOrEqual(1);
  });

  test('clicking a group toggle collapses it in the browser', async ({ page }) => {
    await groupByDepartment(page);

    const firstGroup = page.locator('.og-body .og-group-row').first();
    // Expanded groups expose a "Collapse group" control.
    await firstGroup.getByLabel('Collapse group').click();

    // After collapsing, that same group now offers an "Expand group" control.
    await expect(page.locator('.og-body .og-group-row').first().getByLabel('Expand group')).toBeVisible();
  });
});
