import { test, expect, type Page } from '@playwright/test';

// The playground renders 10k rows with ID/Name pinned left, Active pinned right,
// checkbox selection, and a quick filter — a good surface for layout smoke tests.

async function scrollBody(page: Page, top: number, left = 0) {
  await page.locator('.og-body').evaluate(
    (el, { top, left }) => {
      el.scrollTop = top;
      el.scrollLeft = left;
      el.dispatchEvent(new Event('scroll', { bubbles: true }));
    },
    { top, left },
  );
  // Let React flush the virtualization + transform updates.
  await page.waitForTimeout(150);
}

test.describe('OpenGrid layout smoke tests', () => {
  test('renders the grid with a header and data rows', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.og-grid')).toBeVisible();
    await expect(page.locator('.og-header').first()).toBeVisible();
    expect(await page.locator('.og-body .og-row').count()).toBeGreaterThan(0);
  });

  test('pinned column stays pixel-aligned with center rows after vertical scroll', async ({
    page,
  }) => {
    await page.goto('/');
    await scrollBody(page, 600);

    // Pick a row id that is rendered in the pinned-left pane after scrolling.
    const rowId = await page
      .locator('.og-pinned-left-body .og-row')
      .nth(2)
      .getAttribute('data-og-row-id');
    expect(rowId).toBeTruthy();

    const pinnedBox = await page
      .locator(`.og-pinned-left-body [data-og-row-id="${rowId}"]`)
      .boundingBox();
    const centerBox = await page
      .locator(`.og-body [data-og-row-id="${rowId}"]`)
      .boundingBox();

    expect(pinnedBox).not.toBeNull();
    expect(centerBox).not.toBeNull();
    // The same row must sit at the same vertical position in both panes.
    // (Regression guard for the pinned-pane scroll-desync bug.)
    expect(Math.abs(pinnedBox!.y - centerBox!.y)).toBeLessThanOrEqual(1);
  });

  test('pinned panes stay fixed horizontally while the center scrolls', async ({ page }) => {
    // Narrow viewport so the center columns overflow and can actually scroll.
    await page.setViewportSize({ width: 640, height: 700 });
    await page.goto('/');

    const pinnedHeaderCell = page.locator('.og-pinned-left-header .og-header-cell').nth(1);
    const dept = page.getByText('Department', { exact: true });

    const pinnedXBefore = (await pinnedHeaderCell.boundingBox())!.x;
    const deptBefore = (await dept.boundingBox())!.x;

    await scrollBody(page, 0, 200);

    // Sanity: the center pane genuinely scrolled horizontally.
    const scrollLeft = await page.locator('.og-body').evaluate((el) => el.scrollLeft);
    expect(scrollLeft).toBeGreaterThan(150);

    const pinnedXAfter = (await pinnedHeaderCell.boundingBox())!.x;
    const deptAfter = (await dept.boundingBox())!.x;

    // Pinned header does not move; the center column shifts left by ~scrollLeft.
    expect(Math.abs(pinnedXAfter - pinnedXBefore)).toBeLessThanOrEqual(1);
    expect(deptBefore - deptAfter).toBeGreaterThan(150);
  });

  test('scrolls 10k rows without console or page errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await scrollBody(page, 4000);
    await scrollBody(page, 40000);
    await scrollBody(page, 0);

    expect(errors).toEqual([]);
  });
});
