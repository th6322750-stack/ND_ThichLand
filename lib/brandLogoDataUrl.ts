import { readFileSync } from "fs";
import { join } from "path";

// Shared by the icon/apple-icon/opengraph-image metadata routes, which each
// render through satori (next/og) rather than the DOM — they need the raw
// bytes as a data URI, not a /assets/... URL next/image could optimize.
// Read once per cold start, not per request.
//
// The 400x400 version, not the source 2048x2048 file: satori decodes the
// full image before any resizing happens in the render tree, and handing it
// the full-resolution source made every one of these routes fail outright
// (curl got "empty reply from server" — the request handler was crashing,
// not just running slow). None of these routes render the mark past 180px.
export const brandLogoDataUrl = `data:image/jpeg;base64,${readFileSync(
  join(process.cwd(), "public/assets/v2/branding/dac-thich-land-logo-400.jpg"),
).toString("base64")}`;
