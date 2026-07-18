import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const RENDER_TIMEOUT = 15000;
const STALE_WARNING = 'Exported last valid diagram — current source has errors';

const openExportMenu = async (page: Page) => {
  const exportButton = page.getByTestId('toolbar-export');
  const svgMenuItem = page.getByRole('menuitem', { name: 'Export as SVG' });
  if (await svgMenuItem.isVisible()) {
    return;
  }
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await exportButton.click();
    try {
      await svgMenuItem.waitFor({ state: 'visible', timeout: 1000 });
      return;
    } catch {
      /* retry */
    }
  }
  await svgMenuItem.waitFor({ state: 'visible', timeout: 5000 });
};

const replaceEditorSource = async (page: Page, code: string) => {
  const editor = page.locator('.monaco-editor');
  await editor.click();
  await page.keyboard.press('Control+A');
  if (code) {
    await page.keyboard.insertText(code);
  } else {
    await page.keyboard.press('Backspace');
  }
};

test.describe('render resilience', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.addInitScript(() => {
      if (typeof ClipboardItem === 'undefined') {
        class ClipboardItemPolyfill {
          types: string[];
          private readonly data: Record<string, Blob>;

          constructor(data: Record<string, Blob>) {
            this.types = Object.keys(data);
            this.data = data;
          }

          async getType(type: string) {
            return this.data[type];
          }
        }
        Object.defineProperty(window, 'ClipboardItem', {
          value: ClipboardItemPolyfill,
          configurable: true,
        });
      }

      const store: { text: string; items: ClipboardItem[] } = { text: '', items: [] };
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async (text: string) => {
            store.text = text;
          },
          readText: async () => store.text,
          write: async (nextItems: ClipboardItem[]) => {
            store.items = nextItems;
          },
          read: async () => store.items,
        },
        configurable: true,
      });
      (
        window as typeof window & {
          __resilienceClipboard?: typeof store;
        }
      ).__resilienceClipboard = store;
    });

    await page.goto('/');
    await expect(page.getByTestId('mermaid-diagram').locator('svg')).toBeVisible({
      timeout: RENDER_TIMEOUT,
    });
  });

  test('retains a compatible SVG, publishes one marker, and recovers leak-free', async ({
    page,
  }) => {
    await replaceEditorSource(page, 'flowchart TD\n  A -->');

    const feedback = page.getByText('Rendering paused — showing last valid diagram');
    await expect(feedback).toBeVisible({ timeout: RENDER_TIMEOUT });
    const feedbackRegion = page.getByTestId('render-feedback');
    const retainedDiagram = page.getByTestId('mermaid-diagram');
    await expect(feedbackRegion).toHaveAttribute('aria-live', 'polite');
    await expect(retainedDiagram).toHaveAttribute(
      'aria-label',
      'Rendering paused. Showing the previous valid diagram.'
    );
    await expect(retainedDiagram).toHaveAttribute(
      'aria-describedby',
      'mermaid-stale-preview-description'
    );
    await expect(page.locator('#mermaid-stale-preview-description')).toContainText(
      'The current source has errors'
    );
    await expect(retainedDiagram.locator('svg')).toBeVisible();
    await expect(page.getByText('Syntax Error', { exact: true })).toHaveCount(0);
    await expect(page.locator('.squiggly-error')).toHaveCount(1);
    await expect
      .poll(() =>
        page
          .getByTestId('mermaid-diagram')
          .evaluate((element) => Number(getComputedStyle(element).opacity))
      )
      .toBeLessThanOrEqual(0.46);

    const markers = await page.evaluate(() => {
      const monacoWindow = window as typeof window & {
        monaco?: {
          editor: {
            getModelMarkers(filter: { owner: string }): Array<{
              message: string;
              startLineNumber: number;
              startColumn: number;
              endColumn: number;
            }>;
          };
        };
      };
      return monacoWindow.monaco?.editor.getModelMarkers({ owner: 'mermaid' }) ?? [];
    });
    expect(markers).toHaveLength(1);
    expect(markers[0].message).toContain('Parse error');
    expect(markers[0].startLineNumber).toBe(2);
    expect(markers[0].startColumn).toBeGreaterThanOrEqual(1);
    expect(markers[0].endColumn).toBeGreaterThan(markers[0].startColumn);
    await expect(feedbackRegion).toContainText(markers[0].message);

    await page.locator('.monaco-editor').click();
    await page.keyboard.press('Control+Home');
    await page.keyboard.press('F8');
    await expect(page.locator('.marker-widget')).toBeVisible();
    await expect(page.locator('.marker-widget')).toContainText('Parse error');
    await page.keyboard.press('Shift+F8');
    await expect(page.locator('.marker-widget')).toContainText('Parse error');

    await replaceEditorSource(page, 'flowchart TD\n  A --> B\n  B --> C');
    await expect(feedback).toHaveCount(0, { timeout: RENDER_TIMEOUT });
    await expect(page.getByTestId('mermaid-diagram')).toContainText('C', {
      timeout: RENDER_TIMEOUT,
    });
    await expect(page.locator('.squiggly-error')).toHaveCount(0);

    const orphanCount = await page.locator(
      'body > [data-mermaid-render-container], body > [id^="dmermaid-preview-"], body > [id^="mermaid-preview-"]'
    ).count();
    expect(orphanCount).toBe(0);
  });

  test('keeps retained visual exports enabled and warns after SVG, PNG, and copy', async ({
    page,
  }) => {
    await replaceEditorSource(
      page,
      'flowchart TD\n  RetainedArtifact[Retained Artifact] --> Destination[Valid Destination]'
    );
    await expect(page.getByTestId('mermaid-diagram')).toContainText('Retained Artifact', {
      timeout: RENDER_TIMEOUT,
    });
    await replaceEditorSource(page, 'flowchart TD\n  A -->');
    await expect(
      page.getByText('Rendering paused — showing last valid diagram')
    ).toBeVisible({ timeout: RENDER_TIMEOUT });

    await expect(page.getByTestId('toolbar-export')).toBeEnabled();
    await expect(page.getByTestId('toolbar-copy-image')).toBeEnabled();

    await openExportMenu(page);
    const [svgDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('menuitem', { name: 'Export as SVG' }).click(),
    ]);
    expect(svgDownload.suggestedFilename()).toMatch(/\.svg$/i);
    const svgPath = await svgDownload.path();
    expect(svgPath).not.toBeNull();
    const downloadedSvg = await readFile(svgPath!, 'utf8');
    expect(downloadedSvg).toContain('Retained Artifact');
    expect(downloadedSvg).toContain('Valid Destination');
    await svgDownload.delete();
    await expect(page.getByText('Exported as SVG')).toBeVisible();
    await expect(page.getByText(STALE_WARNING).last()).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Export as SVG' })).toBeHidden();

    await openExportMenu(page);
    const pngMenuItem = page.getByRole('menuitem', { name: 'Export as PNG' });
    await pngMenuItem.click();
    const pngOption = page.getByRole('menuitem', { name: '1x (Normal)' });
    await expect(pngOption).toBeVisible();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      pngOption.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.png$/i);
    await download.delete();
    await expect(page.getByText('Exported as PNG')).toBeVisible();
    await expect(page.getByText(STALE_WARNING).last()).toBeVisible();

    await page.getByTestId('toolbar-copy-image').click();
    await expect(page.getByText('Image copied to clipboard')).toBeVisible({
      timeout: RENDER_TIMEOUT,
    });
    await expect(page.getByText(STALE_WARNING).last()).toBeVisible();
    const copiedImage = await page.evaluate(async () => {
      const store = (
        window as typeof window & {
          __resilienceClipboard?: { items: ClipboardItem[] };
        }
      ).__resilienceClipboard;
      const item = store?.items[0];
      const blob = item ? await item.getType('image/png') : null;
      return {
        types: item?.types ?? [],
        size: blob?.size ?? 0,
      };
    });
    expect(copiedImage.types).toContain('image/png');
    expect(copiedImage.size).toBeGreaterThan(0);
  });

  test('uses current raw source for copy, share, and Markdown while visual output is stale', async ({
    page,
  }) => {
    const invalidCode = 'flowchart TD\n  CurrentInvalid -->';
    await replaceEditorSource(page, invalidCode);
    await expect(
      page.getByText('Rendering paused — showing last valid diagram')
    ).toBeVisible({ timeout: RENDER_TIMEOUT });

    await page.getByTestId('toolbar-copy-code').click();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (
              window as typeof window & {
                __resilienceClipboard?: { text: string };
              }
            ).__resilienceClipboard?.text ?? ''
        )
      )
      .toBe(invalidCode);

    await page.getByTestId('toolbar-share').click();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (
              window as typeof window & {
                __resilienceClipboard?: { text: string };
              }
            ).__resilienceClipboard?.text ?? ''
        )
      )
      .toMatch(/^http:\/\/localhost:5000\/#/);
    const shareUrl = await page.evaluate(
      () =>
        (
          window as typeof window & {
            __resilienceClipboard?: { text: string };
          }
        ).__resilienceClipboard?.text ?? ''
    );
    const encodedState = new URL(shareUrl).hash.slice(1);
    const paddedState = encodedState
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(encodedState.length / 4) * 4, '=');
    const sharedState = JSON.parse(Buffer.from(paddedState, 'base64').toString('utf8'));
    expect(sharedState.code).toBe(invalidCode);

    await openExportMenu(page);
    const [markdownDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('menuitem', { name: 'Export as Markdown' }).click(),
    ]);
    const markdownPath = await markdownDownload.path();
    expect(markdownPath).not.toBeNull();
    expect(await readFile(markdownPath!, 'utf8')).toContain(invalidCode);
    await markdownDownload.delete();
    await expect(page.getByText('Exported as MARKDOWN')).toBeVisible();
    await expect(page.getByText(STALE_WARNING)).toHaveCount(0);
  });

  test('uses a blocking card after empty source and clears retained output on type change', async ({
    page,
  }) => {
    await replaceEditorSource(page, '');
    await expect(page.getByText('Start typing to see your diagram')).toBeVisible();
    await expect(page.locator('.squiggly-error')).toHaveCount(0);

    await replaceEditorSource(page, 'flowchart TD\n  A -->');
    await expect(page.getByText('Syntax Error', { exact: true })).toBeVisible({
      timeout: RENDER_TIMEOUT,
    });
    await expect(page.getByTestId('mermaid-diagram')).toHaveCount(0);

    await replaceEditorSource(page, 'flowchart TD\n  A --> B');
    await expect(page.getByTestId('mermaid-diagram').locator('svg')).toBeVisible({
      timeout: RENDER_TIMEOUT,
    });
    await replaceEditorSource(page, 'sequenceDiagram\n  A ->>');
    await expect(page.getByText('Syntax Error', { exact: true })).toBeVisible({
      timeout: RENDER_TIMEOUT,
    });
    await expect(page.getByTestId('mermaid-diagram')).toHaveCount(0);
  });

  test('continues rendering while the mobile preview tab is hidden', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 });
    await expect(page.getByRole('tab', { name: 'Preview' })).toBeVisible();
    await expect(page.getByTestId('mermaid-diagram').locator('svg')).toBeVisible({
      timeout: RENDER_TIMEOUT,
    });

    await page.getByRole('tab', { name: 'Editor' }).click();
    await replaceEditorSource(page, 'flowchart TD\n  A -->');
    await expect(page.locator('.squiggly-error')).toHaveCount(1, {
      timeout: RENDER_TIMEOUT,
    });

    await page.getByRole('tab', { name: 'Preview' }).click();
    await expect(
      page.getByText('Rendering paused — showing last valid diagram')
    ).toBeVisible();
    await expect(page.getByTestId('mermaid-diagram').locator('svg')).toBeVisible();
  });
});
