import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const replaceEditorSource = async (page: Page, code: string) => {
  await page.locator('.monaco-editor').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(code);
};

const expectSuggestion = async (page: Page, code: string, label: string) => {
  await replaceEditorSource(page, code);
  await page.keyboard.press('Control+Space');
  const widget = page.locator('.suggest-widget');
  await expect(widget).toBeVisible();
  await expect(widget).toContainText(label);
  await page.keyboard.press('Escape');
};

test('provides context keywords and starter snippets even while source is invalid', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });

  await expectSuggestion(page, 'sequenceDiagram\n  part', 'participant');
  await expectSuggestion(page, 'sequenceDiagram\n  Seq', 'Sequence Diagram starter');
  await expectSuggestion(page, 'flowchart TD\n  sub', 'subgraph');
  await expectSuggestion(page, 'flowchart TD\n  Basic', 'Basic Flowchart starter');
});

test('applies a generic starter snippet as valid full-document source', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });

  await replaceEditorSource(page, 'Architecture');
  await page.keyboard.press('Control+Space');
  const widget = page.locator('.suggest-widget');
  const starter = widget
    .locator('.monaco-list-row')
    .filter({ hasText: 'Architecture Diagram starter' });
  await expect(starter).toBeVisible();
  await starter.dblclick();

  await expect
    .poll(() =>
      page.evaluate(() => {
        const monacoWindow = window as typeof window & {
          monaco?: {
            editor: {
              getModels(): Array<{ getValue(): string }>;
            };
          };
        };
        return monacoWindow.monaco?.editor.getModels()[0]?.getValue() ?? '';
      })
    )
    .toMatch(/^architecture-beta/m);
  await expect(page.getByTestId('mermaid-diagram')).toContainText('API', {
    timeout: 15000,
  });
  await expect(page.locator('.squiggly-error')).toHaveCount(0);
});
