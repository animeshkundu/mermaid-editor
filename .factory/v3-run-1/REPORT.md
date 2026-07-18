# Factory feature report

**Outcome:** Raise the Mermaid editor's code-editing + render loop to viewer-grade reliability and polish, benchmarked against mermaid.live, without regressing performance or the offline posture. Deliver: (1) an isolated, mutually-serialized, leak-free Mermaid render pipeline in src/lib/mermaid.ts whose config-establish + render + cleanup is one atomic critical section against the Mermaid singleton and always restores shared configuration; (2) commit epochs in DiagramPreview so only the newest logical reque…
**Disposition:** feature

## Acceptance checklist

- [ ] **AC-001 (happy):** Every render behaves as if executed alone with its requested code and effective configuration; overlapping requests cannot contaminate one another.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-002 (edge):** After every successful, rejected, exceptional, cancelled, or unmounted render attempt, Mermaid's shared configuration is restored to the defined baseline or previous stable state.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-003 (edge):** A superseded request cannot update the SVG, diagnostics, Monaco markers, displayed last-good state, export source, or any user-visible cache.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-004 (edge):** After any edit burst, including A to B to A, the UI converges to the newest logical request rather than an earlier request with an identical input tuple.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-005 (edge):** A cached result may be reused only when proven to represent the exact current code and effective configuration.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-006 (edge):** When current input is invalid, the preview retains and visibly dims only the most recently committed good code, effective configuration, and SVG instead of clearing the preview.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-007 (edge):** Diagnostics shown for invalid input belong to the current request; stale failures cannot replace them.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-008 (edge):** When no last-good render exists, invalid input produces a complete blocking error state.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-009 (edge):** Retained last-good output is scoped to the current diagram type; changing or deleting the root diagram directive clears incompatible retained output.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-010 (edge):** Empty source clears the preview, errors, markers, and retained last-good state; a subsequent invalid edit therefore shows the full error state.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-011 (edge):** When retained output is exportable during an invalid current request, visual export uses exactly the displayed last-good SVG and clearly warns that it represents prior code or configuration.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-012 (happy):** SVG export bytes, and the SVG used to produce PNG or copied images, are identical to the retained SVG currently displayed after required export preparation.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-013 (edge):** Export cannot race into using a later or different cached result without an explicit user-visible state change.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-014 (edge):** Unmount invalidates pending, debounced, and in-flight UI work; no state, diagnostic, marker, DOM, or export completion is committed afterward.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-015 (edge):** An internally uninterruptible Mermaid operation may finish after unmount but must restore shared configuration and remain unable to commit.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-016 (happy):** The last-good cache identity is code, effective configuration, and SVG; no render ID is required in the cached content identity.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-017 (edge):** Each current failure produces at most one best-effort Monaco marker when a trustworthy location is derivable; otherwise complete diagnostics appear without a marker.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-018 (edge):** The marker carries the complete readable error text and is cleared or replaced whenever the current request changes or succeeds.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-019 (edge):** Complete error details appear in a dedicated, persistent feedback region that does not obscure a retained preview.
  - E2E scenario(s): none recorded
  - Verdict: **FAIL**
- [ ] **AC-020 (edge):** Syntax errors are announced through an aria-live polite region.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-021 (edge):** A retained stale preview exposes an accessible description explaining that rendering is paused and the previous valid state is shown.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-022 (happy):** Monaco diagnostics remain keyboard-navigable using its standard F8 and Shift+F8 behavior.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-023 (edge):** If diagramming dependencies fail during initial loading, the preview shows a clear failure message and retry action while the code editor remains functional.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-024 (happy):** Typing remains responsive and is never blocked by rendering; rendering stays debounced and lazily loaded without degrading initial-load behavior.
  - E2E scenario(s): none recorded
  - Verdict: **FAIL**
- [ ] **AC-025 (edge):** After any render burst, temporary Mermaid DOM returns to its pre-render baseline and no render-related nodes or memory-bearing artifacts leak.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-026 (edge):** Theme, layout, security, and other configuration changes cannot permanently corrupt subsequent renders or editor state.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-027 (happy):** Editor markers and preview state always derive from the same debounced parse/render attempt and cannot diverge.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-028 (happy):** Context-aware completions remain available independently of render success and provide keywords and drop-in templates for all 20 supported DiagramType categories.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-029 (happy):** Every starter snippet for the 20 supported categories renders successfully with Mermaid 11.12.2.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**
- [ ] **AC-030 (edge):** Users receive an approximate error location when reliably derivable and a complete plain-text explanation even when parser location data is inaccurate or absent.
  - E2E scenario(s): none recorded
  - Verdict: **NOT VERIFIED**

## How it was built

- **Research:** CHARTER: 'have a world class mermaid-editor like its viewer counterparts, while being performant and reliable' (disposition: feature) = raise the CODE-EDITING + render-pipeline loop to the polish of the app's already-mature VIEWER (pan/zoom, theming, sequence auto-coloring, multi-format export), benchmarked against mermaid.live, without regressing performance/reliability. USER OUTCOME: while typing Mermaid, the last valid diagram stays visible (dimmed) during a typo, the exact error line is fla…
  - Resolved: Q5 (Monaco offline) RESOLVED: Monaco loads from https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs at runtime (loader default, no loader.config in src/, monaco-editor not a direct dep, no monaco chunk in dist/assets). ARCHITECTURE_GUIDELINES §1.1 explicitly permits external library CDNs and defines offline as 'after initial load'. DECISION: ACCEPT existing CDN dependency; do NOT bundle Monaco locally. Completion/markers are available once Monaco loads — same prerequisite the editor alread…
  - Resolved: Q4 (config sandboxing) RESOLVED empirically: mermaid initialize→setSiteConfig RESETS to defaultConfig before merging every call (chunk-ABZYJK2D.mjs:2511-2513), so config does NOT accumulate (proved: primaryColor '#abcdef'→'#fff4dd' base default after a config omitting it); unknown/invalid theme does NOT throw (graceful fallback); recovery after a bad config succeeds. No custom sandbox needed; on config-only failure, don't advance the committed config and re-init with last-good.
  - Resolved: Q2 (marker precision) RESOLVED: jison gives hash.loc (precise line+col) + 'on line N' message; langium gives char offset (convertible); block gives 'Lexical error on line N' + hash.line; CRLF handled correctly. BUT YAML frontmatter/%%{init}%% directives shift reported lines (measured: 4-line frontmatter → editor line 6 reported as line 2; 1-line directive → off by 1) because mermaid reports lines on the PREPROCESSED source. So exact universal accuracy is infeasible with naive mapping → best-eff…
  - Resolved: Q3 (fallback location) RESOLVED (recommendation): when no location is extractable, mark line 1 (whole-line) AND always show the full message in the error affordance + marker hover — keeps the in-editor error signal present. Omitting the marker is also acceptable but loses that signal; line-1-with-message is recommended.
  - Open: PRODUCT-POLISH ONLY (non-blocking, pick at implementation): exact dimming opacity for the retained last-good diagram (recommend ~40-50%) and the exact form of the non-destructive affordance (small corner badge vs slim bottom bar vs Monaco-squiggly-only). Recommendation: slim low-emphasis affordance + Monaco squiggly, matching mermaid.live; reserve the full centered card ONLY for cold-start (no last-good SVG / empty input).
  - Open: PRODUCT CALL (non-blocking): ship autocomplete always-on (default, Ctrl+Space is the norm) vs behind a persisted editor-settings toggle. Recommend always-on; no persisted toggle (keeps scope tight).
  - Open: SCOPE CONFIRMATION (recommend DEFER): cursor-anchored zoom / true fit-to-content / auto-fit-on-new-diagram are real but out-of-scope for this editor-focused charter; they touch export/screenshot stability and the e2e-visible 100% default. Spec author should confirm deferral.
  - Open: OPTIONAL ENHANCEMENT (non-blocking): whether to add frontmatter/%%{init}%% directive line-offset correction so jison markers are exact when a config block is present, or accept the known imprecision + always-visible full message for v1. Recommend accept for v1.
  - Peer note: Sequence for lowest risk/highest leverage: (a) reliability fixes (offscreen-container render + finally cleanup, single init gated on config change, remove console.log:83, monotonic render epoch + unmount guard) — pure wins, no UX change; (b) retain last-good SVG (dimmed) + non-destructive affordance; (c) Monaco markers from the render error via onError→App→CodeEditor.errorMarker prop; (d) context-aware completion + per-type snippets from DIAGRAM_EXAMPLES/mermaidLanguageDefinition; (e) DEFER vie…
  - Peer note: Do NOT re-tighten the offline constraint. The prior spec draft's 'strict offline / bundle Monaco locally' contradicts both the documented posture (external CDNs allowed) and the perf budget. Monaco-from-CDN is the intended, acceptable state; markers/completion inherit the editor's existing load prerequisite.
  - Peer note: Config rollback is native — no sandbox infra. Because setSiteConfig resets-then-merges, a bad config is undone by re-initializing with the last-good config; on config-only failure keep the previous SVG+config tuple and re-init last-good so the retained diagram stays reproducible (AC-03).
  - Peer note: Centralize error-location parsing in ONE helper (extractErrorLocation in mermaid.ts) with the verified fallback chain; unit-test it against the exact strings captured this round (jison 'Parse error on line N' + hash.loc; 'Lexical error on line N' + hash.line; langium 'at offset: N'; frontmatter/CRLF cases).
- **Plan:** Two complementary, explicitly-required ordering safeguards operate together, addressing both correctness and the peer-raised concurrency concern that 'ignore stale results' alone does not prevent concurrent Mermaid singleton work. SERIALIZATION (constraint: 'mutually serialize all Mermaid singleton configuration-plus-render work'): a module-level promise-chain mutex in src/lib/mermaid.ts wraps every config-establish + render + cleanup in a single critical section, so no two renders interleave a…
- **Planned paths:** src/types/index.ts, src/lib/mermaid.ts, src/lib/mermaid.test.ts, src/lib/completions.ts, src/lib/completions.test.ts, src/components/DiagramPreview.tsx, src/components/DiagramPreview.test.tsx, src/App.tsx, src/components/CodeEditor.tsx, tests/e2e/render-resilience.spec.ts, tests/e2e/completions.spec.ts, docs/ADR/002-render-pipeline-error-resilience.md, docs/ARCHITECTURE_GUIDELINES.md, docs/AGENT.md, docs/history/README.md.
- **Plan review:** revise (infra-failure)
- **Implementation:** Feature implementation is complete with no blocking production defects. Protected baseline tests remain byte-for-byte unchanged. Additive coverage now proves retained SVG/PNG exports, current invalid-source copy/share/Markdown actions, accessibility semantics, F8/Shift+F8 navigation, starter application/rendering, 300 ms render coalescing, and non-zero real marker ranges. Final gates passed: lint, production build, 184 unit tests (2 skipped), and all 32 Playwright tests, including all diagram c…
- **Decision record:** Proceed as implemented. Keep the slim error region, 45% retained last-good diagram, editor marker, and non-blocking layout. Coverage gaps for debounce behavior and zero-width end-of-line markers were fixed additively. Retain tests/e2e/package.json as a minimal ESM package-scope compatibility shim because removing it breaks protected baseline specs that import Page as a runtime value; it does not change Playwright or Vitest settings. Remaining low-risk notes are that only one starter is applied …
- **Final taste/correctness panel:** revise (infra-failure)

## Verified

- **Functional gate:** passed.
- **Functional e2e:** NOT green; see warning below.

## Applied taste

- Peer call budget exhausted.

## For your review — matter of taste

- **AC-019:** Complete error details appear in a dedicated, persistent feedback region that does not obscure a retained preview.
- **AC-024:** Typing remains responsive and is never blocked by rendering; rendering stays debounced and lazily loaded without degrading initial-load behavior.

## ⚠️ Not yet green

- **E2E:** e2e-author returned invalid or incomplete criterion coverage.

## Detailed verification evidence

| Gate | Verdict | Detail |
| --- | --- | --- |
| install | PASS | added 494 packages, and audited 495 packages in 24s 74 packages are looking for funding run `npm fund` for details 27 vulnerabilities (1 low, 15 moderate, 10 high, 1 critical) To address issues that do not require attention, run: npm audit… |
| typecheck | PASS (not applicable) | static gate step |
| build | PASS | > mermaid-editor@1.0.0 build > tsc -b --noCheck && vite build vite v7.2.7 building client environment for production... transforming... ✓ 8024 modules transformed. rendering chunks... computing gzip size... dist/index.html 0.77 kB │ gzip: … |
| existing-tests | PASS | > mermaid-editor@1.0.0 test > vitest run RUN v2.1.9 /home/ani/factory-fr/.fr/workspace ✓ src/lib/history.test.ts (16 tests) 29ms ✓ src/lib/constants.test.ts (22 tests) 32ms ✓ src/lib/utils.test.ts (12 tests) 47ms ✓ src/lib/share.test.ts (1… |
| acceptance-tests | PASS | > mermaid-editor@1.0.0 test > vitest run src/App.test.tsx src/components/CodeEditor.test.tsx src/components/DiagramPreview.resilience.test.tsx src/lib/completions.test.ts src/lib/mermaid-resilience.test.ts tests/e2e/completions.spec.ts tes… |
| lint | PASS | > mermaid-editor@1.0.0 lint > eslint . /home/ani/factory-fr/.fr/workspace/src/App.tsx 81:6 warning React Hook useEffect has missing dependencies: 'setCode' and 'setConfig'. Either include them or remove the dependency array react-hooks/exh… |
| secret-scan | PASS (not applicable) | static gate step |
| static-manifest | PASS (not applicable) | static gate step |
| diff-guard | PASS |  |
| supply-chain | PASS (not applicable) | static gate step |
| Regression comparison | PASS | No regression detected by the declared gate set. |

- **E2E happy paths:** NOT verified.
- **E2E edge paths:** NOT verified.
- **E2E driver:** none; not deterministic.
- **NOT verified:** AC-001
- **NOT verified:** AC-002
- **NOT verified:** AC-003
- **NOT verified:** AC-004
- **NOT verified:** AC-005
- **NOT verified:** AC-006
- **NOT verified:** AC-007
- **NOT verified:** AC-008
- **NOT verified:** AC-009
- **NOT verified:** AC-010
- **NOT verified:** AC-011
- **NOT verified:** AC-012
- **NOT verified:** AC-013
- **NOT verified:** AC-014
- **NOT verified:** AC-015
- **NOT verified:** AC-016
- **NOT verified:** AC-017
- **NOT verified:** AC-018
- **NOT verified:** AC-020
- **NOT verified:** AC-021
- **NOT verified:** AC-022
- **NOT verified:** AC-023
- **NOT verified:** AC-025
- **NOT verified:** AC-026
- **NOT verified:** AC-027
- **NOT verified:** AC-028
- **NOT verified:** AC-029
- **NOT verified:** AC-030
- **Taste:** revise (infra-failure)
- Correctness and product value outside the declared acceptance criteria and gate set remain human-review responsibilities.
