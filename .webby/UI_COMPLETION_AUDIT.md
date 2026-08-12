# NDTHICH — UI COMPLETION AUDIT BEFORE GĐ4

Audit time: 2026-08-12 18:45 +07:00

Authoritative rule: ChatGPT owns all visible UI. Claude may implement only after `UI_SETUP_COMPLETE = true`.

## Newly resolved

- Rental Google Sheet source is now **KNOWN and inspected**.
- Sheet ID: `1a9zZjpj2KoM856z5hKtG_euci5cU2cLxirPi5B5qqVU`.
- Admin rental-field schema can now be designed from `.webby/data-source-map.json`.
- The source is not clean enough for direct raw sync: it contains group rows, mixed price/area formats, mixed availability/date text, cell hyperlinks, and some rows with column shifts when commission is omitted.

## HARD BLOCKERS — GĐ4 MUST NOT START

### 1. High-fidelity final public UI is incomplete
Current SVG masters are structural. They are not yet the polished, final, full-page visual truth for all required routes.

Required public routes:
- `/`
- `/cho-thue`
- `/cho-thue/[slug]`
- `/du-an`
- `/du-an/[slug]`
- `/gioi-thieu`
- `/tin-tuc`
- `/tin-tuc/[slug]`
- `/lien-he`

All applicable routes need final WEB and MOBILE compositions.

### 2. Approved full-page route renders are missing from GitHub
`.webby/visual-handoff/` currently contains only `routes.json`. It does not contain the final approved full-page PNG renders required for visual-first handoff.

### 3. Admin/CMS visual UI is incomplete
Admin is required by project intake. ChatGPT still must design the visible admin UI before Claude can implement it.

Minimum admin visual scope to resolve from the known rental schema and existing project/news scope:
- Admin login
- Dashboard
- Rental/property list
- Rental/property create/edit form
- Project list
- Project create/edit form
- News list
- News create/edit form
- Media/gallery uploader states
- Shared admin navigation/header/table/form/modal/drawer/empty/error/loading states
- Lead/viewing-request management only if the chosen frontend flow stores those requests in the admin system

### 4. Complete component visual states are missing
Current component map names states, but the actual approved visible appearance is not fully supplied for applicable states such as hover/focus/pressed/disabled/loading/empty/error/selected/mobile drawer/modal/upload.

### 5. Typography system is not implementation-complete
Family is locked to `Be Vietnam Pro`, but final per-role typography still needs exact visible mapping across public + admin UI: weight, size, line-height, letter-spacing, color, alignment, responsive size and fixed/data-driven role. Exact acquisition/package source must be locked so Claude does not choose alternatives.

### 6. Production visual asset pack is incomplete
Before GĐ4, ChatGPT must finish the authoritative visual treatment/mapping for:
- logo/wordmark source or documented reconstruction authority
- icon set
- decorative SVG/ornaments if used
- hero/fixed imagery used by final UI
- property/project/news media placeholders and failure/loading states
- crop/focal-point rules
- route/section asset placement

Dynamic client photos may be CMS data later, but their visible treatment must already be defined.

### 7. Final copy/content visual placement is incomplete
All final visible navigation labels, headings, CTA labels, forms, empty/error copy and representative page content must be present in the approved visual truth. Current content map is only partial.

### 8. Final complete UI approval is pending
The client approved the design direction, not the complete final set of public WEB/MOBILE + Admin screens. A complete revision must be reviewed/approved before it becomes approved visual truth.

### 9. GĐ2 must be rebuilt as a complete high-fidelity Master
After final UI completion/approval, SVG Master/design system must be updated to cover every approved route/component/state so Claude has no visible design choice left.

### 10. GĐ3 revision/lock must be rebuilt
Current UI revision 1 is obsolete/incomplete. The completed UI must create a new deterministic revision/commit, then update HANDOFF, WEBBY_LOCK, visual-handoff mappings, manifests and validation.

## SOFT / BACKEND-DEFERRED — these do NOT by themselves block static GĐ4 after UI is complete

- Final choice between live Google Sheet sync vs import-to-CMS vs direct CMS belongs to GĐ6.
- Cleaning historical rental rows belongs to data migration/backend work; the admin UI can be designed now using the normalized schema.
- Project/news production content can be populated later if the approved static UI has representative content and all visual treatment is already locked.
- Real dynamic property/project photos can change later through CMS; their layout, ratio, crop, placeholder and states must be fixed before GĐ4.

## GĐ4 ENTRY GATE

Do not set `UI_SETUP_COMPLETE = true` until every applicable HARD BLOCKER above is resolved and the new handoff validates against the actual files in GitHub.
