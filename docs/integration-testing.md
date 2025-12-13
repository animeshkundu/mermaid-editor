# Integration testing for the Mermaid Live Editor

This project now uses **Playwright** for browser-level integration tests so we can automatically verify core user flows in a pure client-side environment—no manual clicking required.

## Approach (from common client-side testing guidance)

- Run tests in a real browser (Chromium) to validate rendering, focus handling, keyboard input, and Mermaid SVG output.
- Spin up the Vite dev server locally and point Playwright at it via a `baseURL`.
- Use accessible queries (roles/text) or stable `data-testid` hooks when necessary for controls created by Radix/shadcn.
- Keep tests fast and deterministic by avoiding external network calls; everything runs in-browser.

## How it works here

- Configuration lives in `playwright.config.ts`. It starts `npm run dev -- --host --port 5000`, reuses an existing server when possible, and pins the Chromium project for minimal installs.
- Tests live in `tests/e2e`. The initial smoke test opens the editor, edits the Monaco-backed code area, and asserts the Mermaid preview updates.
- The Playwright runner handles waiting for the debounced render (`trace: 'on-first-retry'` is enabled for debugging).

## Running the integration tests

1. Install Playwright's browser once (Chromium only):  
   ```bash
   npx playwright install --with-deps chromium
   ```
2. Run the suite:  
   ```bash
   npm run test:e2e
   ```

## Future coverage ideas

- Load diagram examples from the toolbar and assert the correct SVG labels appear.
- Toggle light/dark themes and verify the `document.documentElement` class changes.
- Exercise export/share flows by stubbing clipboard APIs and checking generated payloads.
- Add `data-testid` hooks to hard-to-target controls if Radix-generated markup becomes brittle.
