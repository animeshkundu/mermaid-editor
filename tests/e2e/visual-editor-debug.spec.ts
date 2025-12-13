/**
 * Simplified visual editor test to debug issues
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Editor - Debug', () => {
  test('should show visual panel when edit-mode is set', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Set edit mode to visual directly via localStorage
    await page.goto('/');
    
    await page.evaluate(() => {
      localStorage.setItem('edit-mode', '"visual"');
      localStorage.setItem('mermaid-code', 'flowchart TD\\n    A[Start] --> B[End]');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Debug: Check what the React state actually is
    const debugInfo = await page.evaluate(() => {
      const editMode = localStorage.getItem('edit-mode');
      const parsedMode = editMode ? JSON.parse(editMode) : null;
      
      // Look for the visual panel in DOM
      const panels = Array.from(document.querySelectorAll('[data-panel]')).map(el => el.getAttribute('data-panel'));
      
      // Check if ResizablePanel exists
      const hasResizablePanel = !!document.querySelector('.react-resizable-panel');
      
      return {
        editMode,
        parsedMode,
        panels,
        hasResizablePanel,
        windowWidth: window.innerWidth
      };
    });
    
    console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
    
    // Check if visual panel is visible
    const visualPanel = page.locator('[data-panel="visual"]');
    await expect(visualPanel).toBeVisible({ timeout: 5000 });
  });
});
