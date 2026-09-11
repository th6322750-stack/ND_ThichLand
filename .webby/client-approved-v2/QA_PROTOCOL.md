# NDTHICH — VISUAL QA PROTOCOL V2

## Purpose
Prevent the previous failure mode where implementation was certified against a later master that had drifted away from the client-approved direction.

The only visual baseline for the five core public routes is this package.

## Canonical captures

### WEB
- reference PNG physical size: `935 × 1683`
- browser viewport: `935 × 1683`
- deviceScaleFactor: `1`
- capture mode: viewport screenshot
- required composition: WEB master, never mobile/tablet substitution at this width

### MOBILE
- reference PNG physical size: `724 × 2172`
- browser CSS viewport: `362 × 1086`
- deviceScaleFactor: `2`
- resulting screenshot: `724 × 2172`
- capture mode: viewport screenshot

Tablet (`768–899px`) is interpolation territory. It must preserve the visual language and may not redesign; it is reviewed separately after the two authoritative endpoints pass.

## Required routes
1. `/`
2. `/cho-thue`
3. `/cho-thue/[visual-fixture-slug]`
4. `/du-an`
5. `/du-an/[visual-fixture-slug]`

Each route must pass WEB and MOBILE = 10 authoritative comparisons.

## Deterministic visual mode
Visual QA must run with deterministic fixture data:
- stable property/project names;
- stable prices;
- stable frozen image assets;
- fixed dates/timestamps;
- animations and carets disabled;
- network-dependent content mocked;
- no random IDs or time-sensitive labels.

This mode is QA-only and must not change production fail-closed behavior or production data providers.

## Automated comparison
Use Playwright screenshot comparison. The project already has Playwright, so do not add another visual-regression framework unless this gate cannot be implemented with Playwright.

Initial automated detector:
- per-pixel `threshold <= 0.12`;
- `maxDiffPixelRatio <= 0.005`;
- no region containing layout, asset, CTA, header or footer drift may be waived by ratio alone.

The numeric threshold is a detector, not final acceptance.

## Geometry gate
For major components, browser geometry must be checked against the master:
- header height and horizontal alignment;
- hero bounds and text/image split;
- section vertical order;
- card count and columns;
- image aspect ratio/crop;
- container left/right margins;
- button size/radius;
- footer bounds;
- mobile bottom navigation when present.

Target: no deliberate difference greater than `2 CSS px` at canonical viewports unless ChatGPT explicitly records an exception.

## Mandatory overlay review
For every one of the 10 captures create:
1. browser screenshot;
2. master reference;
3. 50/50 overlay or blink comparison;
4. diff evidence.

This prevents a low aggregate pixel ratio from hiding a visibly wrong shared component.

## ChatGPT gate
Automated PASS is insufficient.

After Claude implementation:
1. capture browser screenshots;
2. compare directly with PHA1 master;
3. ChatGPT reviews hierarchy, crop, typography, spacing and overall real-estate mood;
4. any visible unapproved difference = REOPEN;
5. Claude fixes;
6. repeat until ChatGPT returns `PHA3_VISUAL_PASS_V2`.

## Forbidden baselines
Do not accept against:
- old Revision 3 renders;
- GĐ4/GĐ5 screenshots;
- current implementation itself;
- previous browser screenshots.

They may be regression evidence only. They are not acceptance authority.

## Functional protection
Visual recovery must not regress:
- existing GĐ6 backend/CMS architecture;
- auth and security controls;
- production fail-closed provider behavior;
- mock/fail-closed E2E harnesses.

## Acceptance ownership
Only ChatGPT may emit:
`PHA3_VISUAL_PASS_V2`

Claude must stop at:
`PHA2_IMPLEMENTATION_READY_FOR_CHATGPT_QA`
