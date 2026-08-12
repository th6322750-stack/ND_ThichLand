# NDTHICH — GĐ4 STATIC FRONTEND TASK

## Read order
1. `.webby/HANDOFF.json`
2. `.webby/WEBBY_LOCK.json`
3. `.webby/visual-handoff/routes.json`
4. Matching route SVG Master
5. Route-specific maps/contracts
6. Shared tokens/typography/components actually used

## Required routes
- `/`
- `/cho-thue`
- `/cho-thue/[slug]`
- `/du-an`
- `/du-an/[slug]`

## Authority
- ChatGPT = visual truth owner.
- Claude = implementation truth owner.
- Browser implementation is NOT approved visual truth.

## Hard rules
- Do not invent missing visible UI.
- Do not choose a replacement font.
- Do not change the approved white/burgundy/black identity.
- Price + area remain public and filterable.
- Mobile property detail keeps sticky Call / Zalo / Schedule actions.
- Do not crop a logo from screenshots.
- If a material visual decision is unclear, create a `.webby/requests/*.json` request instead of designing it.

## Completion receipt
Publish `.webby/implementation/IMPLEMENTATION_RECEIPT.json` with consumed UI revision/commit, implementation commit, implemented routes, build/test status and blockers.
