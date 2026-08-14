# NDTHICH — CLIENT APPROVED VISUAL AUTHORITY V2

Status: **FROZEN**
Phase: **PHA 1.5 — FREEZE PACKAGE**
Owner of visual truth: **ChatGPT**
Implementation executor: **Claude (code only)**

## Authority order

1. The 10 client-approved masters indexed by `MASTER_INDEX.json` — exact approved UI target.
2. Client-approved PDF: `NDTHICH - GĐ1 CLIENT REVIEW.pdf` — original visual direction.
3. `IMPLEMENTATION_CONTRACT.json`, `ASSET_MANIFEST.json`, and `QA_PROTOCOL.md` in this package.
4. Existing frontend code / previous Revision 3 / old `.webby/master` — historical implementation only.

If any lower source conflicts with a higher source, **the higher source wins**.

## Non-negotiable ownership

### ChatGPT
- owns all UI decisions A–Z;
- owns master images, assets, layout, typography, color, image crop, responsive composition and visual QA;
- is the only authority allowed to approve a visual deviation.

### Claude
Claude has **zero design authority**. Claude may:
- write/refactor frontend code;
- wire interactions and backend data;
- implement responsive behavior required by the contract;
- fix defects explicitly identified by ChatGPT.

Claude may **not**:
- redesign;
- substitute another visual style;
- generate/search/select replacement imagery;
- change colors, spacing, typography, card structure, hero composition, footer composition or mobile composition;
- "improve" the design;
- treat old Revision 3 as authority;
- self-approve visual fidelity.

If something cannot be reproduced from this package, Claude must stop that item and report `VISUAL_BLOCKED_NEEDS_CHATGPT`.

## Master-image rule

The master PNG is visible-form truth. Numeric values in the implementation contract are support data, not permission to deviate from the master.

When code and master disagree:
`MASTER PNG WINS`.

## Visual vs content authority

The approved master locks **appearance and geometry**. Some names, prices, project examples, addresses or phone digits visible in an AI-rendered master are visual fixture content and are not automatically production facts.

Production runtime must:
- use authoritative backend / Google Sheet / CMS content;
- never fabricate missing business facts;
- preserve the same UI geometry when real content replaces visual fixtures.

For deterministic visual QA, the test harness may use visual-only fixture data matching the master. Fixture data must never be silently promoted to production content.

## Known business-logic boundary

A visual control visible in a master does not automatically authorize a new backend workflow.
Example: a `Đặt lịch xem` control may be rendered for visual fidelity, but it must not create a Leads/Viewings CMS or new persistence flow unless separately approved. Until approved, the interaction remains non-persistent or uses an already-approved contact channel only if ChatGPT explicitly specifies that behavior.

## Freeze

This package is not editable by Claude except when ChatGPT explicitly issues a new visual revision.
