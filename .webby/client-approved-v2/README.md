# NDTHICH — PHA 1.5 FREEZE PACKAGE

This directory freezes the client-approved visual direction before Claude implementation.

## What is frozen
- 5 WEB masters
- 5 MOBILE masters
- exact cropped reference/production visual assets derived from the approved masters
- asset manifest
- implementation contract
- visual QA protocol
- visual authority rules

## Binary storage
The full-resolution PNG masters and extracted assets are frozen in Google Drive with immutable file IDs + SHA256 hashes recorded in `MASTER_INDEX.json` and `ASSET_MANIFEST.json`.

Git is the authority for rules/contracts/indexes. Drive is the binary store for the approved full-resolution visual package.

## What is not authorized yet
Claude is **not** authorized to start PHA 2 until the user explicitly says to start coding.

## Branch base
This package is based on current GĐ6 PR #6 head:
`70bb3019e5aca6cba2c11966d06250ea04632760`

Backend/CMS code is preserved. This package reopens only public visual authority.

## Drive backup / full masters
`NDTHICH - CLIENT VISUAL MASTER - PHA 1`
https://drive.google.com/drive/folders/1bWvzzaz8E6A62uUQWTJ2Gm5dTjr3hbHi

## Extracted assets
https://drive.google.com/drive/folders/11811puZBqrsaagbEXzodqkm1CwTxX7Rz

## Next state
After this package is committed and reviewed:
`PHA1_5_FREEZE_PACKAGE_DONE`

Then, only on explicit user approval:
`PHA2_CLAUDE_IMPLEMENTATION`
