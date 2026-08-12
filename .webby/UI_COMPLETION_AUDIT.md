# NDTHICH — UI COMPLETION AUDIT BEFORE GĐ4

Audit time: 2026-08-12 19:00 +07:00

Authoritative rule from webbyLucifer v2.2: ChatGPT owns all visible UI. Claude may start only after every applicable `UI_SETUP_COMPLETE` gate passes.

## Verified evidence

- Client rental Google Sheet has been inspected and normalized in `.webby/data-source-map.json`.
- Project scope is a WEBSITE with 9 public routes in `.webby/PROJECT_INTAKE.json`.
- Current `.webby/visual-handoff/` contains only `routes.json`; no final approved full-page PNG renders are present.
- Current repository root contains only `.webby/` and `README.md`; there is no completed `assets/source/` + `assets/production/` tree.
- Google Drive folder `NDTHICH - GĐ1 CLIENT REVIEW` currently contains only one review presentation; it is not the mandatory final GĐ1 folder/package (`bản WEB`, `bản MOBILE`, `bản ADMIN`, `Document fonts`).
- Earlier contradictory readiness artifacts were invalidated on 2026-08-12: stale `IMPLEMENTATION_READY.md` removed, validation changed to READINESS_FAIL, Claude task explicitly blocked, Asset QA changed to NOT PASS.

## HARD BLOCKERS — GĐ4 MUST NOT START

### 1. Existing 5 public routes are not final high-fidelity UI
The current SVG masters are structural references. They are not final polished full-page visual truth.

### 2. Four required public routes are still missing final UI
Required final public route set:
- `/`
- `/cho-thue`
- `/cho-thue/[slug]`
- `/du-an`
- `/du-an/[slug]`
- `/gioi-thieu`
- `/tin-tuc`
- `/tin-tuc/[slug]`
- `/lien-he`

All applicable routes need intentional WEB + MOBILE compositions.

### 3. Final approved full-page renders are missing
For final GĐ1/GĐ3 visual truth, applicable route renders must be continuous Header→Footer exports, sharp/readable, with minimum WEB width 1920px and MOBILE width 1080px. Current GitHub visual-handoff has no final PNG renders.

### 4. Mandatory final GĐ1 Drive package is missing
Because Drive is connected/writable, final GĐ1 packaging must be created and verified with the required client-facing structure:
- `bản WEB/`
- `bản MOBILE/`
- `bản ADMIN/` when required
- `Document fonts/`

The current Drive folder is review-only and does not satisfy this gate.

### 5. Admin/CMS visible UI is incomplete
Admin is required. Minimum visual scope:
- Login
- Dashboard
- Rental/property list
- Rental/property create/edit
- Project list
- Project create/edit
- News list
- News create/edit
- Media/gallery uploader
- Required shared AdminSidebar/AdminHeader/Table/Form/Modal/Drawer states
- Lead/viewing-request management only if the chosen product flow stores those requests in admin

Rental admin fields must follow `.webby/data-source-map.json`, including internal-only commission/guide/notes behavior.

### 6. Complete component visual states are missing
State names exist, but final visible appearances are not locked for applicable default/hover/active/selected/focus/pressed/disabled/loading/empty/error/success/modal/drawer/upload/lightbox states.

### 7. Typography/font package is incomplete
`Be Vietnam Pro` is selected, but implementation-complete typography still requires exact mapping for every visible role across public + admin UI: family/style/weight, desktop/mobile size, line-height, letter-spacing, color, alignment, important line breaks, fixed vs CMS/data-driven. Exact legal acquisition/source manifest must be deterministic; Claude may not choose a substitute.

### 8. Production visual asset pack is incomplete
Need final authority/mapping for:
- canonical logo/wordmark source or documented reconstruction authority
- icon set
- decorative SVG/ornaments if used
- hero/fixed imagery
- property/project/news media treatment
- placeholder/loading/error media
- crop/focal/object-fit rules
- source vs production asset separation
- route/section placements
- SVG canonicalization/fidelity rules for applicable vectors

Dynamic CMS photos can change later, but their presentation rules must be fixed before GĐ4.

### 9. Complete visible copy/content map is incomplete
Every final navigation label, heading, CTA, form label/help/error, state copy and representative fixed/data-driven page content must appear in approved visual truth and/or exact content contract.

### 10. Required non-visible behavior contract is incomplete
Before GĐ4 the final package must lock implementation-critical facts not reliably visible in static renders, including applicable:
- breakpoint transitions/responsive composition between supplied viewports
- hover/focus/active behavior
- modal/drawer/lightbox behavior
- motion/transition and reduced-motion intent when used
- keyboard/focus/accessibility behavior
- conditional visibility
- route/navigation targets
- loading/empty/error/data-binding behavior

### 11. Complete final UI approval is pending
The client approved the visual direction/concept, not the complete 9-route WEB/MOBILE + required Admin final package. Final complete visual truth must be reviewed/approved after the new high-fidelity package exists.

### 12. GĐ2 must be rebuilt as the complete high-fidelity Master
After final visual completion/approval, rebuild SVG Master/design system for every approved route/component/state so Claude has no visible design choice left. Master must preserve typography, colors/tokens, spacing/grid, radii/borders, shadows/gradients, image crop, component anatomy, z-index/layers, masks/clips, decorative systems and responsive intent.

### 13. GĐ3 revision 2 must be rebuilt and verified
Current revision 1 is obsolete/incomplete. Final GĐ3 must publish and verify:
- complete visual-handoff renders + mappings
- final route/section/component/asset/placement maps
- typography/tokens/responsive/interactions contracts
- production asset manifest and files
- final executable `CLAUDE_TASK.md`
- deterministic new `uiRevision` / `uiCommit`
- `WEBBY_LOCK.json`
- no blocking request
- canonical validator pass against actual Git files
- GitHub upload/commit verification
- no stale/contradictory readiness artifact

Only then may `HANDOFF.status = UI_SETUP_COMPLETE`.

## Resolved / not blockers by themselves

- Rental Sheet schema: RESOLVED and known.
- Live Sheet sync vs import-to-CMS vs direct CMS: GĐ6 backend decision.
- Historical Sheet cleanup/migration: backend/data work.
- Final production content for every project/news item: can be CMS-populated later if representative approved UI and content treatment are fixed.
- Dynamic rental/project/news photos: may change via CMS after visual ratios/crop/placeholders/states are locked.

## Entry rule

`UI_SETUP_COMPLETE = true` is forbidden until all 13 applicable HARD BLOCKERS above are resolved and the new revision validates against the real repository contents.
