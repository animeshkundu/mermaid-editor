/**
 * Integration tests for Visual Editor (Phase 1)
 * 
 * Tests the complete flowchart visual editing flow:
 * - Text to Visual synchronization
 * - Visual to Text synchronization
 * - Node dragging and position persistence
 * - Bidirectional round-trip fidelity
 */

import { test, expect } from '@playwright/test';

const FLOWCHART_CODE = `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]
    C --> D`;

test.describe('Visual Editor - Phase 1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should toggle to visual mode', async ({ page }) => {
    // Check that text mode is active by default
    const textButton = page.getByTestId('edit-mode-text');
    await expect(textButton).toBeVisible();

    // Load a flowchart first
    const examplesButton = page.getByRole('button', { name: /examples/i });
    await examplesButton.click();
    const flowchartExample = page.getByText(/basic flowchart/i).first();
    await flowchartExample.click();
    await page.waitForTimeout(500);

    // Find and click the visual mode toggle button
    const visualButton = page.getByTestId('edit-mode-visual');
    await visualButton.click();

    // Wait a bit for mode to switch
    await page.waitForTimeout(1000);

    // Check that visual panel is visible
    const visualPanel = page.locator('[data-panel="visual"]');
    await expect(visualPanel).toBeVisible({ timeout: 5000 });
  });

  test('should parse flowchart code into visual state', async ({ page }) => {
    // Load flowchart example
    const examplesButton = page.getByRole('button', { name: /examples/i });
    await examplesButton.click();

    const flowchartExample = page.getByText(/basic flowchart/i).first();
    await flowchartExample.click();

    // Wait for code to load
    await page.waitForTimeout(500);

    // Switch to visual mode
    const visualButton = page.getByTestId('edit-mode-visual');
    await visualButton.click();

    // Wait for React Flow to render
    await page.waitForTimeout(1000);

    // Check that React Flow canvas is visible
    const reactFlowCanvas = page.locator('.react-flow');
    await expect(reactFlowCanvas).toBeVisible({ timeout: 5000 });

    // Check that nodes are rendered
    const nodes = page.locator('.react-flow__node');
    await expect(nodes.first()).toBeVisible({ timeout: 5000 });
  });

  test('should synchronize visual changes back to text', async ({ page }) => {
    // Set simple flowchart code
    await page.evaluate((code) => {
      localStorage.setItem('mermaid-code', code);
    }, FLOWCHART_CODE);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Switch to visual mode
    const visualButton = page.getByTestId('edit-mode-visual');
    await visualButton.click();
    await page.waitForTimeout(1500); // Wait for parsing and rendering

    // Check React Flow rendered
    const reactFlowCanvas = page.locator('.react-flow');
    await expect(reactFlowCanvas).toBeVisible({ timeout: 5000 });

    // Drag a node to new position
    const firstNode = page.locator('.react-flow__node').first();
    await expect(firstNode).toBeVisible({ timeout: 5000 });
    
    const box = await firstNode.boundingBox();
    if (box) {
      // Drag node by 100px
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100);
      await page.mouse.up();
    }

    // Wait for sync debounce (300ms)
    await page.waitForTimeout(500);

    // Switch back to text mode
    const textButton = page.getByTestId('edit-mode-text');
    await textButton.click();
    await page.waitForTimeout(300);

    // Check that position metadata was added to code
    const code = await page.evaluate(() => {
      return localStorage.getItem('mermaid-code') || '';
    });

    // Should contain position metadata comments
    expect(code).toContain('%%{');
    expect(code).toContain('"position"');
  });

  test('should preserve node positions on round-trip', async ({ page }) => {
    const codeWithPositions = `flowchart TD
    A[Start] %%{"position":{"x":100,"y":100}}%%
    B[End] %%{"position":{"x":300,"y":100}}%%
    A --> B`;

    await page.evaluate((code) => {
      localStorage.setItem('mermaid-code', code);
    }, codeWithPositions);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Switch to visual mode
    const visualButton = page.getByTestId('edit-mode-visual');
    await visualButton.click();
    await page.waitForTimeout(1500);

    // Get node positions
    const nodeA = page.locator('.react-flow__node').filter({ hasText: 'Start' });
    const nodeB = page.locator('.react-flow__node').filter({ hasText: 'End' });

    await expect(nodeA).toBeVisible({ timeout: 5000 });
    await expect(nodeB).toBeVisible({ timeout: 5000 });

    const posA = await nodeA.boundingBox();
    const posB = await nodeB.boundingBox();

    // Positions should roughly match the metadata
    expect(posA).not.toBeNull();
    expect(posB).not.toBeNull();

    if (posA && posB) {
      // NodeB should be ~200px to the right of NodeA
      const xDiff = posB.x - posA.x;
      expect(xDiff).toBeGreaterThan(150);
      expect(xDiff).toBeLessThan(250);
    }
  });

  test('should handle invalid flowchart code gracefully', async ({ page }) => {
    const invalidCode = `flowchart TD
    A[Node without edge
    B[Missing bracket`;

    await page.evaluate((code) => {
      localStorage.setItem('mermaid-code', code);
    }, invalidCode);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Try to switch to visual mode
    const visualButton = page.getByTestId('edit-mode-visual');
    await visualButton.click();
    await page.waitForTimeout(1000);

    // Should show some error or fallback state (not crash)
    // At minimum, page should still be responsive
    const toolbar = page.locator('[role="toolbar"], header, nav').first();
    await expect(toolbar).toBeVisible();
  });

  test('should support React Flow controls (pan, zoom)', async ({ page }) => {
    await page.evaluate((code) => {
      localStorage.setItem('mermaid-code', code);
    }, FLOWCHART_CODE);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Switch to visual mode
    const visualButton = page.getByTestId('edit-mode-visual');
    await visualButton.click();
    await page.waitForTimeout(1500);

    // Check that React Flow controls are visible
    const controls = page.locator('.react-flow__controls');
    await expect(controls).toBeVisible({ timeout: 5000 });

    // Check for zoom buttons
    const zoomIn = page.locator('.react-flow__controls button[aria-label*="zoom in"], .react-flow__controls button').first();
    await expect(zoomIn).toBeVisible();
  });

  test('should display minimap', async ({ page }) => {
    await page.evaluate((code) => {
      localStorage.setItem('mermaid-code', code);
    }, FLOWCHART_CODE);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Switch to visual mode
    const visualButton = page.getByTestId('edit-mode-visual');
    await visualButton.click();
    await page.waitForTimeout(1500);

    // Check that minimap is visible
    const minimap = page.locator('.react-flow__minimap');
    await expect(minimap).toBeVisible({ timeout: 5000 });
  });

  test('should auto-layout nodes without position metadata', async ({ page }) => {
    const codeWithoutPositions = `flowchart TD
    A[Start]
    B[Step 1]
    C[Step 2]
    D[End]
    A --> B
    B --> C
    C --> D`;

    await page.evaluate((code) => {
      localStorage.setItem('mermaid-code', code);
    }, codeWithoutPositions);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Switch to visual mode
    const visualButton = page.getByTestId('edit-mode-visual');
    await visualButton.click();
    await page.waitForTimeout(1500);

    // All nodes should be visible (not stacked)
    const nodes = page.locator('.react-flow__node');
    const count = await nodes.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // Nodes should be laid out (not all at 0,0)
    const positions = [];
    for (let i = 0; i < Math.min(count, 4); i++) {
      const node = nodes.nth(i);
      const box = await node.boundingBox();
      if (box) {
        positions.push({ x: box.x, y: box.y });
      }
    }

    // At least 2 nodes should have different positions
    const uniquePositions = new Set(positions.map(p => `${p.x},${p.y}`));
    expect(uniquePositions.size).toBeGreaterThan(1);
  });
});
