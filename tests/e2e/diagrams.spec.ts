import { test, expect, Page } from '@playwright/test';

const DIAGRAM_RENDER_TIMEOUT = 12000;
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const loadExample = async (page: Page, name: string, expectedText?: string) => {
  await page.getByRole('button', { name: 'Examples' }).click();
  const matcher = new RegExp(`^\\s*${escapeRegex(name)}`, 'i');
  const item = page.getByRole('menuitem').filter({ hasText: matcher }).first();
  await expect(item).toBeVisible();
  await item.click();
  await expect(page.getByText(new RegExp(`Loaded:\\s*${escapeRegex(name)}`, 'i'))).toBeVisible({ timeout: 5000 });

  if (expectedText) {
    await expect(page.getByTestId('mermaid-diagram')).toContainText(expectedText, { timeout: DIAGRAM_RENDER_TIMEOUT });
  }
};

const diagramChecks: { name: string; texts: string[]; ensureCircle?: boolean }[] = [
  { name: 'Basic Flowchart', texts: ['Start', 'Is it?', 'OK', 'End', 'Yes', 'No'] },
  { name: 'Complex Flowchart', texts: ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'] },
  { name: 'Sequence Diagram', texts: ['Alice', 'John', 'Bob', 'Hello John'] },
  { name: 'Class Diagram', texts: ['Animal', 'Duck', 'Fish', 'Zebra', 'beakColor'] },
  { name: 'State Diagram', texts: ['Still', 'Moving', 'Crash'] },
  { name: 'Entity Relationship', texts: ['CUSTOMER', 'ORDER', 'LINE-ITEM', 'DELIVERY-ADDRESS'] },
  { name: 'Gantt Chart', texts: ['A Gantt Diagram', 'Section', 'Another', 'A task', 'Another task'] },
  { name: 'Pie Chart', texts: ['Pets adopted by volunteers', 'Dogs', 'Cats', 'Rats'] },
  { name: 'User Journey', texts: ['My working day', 'Go to work', 'Go home', 'Make tea', 'Do work'] },
  { name: 'Git Graph', texts: ['main', 'develop'], ensureCircle: true },
  { name: 'Mindmap', texts: ['mindmap', 'Origins', 'Research', 'Tools', 'Mermaid'] },
  { name: 'Timeline', texts: ['History of Social Media Platform', 'LinkedIn', 'Facebook', 'Twitter'] },
  { name: 'Quadrant Chart', texts: ['Reach and engagement of campaigns', 'Campaign A', 'Campaign F'] },
  { name: 'Requirement Diagram', texts: ['test_req', 'test_entity', 'verification', 'risk: high'] },
  { name: 'C4 Context Diagram', texts: ['System Context diagram for Internet Banking System', 'Banking Customer A', 'Internet Banking System', 'E-mail system'] },
  { name: 'Sankey Diagram', texts: ["Agricultural 'waste'", 'Bio-conversion', 'Electricity grid'] },
  { name: 'XY Chart', texts: ['Sales Revenue', 'Revenue (in $)', 'jan', 'dec'] },
  { name: 'Block Diagram', texts: ['DB', 'A', 'B', 'C', 'D'] },
  { name: 'Packet Diagram', texts: ['Source Port', 'Destination Port', 'Sequence Number', 'Checksum'] },
  { name: 'Kanban Board', texts: ['Todo', 'In Progress', 'Done', 'Design new feature', 'Deploy to staging'] },
  { name: 'Architecture Diagram', texts: ['API', 'Database', 'Storage', 'Server'] },
];

test.describe('Mermaid diagram examples', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Mermaid Live Editor' })).toBeVisible();
  });

  for (const example of diagramChecks) {
    test(`renders ${example.name}`, async ({ page }) => {
      const diagram = page.getByTestId('mermaid-diagram');

      await loadExample(page, example.name, example.texts[0]);
      await expect(diagram.locator('svg').first()).toBeVisible({ timeout: DIAGRAM_RENDER_TIMEOUT });

      const textContent = (await diagram.innerText()).toLowerCase();
      for (const text of example.texts) {
        expect(textContent).toContain(text.toLowerCase());
      }

      if (example.ensureCircle) {
        await expect(diagram.locator('circle').first()).toBeVisible({ timeout: DIAGRAM_RENDER_TIMEOUT });
      }
    });
  }
});
