# Integration testing for the Mermaid Live Editor

This project now uses **Playwright** for browser-level integration tests so we can automatically verify core user flows in a pure client-side environment—no manual clicking required.

## Approach (from common client-side testing guidance)

- Run tests in a real browser (Chromium) to validate rendering, focus handling, keyboard input, and Mermaid SVG output.
- Spin up the Vite dev server locally and point Playwright at it via a `baseURL`.
- Use accessible queries (roles/text) or stable `data-testid` hooks when necessary for controls created by Radix/shadcn.
- Keep tests fast and deterministic by avoiding external network calls; everything runs in-browser.

## How it works here

- Configuration lives in `playwright.config.ts`. The harness (`scripts/start-test-server.js`) first probes for an existing dev server; if none is running it builds the app and starts `npm run preview -- --host --port 5000`, then keeps the server alive for the suite.
- Tests live in `tests/e2e`. The suite covers every built-in diagram example (nodes/edges text assertions), copy/share/export actions (clipboard + downloads), and the preview rendering path.
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

## Coverage goal

The Playwright suite targets ≥90% coverage of critical UI flows by exercising:
- All built-in Mermaid examples (preview text/edges)
- Copy code, copy image, and share link actions (clipboard stubs)
- SVG/PNG/Markdown exports (download assertions)

## Future coverage ideas

- Load diagram examples from the toolbar and assert the correct SVG labels appear.
- Toggle light/dark themes and verify the `document.documentElement` class changes.
- Exercise export/share flows by stubbing clipboard APIs and checking generated payloads.
- Add `data-testid` hooks to hard-to-target controls if Radix-generated markup becomes brittle.
