import { test, expect, Page } from '@playwright/test';

const DIAGRAM_RENDER_TIMEOUT = 12000;
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const loadExample = async (page: Page, name: string = 'Basic Flowchart', expectedText: string = 'Start') => {
  await page.getByRole('button', { name: 'Examples' }).click();
  const matcher = new RegExp(`^\\s*${escapeRegex(name)}`, 'i');
  const item = page.getByRole('menuitem').filter({ hasText: matcher }).first();
  await expect(item).toBeVisible();
  await item.click();
  await expect(page.getByText(new RegExp(`Loaded:\\s*${escapeRegex(name)}`, 'i'))).toBeVisible({ timeout: 5000 });
  const diagram = page.getByTestId('mermaid-diagram');
  await expect(diagram.locator('svg')).toBeVisible({ timeout: DIAGRAM_RENDER_TIMEOUT });
  await expect(diagram).toContainText(expectedText, { timeout: DIAGRAM_RENDER_TIMEOUT });
  return diagram;
};

test.describe('Toolbar actions', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.addInitScript(() => {
      if (typeof ClipboardItem === 'undefined') {
        // @ts-expect-error ClipboardItem polyfill for headless context
        class ClipboardItemPolyfill {
          types: string[];
          constructor(data: Record<string, Blob>) {
            this.types = Object.keys(data);
            Object.assign(this, data);
          }
        }
        // @ts-expect-error ClipboardItem polyfill for headless context
        window.ClipboardItem = ClipboardItemPolyfill;
      }

      const store: { text: string; items: ClipboardItem[] } = { text: '', items: [] };
      const clipboard = {
        writeText: async (text: string) => {
          store.text = text;
        },
        readText: async () => store.text,
        write: async (items: ClipboardItem[]) => {
          store.items = items;
        },
        read: async () => store.items,
      };
      Object.defineProperty(navigator, 'clipboard', {
        value: clipboard,
        configurable: true,
      });

      type ClipboardWindow = Window & { __clipboardStore?: typeof store };
      (window as ClipboardWindow).__clipboardStore = store;
    });

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Mermaid Live Editor' })).toBeVisible();
  });

  test('copies code and share link', async ({ page }) => {
    await loadExample(page, 'Basic Flowchart');

    // Validate clipboard wiring before invoking share
    await page.evaluate(() => navigator.clipboard.writeText('seed'));
    await page.evaluate(() => {
      const store = (window as { __clipboardStore?: { text?: string } }).__clipboardStore;
      if (store) store.text = '';
    });

    await page.getByTestId('toolbar-copy-code').click();
    const copiedCode = await page.evaluate(() => {
      const store = (window as { __clipboardStore?: { text?: string } }).__clipboardStore;
      return store?.text ?? '';
    });
    expect(copiedCode).toContain('flowchart TD');

    await page.getByTestId('toolbar-share').click();
    await page.waitForFunction(() => {
      const store = (window as { __clipboardStore?: { text?: string } }).__clipboardStore;
      return !!store?.text && store.text.startsWith('http') && store.text.includes('#');
    }, null, { timeout: 15000 });
  });

  test('copies image to clipboard', async ({ page }) => {
    await loadExample(page, 'Basic Flowchart');

    await page.getByTestId('toolbar-copy-image').click();
    await page.waitForFunction(() => {
      const store = (window as { __clipboardStore?: { items?: ClipboardItem[] } }).__clipboardStore;
      return Array.isArray(store?.items) && store.items.length > 0;
    }, null, { timeout: 15000 });
    const types = await page.evaluate(() => {
      const store = (window as { __clipboardStore?: { items?: ClipboardItem[] } }).__clipboardStore;
      return store?.items?.[0]?.types ?? [];
    });
    expect(types).toContain('image/png');
  });

  test('exports diagram as svg, png, and markdown', async ({ page }) => {
    await loadExample(page, 'Basic Flowchart');

    const openExportMenu = async () => {
      await page.getByTestId('toolbar-export').click();
      const svgVisible = await page
        .locator('[role="menuitem"]', { hasText: 'Export as SVG' })
        .first()
        .isVisible()
        .catch(() => false);
      if (!svgVisible) {
        await page.waitForTimeout(100);
        await page.getByTestId('toolbar-export').click({ force: true });
      }
    };

    await openExportMenu();
    const [svgDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('menuitem', { name: 'Export as SVG' }).click(),
    ]);
    expect(svgDownload.suggestedFilename()).toMatch(/\.svg$/i);
    await svgDownload.delete();

    await openExportMenu();
    await page.waitForTimeout(200);
    await page.waitForSelector('[role="menuitem"]', { state: 'attached' });
    const pngTrigger = page.locator('[role="menuitem"]', { hasText: 'Export as PNG' }).first();
    await pngTrigger.waitFor();
    await pngTrigger.click();
    const pngOption = page.locator('[role="menuitem"]', { hasText: '1x (Normal)' }).first();
    await pngOption.waitFor();
    const [pngDownload] = await Promise.all([
      page.waitForEvent('download'),
      pngOption.click(),
    ]);
    expect(pngDownload.suggestedFilename()).toMatch(/\.png$/i);
    await pngDownload.delete();

    await openExportMenu();
    const [mdDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('menuitem', { name: 'Export as Markdown' }).click(),
    ]);
    expect(mdDownload.suggestedFilename()).toMatch(/\.md$/i);
    await mdDownload.delete();
  });
});
