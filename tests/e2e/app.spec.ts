import { test, expect } from '@playwright/test';

const DIAGRAM_RENDER_TIMEOUT = 5000;

test.describe('Mermaid Live Editor integration', () => {
  test('renders and updates the preview when loading an example', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Mermaid Live Editor' })).toBeVisible();

    const diagram = page.getByTestId('mermaid-diagram');
    await expect(diagram.locator('svg')).toBeVisible();

    await page.getByRole('button', { name: 'Examples' }).click();
    await page.getByRole('menuitem', { name: 'Sequence Diagram' }).click();

    await expect(diagram.locator('text', { hasText: 'Alice' }).first()).toBeVisible({ timeout: DIAGRAM_RENDER_TIMEOUT });
    await expect(diagram.locator('text', { hasText: 'Bob' }).first()).toBeVisible({ timeout: DIAGRAM_RENDER_TIMEOUT });
  });
});
