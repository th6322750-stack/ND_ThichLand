# CLAUDE PHA 2 — IMPLEMENTATION ONLY

**AUTHORIZED: START PHA 2**

Authorization source: explicit user instruction `START PHA 2` on 2026-08-14.

## Read order — mandatory
1. `VISUAL_AUTHORITY.md`
2. `MASTER_INDEX.json`
3. `IMPLEMENTATION_CONTRACT.json`
4. `ASSET_MANIFEST.json`
5. `QA_PROTOCOL.md`
6. all 10 full-resolution approved master PNGs
7. `NDTHICH_ASSETS_FROZEN_V2.zip` and extracted assets

## Binary preflight — mandatory before UI code
Confirm the exact approved binaries are locally readable and verify SHA256 against `MASTER_INDEX.json` and `ASSET_MANIFEST.json`.

Approved binary sources are the immutable Google Drive IDs/URLs recorded in those indexes. If Drive is inaccessible, use the approved local/full-freeze package supplied by ChatGPT. Never substitute another binary.

If any master/asset cannot be obtained or a SHA256 differs:
- do not substitute old repo placeholders;
- do not search the web for replacements;
- do not generate new imagery;
- do not continue the affected visual route;
- report `VISUAL_BLOCKED_NEEDS_CHATGPT` with the exact missing asset/master.

## Role boundary
Your role is implementation only. **You have zero design authority.**

You may code:
- React / Next.js / Tailwind / CSS / HTML;
- responsive behavior matching the approved desktop/mobile masters;
- existing approved UX interactions;
- existing backend/CMS integration;
- deterministic visual-fixture mode;
- screenshot and visual-diff harness.

You may not:
- redesign;
- render/generate/search/select replacement imagery;
- substitute placeholders;
- change colors, spacing, hierarchy, crop strategy, card structure, section order or mobile composition by preference;
- use old Revision 3 as visual authority when it conflicts with V2;
- invent missing UI;
- self-accept visual fidelity.

## Scope
Implement the approved V2 visual layer for these 5 routes at both WEB and MOBILE endpoints:
1. `/`
2. `/cho-thue`
3. `/cho-thue/[slug]`
4. `/du-an`
5. `/du-an/[slug]`

Preserve existing backend/CMS/auth/security/fail-closed behavior from GĐ6. Do not rewrite backend architecture for visual convenience.

## Implementation requirements
- Use real DOM for all text, buttons, forms, filters, cards and navigation. Do not ship the master screenshot as a full-page background.
- Use frozen visual assets for deterministic QA fixtures.
- Dynamic production media may replace image payloads only where allowed by `ASSET_MANIFEST.json`; slot geometry, crop, overlay, radius and text hierarchy remain frozen.
- Build desktop and mobile compositions independently where the masters differ; do not merely shrink desktop.
- Maintain accessibility and existing interaction semantics unless they conflict with approved visuals; when conflict is ambiguous, stop with `VISUAL_BLOCKED_NEEDS_CHATGPT`.

## Required validation before handoff
Run and report:
- `npm run build`
- `npm run lint`
- `npx tsc --noEmit`
- `npx vitest run`
- `npm run test:e2e:mock`
- `npm run test:e2e:failclosed`

Then capture all 10 exact visual endpoints at the approved viewports and store evidence for ChatGPT PHA 3 review.

## Git discipline
- Work only on branch `claude/pha2-client-visual-v2`.
- Base is exact PHA 1.5 freeze commit `ea4b72a059ae1695cd236f809d0cb2544563c6e5`.
- Do not merge PRs.
- Do not alter the approved master/index hashes.
- Do not modify PR #6 backend history.

## Terminal states
Successful implementation handoff only:
`PHA2_IMPLEMENTATION_READY_FOR_CHATGPT_QA`

Visual/material blocker:
`VISUAL_BLOCKED_NEEDS_CHATGPT`

Never self-declare `PHA3_VISUAL_PASS_V2`, `GĐ6_DONE`, or production-ready status.
