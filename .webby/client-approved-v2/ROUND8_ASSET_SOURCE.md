# ROUND 8 — APPROVED DEMO ASSET SOURCE

Status: `READY_FOR_ROUND8_ASSET_MATERIALIZATION`

## Binary policy

Do **not** web-search, generate, substitute, or invent images.

The Round 8 demo binaries are intentionally stored on Google Drive rather than committed as ~500 MB of PNG binaries to Git. Git is the contract/manifest authority; Drive is the binary source.

## Google Drive source

Folder:
`https://drive.google.com/drive/folders/14hT8Tz8SWLfP6lpgGib9MzpXQrJsljGz`

Folder name: `ND Thích Land`

Approved Round-8 binary files are prefixed `R8_01-` through `R8_20-`.

Manifest:
`https://drive.google.com/file/d/1OJBKd_M_kiXMxTKXtV_V0tFnUDxu_aWI/view?usp=drivesdk`

README:
`https://drive.google.com/file/d/1Fzdt1IjrhNqiXxfEFUVJ702PrGnXjsY3/view?usp=drivesdk`

## Quality policy

- 20 PNG assets.
- Production copies are 3840 px wide while preserving source aspect ratio.
- No lossy JPEG conversion.
- The source generator outputs were smaller than 4K; the manifest records the true source dimensions and the 3840 px production dimensions. Do not claim native 4K optical detail.
- Keep the source production PNGs intact; use CSS `object-fit` / `object-position` for route-specific crops.

## Claude preflight

Before Round 8 implementation:

1. Obtain all files `R8_01-*` ... `R8_20-*` from the Drive source.
2. Materialize them locally under a deterministic path such as `public/assets/round8/`.
3. Verify every file SHA256 against `ROUND8_ASSET_MANIFEST.json`.
4. If any binary is unavailable or SHA mismatches, stop with `ROUND8_ASSET_BLOCKED_NEEDS_CHATGPT`.
5. Do not replace a missing file with an approximation.

## Scope

These are temporary DEMO / visual assets. Client-authoritative project/property media will replace them later. Do not treat AI-generated demo imagery as production factual evidence for a named real property/project.
