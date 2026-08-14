# CLAUDE GĐ6 — NDTHICH Backend / CMS / Logic

## Entry state

GĐ4 = DONE / STATIC_UI_PASS
GĐ5 = DONE / UX_PASS

Visual truth remains UI Revision 3.

Do not redesign any public/admin screen.
Do not start GĐ7.
Do not add Đặt lịch xem nhà / Lead UI.

Read first:

1. `.webby/GD6_BACKEND_CONTRACT.json`
2. `.webby/HANDOFF.json`
3. `.webby/WEBBY_LOCK.json`
4. `.webby/data-source-map.json`
5. `.webby/content-map.json`
6. `.webby/interactions.json`
7. `.webby/implementation/GD5_IMPLEMENTATION_RECEIPT.json`
8. current GĐ5 code/tests

The backend contract is authoritative for GĐ6 data/security decisions.

---

# BRANCH

Create:

`claude/gd6-backend-cms`

from the exact HEAD of:

`webby/gd6-backend-contract`

Do not branch from the immutable UI branch.
Do not rewrite GĐ4/GĐ5 history.

---

# TASK 01 — BASELINE / ARCHITECTURE LOCK

Before backend changes:

- run build/lint/typecheck/vitest/e2e;
- capture current visual regression baseline;
- document actual GĐ6 starting SHA;
- preserve GĐ5 URL/filter/tab/gallery/form UX behavior;
- add no live network call at build time.

Create server-only boundaries so Google credentials and internal-only data can never enter client bundles.

Prefer explicit repository/adaptor interfaces instead of importing Google APIs throughout page components.

Expected layers:

- server config/env validation;
- auth/session DAL;
- Google auth/client adapter;
- rental raw-source parser;
- rental overlay repository;
- project repository;
- news repository;
- media repository;
- contact submission repository;
- public DTO mappers that physically strip internal fields.

---

# TASK 02 — GOOGLE RUNTIME ADAPTER

Implement server-only Google Sheets + Drive access using supported Google APIs/client libraries.

Required environment variables are defined in `GD6_BACKEND_CONTRACT.json`.

Rules:

- never use `NEXT_PUBLIC_*` for credentials;
- normalize multiline private key values safely;
- fail with a clear server configuration error when a live operation is attempted without required secrets;
- build/test must still run without live secrets;
- provide mock/in-memory repositories for unit/integration tests;
- do not make live Google calls in unit tests;
- do not automatically create or mutate live sheets during `next build`, `next start` or tests.

Provide an idempotent explicit bootstrap command, e.g. `npm run gd6:bootstrap-cms`, which creates missing `WEB_*` tabs/headers in `GOOGLE_CMS_SPREADSHEET_ID`.

The bootstrap script must:

- be safe to re-run;
- never delete/rename the raw `Phòng trống chính ` sheet;
- never rewrite existing raw rental rows;
- print exactly which tabs were created/already existed;
- refuse to run if the CMS spreadsheet ID is not explicitly configured.

---

# TASK 03 — RAW RENTAL SHEET NORMALIZER

Source:

Spreadsheet ID currently known:
`1a9zZjpj2KoM856z5hKtG_euci5cU2cLxirPi5B5qqVU`

Sheet:
`Phòng trống chính `

Treat source as READ-ONLY.

Implement a parser over the raw sheet that follows `.webby/GD6_BACKEND_CONTRACT.json`.

Important real-source facts discovered during audit:

- the sheet has 1102 rows / 29 columns;
- canonical headers are on row 2;
- real records are primarily A:P;
- group title/separator rows are mixed into data;
- some records have omitted cells and shifted columns;
- media is commonly a Drive folder hyperlink, sometimes Google Photos;
- prices/areas/statuses/type strings are Vietnamese free text and inconsistent in casing/spelling;
- commission/guide/notes are internal-only.

Do not use `row.length >= N` as the sole validity rule.

Use semantic validators and return a parse result that distinguishes:

- valid normalized record;
- ignored separator/note row;
- quarantined ambiguous record with diagnostic reason.

Every raw record must retain:

- `sourceId = sheet:<rowNumber>`;
- `sourceRow`;
- source hash or equivalent deterministic fingerprint;
- raw fields needed for internal diagnostics.

Do not expose raw/internal diagnostics publicly.

## Availability

Preserve `availabilityRaw` and map only explicit understandable source text.

Examples of accepted normalized intent:

- Vào luôn / còn trống -> `Còn trống`
- cuối tháng / date-like future availability -> `Sắp trống`
- đã hết / đã chốt / đã thuê -> `Đã cho thuê`

Unknown/ambiguous status must not be fabricated. Quarantine or require admin override as appropriate.

## Price / area

Parse explicit Vietnamese values such as `5,5 triệu`, `6 TRIỆU`, `35m2` into normalized numbers.

Do not guess malformed values.

## Bedrooms

GĐ6 may now normalize bedroom count ONLY when source text explicitly states it.

Allowed examples:

- `1 ngủ`
- `2 ngủ 1 khách`
- `1 khách 1 ngủ`
- `studio 1 bếp 1 ngủ`

Never infer `Studio = 1`.

No explicit bedroom phrase => `bedroomCount = null`.

## Furnishing

Populate furnishing status only from explicit furnishing language.
No explicit authoritative wording => null.

Do not convert a generic list of appliances into a categorical furnishing status unless an explicit furnishing statement supports it.

## Tests

Create a compact synthetic fixture set covering:

- normal canonical row;
- separator row;
- missing commission causing left shift;
- malformed price;
- malformed area;
- Vào luôn;
- future availability;
- Đã hết;
- explicit 1/2 bedroom text;
- Studio without bedroom count;
- internal fields never public.

Do not commit the entire client Sheet into test fixtures.

---

# TASK 04 — RENTAL OVERLAY CMS

Do NOT edit raw operational rows from Admin.

Use:

- `WEB_BDS_OVERRIDES`
- `WEB_BDS_CUSTOM`

as defined in the contract.

Merged rental read model:

1. normalize raw source;
2. apply override patch/hide state by `sourceId`;
3. append normalized custom records;
4. map public/admin DTOs separately.

Admin editing an imported raw record writes an override patch.
Admin deleting/hiding an imported raw record writes `hidden=true`.
Admin adding a new record writes to `WEB_BDS_CUSTOM`.

Preserve raw source untouched.

For raw records, use a stable route identity based on source row/sourceId. Human-readable prefix may be included, but resolving a record must remain stable even if address/title copy changes.

Make current BĐS Admin real:

- list real merged records;
- search existing approved search field;
- existing filter button may implement approved filter behavior without visual redesign;
- edit form loads real admin DTO;
- `Lưu nháp` and `Lưu & đăng` have real persistence semantics;
- validation errors are real;
- Export CSV exports admin-authorized normalized data and may include internal columns because export is protected Admin-only;
- never expose internal fields through public data loaders.

After mutation, revalidate/invalidate relevant public/admin reads so the user sees changes promptly.

---

# TASK 05 — PUBLIC RENTAL LIVE DATA

Replace direct client imports of `lib/data/properties*` as the production data source.

Preserve fixtures for dev/test where appropriate.

Public routes/components must receive only a public DTO.

Required live public consumers:

- homepage SearchPanel options;
- homepage rental cards where applicable;
- `/cho-thue` search/filter/pagination;
- `/cho-thue/[slug]` detail;
- related listings.

Keep GĐ5 client-side filter/URL semantics exactly the same after the data source changes.

No build-time dependency on Google credentials or current rental slugs. New source rows must be addressable without rebuilding the application.

Facts row:

- area -> real normalized area;
- bedroom -> explicit normalized bedroomCount else `—`;
- vertical access -> real normalized source;
- furnishing -> explicit normalized furnishingStatus else `—`.

Service fee remains real normalized source.

---

# TASK 06 — REAL ADMIN AUTH

Replace localStorage mock auth completely.

Single-admin scope only. Do not invent multi-role UI.

Use environment-backed admin identity:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `AUTH_SECRET`

Requirements:

- strong password hash/KDF and timing-safe verification;
- no plaintext credentials committed/logged;
- generic invalid-credentials response;
- signed HttpOnly session cookie;
- Secure in production;
- SameSite=Lax;
- remember-me affects session lifetime;
- real server-side logout;
- login redirect works on hard navigation and reload;
- authenticated `/admin/login` may redirect to `/admin`;
- unauthenticated admin pages redirect to login.

For Next.js 16:

- `proxy.ts` may perform optimistic cookie/session redirect;
- every protected data access/server action/route handler MUST verify the session again in the server DAL;
- do not trust proxy/client state as authorization.

All Admin write APIs/actions require authenticated session plus same-origin/CSRF-safe handling.

The existing `Quên mật khẩu?` visual has no authoritative recovery channel. Do not invent email reset. Keep the visual stable and avoid fake-success behavior; document the operational gap.

Add tests for:

- wrong credentials;
- correct credentials;
- session cookie flags;
- protected admin GET;
- protected mutation without auth;
- logout;
- remember-me lifetime;
- tampered/expired session rejection.

---

# TASK 07 — PROJECT CMS

Persist projects in `WEB_PROJECTS`.

Wire existing Admin project list/form to real CRUD without redesign.

Support fields in contract including investor, amenities, progress and media.

Public `/du-an` and `/du-an/[slug]` read only published CMS records.

IMPORTANT:

Current `lib/data/projects.ts` is design/demo data.
Do not silently seed or describe it as factual production content.

Allowed:

- fixtures for dev/test;
- explicit migration/seed script that creates DRAFT demo rows only when requested in non-production.

Default production behavior must not auto-publish fake projects.

Keep current visual placeholders/empty handling within approved design constraints when no real project content exists.

---

# TASK 08 — NEWS CMS

Persist news in `WEB_NEWS`.

Wire existing Admin news list/form to real CRUD.

Implement the approved form without replacing it with a generic external editor look.

At minimum persist:

- title;
- slug;
- category;
- draft/published state;
- publishedAt;
- excerpt;
- cover media;
- structured article sections;
- read minutes;
- timestamps.

Public `/tin-tuc` and `/tin-tuc/[slug]` read only published CMS records.

Preserve GĐ5 search/category/URL-state behavior with live data.

Current `lib/data/news.ts` remains demo fixture only unless the user later confirms the content is factual.

---

# TASK 09 — MEDIA / GOOGLE DRIVE

Make existing Admin Media Library and uploader functional.

Use `GOOGLE_MEDIA_FOLDER_ID`.

Requirements:

- authenticated Admin upload;
- validate MIME/type and reasonable file size before uploading;
- stable Drive file ID metadata stored in `WEB_MEDIA`;
- list media in existing Media Library UI;
- allow BĐS/project/news forms to select/use stored media within the existing composition;
- never expose service account credentials;
- public images from private Drive are delivered through a safe server-side path with caching/content type handling.

Legacy rental media:

- Drive file/folder hyperlinks: resolve if service account has permission;
- Google Photos album links: preserve source link but do not depend on HTML scraping; use approved placeholder when unresolved and produce an internal diagnostic.

Do not fail the whole listing because legacy media cannot be resolved.

---

# TASK 10 — CONTACT FORM BACKEND

Keep contact form UI unchanged.

Submit server-side into `WEB_CONTACTS`.

Fields and abuse-protection contract are in `GD6_BACKEND_CONTRACT.json`.

Required behavior:

- client validation remains;
- server validation is authoritative;
- generic success/error response integrated into existing approved states;
- repeated submit safe;
- honeypot allowed if visually hidden;
- do not store raw client IP;
- use HMAC hash for abuse/rate logic;
- limit repeated submissions conservatively using recent persisted contacts plus short-lived process protection.

Do NOT add Admin Leads/Viewings screen.
Do NOT implement Đặt lịch xem nhà.
General contact submissions are Sheet-backed only in Revision 3.

---

# TASK 11 — ZALO ENV WIRING

Replace hardcoded fallback behavior only when:

`NEXT_PUBLIC_ZALO_URL`

is explicitly configured.

If absent:

- keep current hotline fallback;
- do not invent `zalo.me/...` as production truth;
- record runtime gap in receipt.

All Zalo CTA surfaces must use the same configuration helper.

---

# TASK 12 — SECURITY / DATA LEAK TESTS

Mandatory tests:

- public DTO snapshot never includes commission/guidePerson/internalNotes;
- public APIs/routes cannot retrieve internal fields by query manipulation;
- Admin mutations reject unauthenticated request;
- Google secrets are server-only;
- error messages do not echo private keys/password hashes;
- contact input length/invalid data rejection;
- media MIME validation;
- rental parser quarantine behavior;
- raw source sheet write path does not exist in application runtime.

Do not claim complete security solely from axe/unit tests.

---

# TASK 13 — LIVE INTEGRATION GATE

Implementation may be completed with mocked providers before runtime secrets exist, but GĐ6 must NOT be declared complete until live verification is performed.

Required live secrets/access:

- Google service account email/private key;
- source rental Sheet shared read access;
- explicit CMS spreadsheet ID with write access;
- explicit Drive media folder ID with write access;
- Admin email/password hash/auth secret;
- Zalo URL only if the user has supplied it.

Once secrets are available, verify against live Google APIs:

1. read and normalize real rental rows;
2. confirm ambiguous rows quarantine rather than corrupt mapping;
3. bootstrap WEB_* tabs idempotently;
4. create/edit/hide one TEST custom/override record and remove/clean test artifacts safely;
5. create/edit one TEST project/news draft; never publish test content publicly;
6. upload/delete one TEST media asset if delete support is implemented safely;
7. submit one TEST contact;
8. real Admin login/logout/session protection.

Do not use real client production records as destructive test targets.

If live secrets are unavailable, terminal status is:

`GĐ6_WAITING_FOR_RUNTIME_SECRETS`

not `GĐ6_DONE`.

---

# TASK 14 — REGRESSION / QA

Required:

- `npm run build`
- `npm run lint`
- `npx tsc --noEmit`
- `npx vitest run`
- `npm run test:e2e`

Add GĐ6 integration suites using mocked/in-memory repositories.

Run visual regression for all approved public/admin routes in their default states.

The backend/data architecture may change; the approved visual output may not.

Also test:

- public rental search/filter on live-shaped data;
- Admin BĐS CRUD;
- Project CRUD;
- News CRUD;
- Media upload failure/success;
- Contact submit success/error;
- auth hard navigation/reload;
- mobile/desktop current GĐ5 interactions.

---

# GĐ6 RECEIPT

Create:

`.webby/implementation/GD6_IMPLEMENTATION_RECEIPT.json`

Include at minimum:

- phase;
- executor;
- baseGd5Commit;
- backendContractCommit;
- backendImplementationCommit;
- dataProviders;
- rentalNormalizationStatus;
- rentalOverlayStatus;
- projectCmsStatus;
- newsCmsStatus;
- mediaStatus;
- contactStatus;
- authStatus;
- securityStatus;
- buildStatus;
- testStatus;
- e2eStatus;
- visualRegressionStatus;
- liveIntegrationStatus;
- runtimeSecretsMissing;
- productionContentGaps;
- openRequests;
- blockers;
- knownDeviations.

Update `.webby/PROJECT_STATE.yaml` only for factual GĐ5/GĐ6 state; do not alter visual authority.

---

# FINAL REPORT

Return exactly:

## GĐ6 FINAL REPORT

Status:
`GĐ6_READY_FOR_CHATGPT_ACCEPTANCE`
OR
`GĐ6_WAITING_FOR_RUNTIME_SECRETS`
OR
`GĐ6_INCOMPLETE`

Branch:
...

PR:
...

Base GĐ5 commit:
...

Backend contract commit:
...

Backend implementation commit:
...

Rental live source/normalization:
...

Rental Admin overlay CRUD:
...

Public live rental data:
...

Authentication:
...

Projects CMS:
...

News CMS:
...

Media/Drive:
...

Contact backend:
...

Zalo:
...

Security/data leak checks:
...

Tests:
- build:
- lint:
- typecheck:
- vitest:
- e2e:

Visual regression:
...

Live integration:
...

Runtime secrets missing:
...

Production content gaps:
...

Known deviations:
...

Open blockers:
...

Actual commit count:
...

Next:
ChatGPT GĐ6 functional/security acceptance review, then GĐ7 only after GĐ6 acceptance.

STOP.
Do not start GĐ7.
