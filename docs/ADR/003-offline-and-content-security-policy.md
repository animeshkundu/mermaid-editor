# ADR-003: Offline Capability and Shared-Content Security

## Status

Accepted

## Date

2026-07-20

## Context

The editor previously loaded Google Fonts and Monaco from third-party origins, so the documented
offline behavior was not reliable. Mermaid image-shaped nodes also assign source-controlled values
to `Image.src`, which can fetch same-origin or cross-origin resources while opening a shared link.
Mermaid's `securityLevel` does not prevent that fetch.

## Decision

1. Monaco, its worker, and the three application fonts are bundled locally.
2. A standalone Workbox post-build step generates a versioned service worker that precaches the app
   shell, lazy Mermaid modules, Monaco, its worker, and fonts. The application registers that worker
   directly, and updates require an explicit reload. This avoids coupling offline support to Vite
   configuration or a virtual runtime module.
3. `sanitizeMermaidSource()` replaces network-bearing image values before every Mermaid render and
   at the share-load boundary. Rendered SVG is also stripped of active elements, event handlers, and
   network-bearing attributes.
4. Mermaid configuration always uses `securityLevel: "strict"`.
5. The document CSP uses `img-src data: blob:` without `'self'`, plus `script-src 'self'`,
   `object-src 'none'`, and the other least-privilege directives in `index.html`. `public/_headers`
   provides the equivalent policy on hosts that support static response headers. GitHub Pages uses
   the meta policy because it cannot emit custom headers.
6. Shared configuration is schema- and size-validated and requires user consent before persistence.
   Shared source opens ephemerally and does not overwrite the locally saved document.

## Consequences

- After one online load, every bundled editor feature is available offline.
- Shared source cannot initiate image requests to any origin; same-origin resources are intentionally
  excluded from `img-src`.
- Monaco and its generated workers increase the complete precache to roughly 17 MB, while the main
  editor chunk remains lazy at runtime.
- `frame-ancestors` is effective when served from `public/_headers`; browsers ignore that directive
  in a meta CSP.
- Inline raster `data:image` values remain supported. Source-provided SVG data images are replaced
  with a known inert placeholder.
