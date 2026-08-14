# CLAUDE PHA 2 — IMPLEMENTATION ONLY

**DO NOT EXECUTE UNTIL USER/CHATGPT EXPLICITLY STARTS PHA 2.**

When authorized, read in this order:
1. `VISUAL_AUTHORITY.md`
2. `MASTER_INDEX.json`
3. `IMPLEMENTATION_CONTRACT.json`
4. `ASSET_MANIFEST.json`
5. `QA_PROTOCOL.md`
6. all 10 full-resolution master PNGs from the frozen Drive IDs
7. extracted asset ZIP from the frozen Drive ID

## Role
Your role is implementation only. You have no design authority.

You may code:
- HTML/React/Next/Tailwind/CSS;
- responsive behavior matching the approved endpoints;
- existing approved UX interactions;
- existing backend/CMS integration;
- visual fixture mode and screenshot harness.

You may not:
- redesign;
- generate or search for images;
- substitute placeholders;
- change the visual language;
- use old Revision 3 as authority;
- invent missing UI;
- self-accept visual fidelity.

If blocked by a visual decision or missing asset, report:
`VISUAL_BLOCKED_NEEDS_CHATGPT`

Preserve GĐ6 backend/security/fail-closed behavior.

Terminal state is:
`PHA2_IMPLEMENTATION_READY_FOR_CHATGPT_QA`

Never self-declare visual PASS or merge a PR.
