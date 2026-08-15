import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import tailwindConfig from "../../tailwind.config";

// PHA3 round 3, section 3: tailwind.config.ts replaces Tailwind's default
// spacing scale with a small explicit set (see theme.spacing below). Any
// numeric spacing-family utility (w-72, gap-7, mt-1.5, ...) using a number
// outside that set silently generates NO CSS — Tailwind's JIT just drops
// unknown utilities instead of erroring. Round 2 fixed every instance found
// by hand; this test scans app/(public-v2) and components/public-v2 so a
// regression (or a fresh instance introduced later) fails CI instead of
// silently collapsing to zero at runtime.

const SCALE = tailwindConfig.theme?.spacing as Record<string, string> | undefined;
if (!SCALE) throw new Error("tailwind.config.ts must export theme.spacing for this test to validate against");

const VALID_NUMBERS = new Set(
  Object.keys(SCALE)
    .filter((k) => /^\d+(\.\d+)?$/.test(k))
    .map(Number),
);

// Utility families whose numeric suffix is resolved against theme.spacing.
// (grid-cols-N, z-N, rounded-N, etc. use their own separate scales and are
// intentionally NOT covered here.)
const SPACING_PREFIXES = [
  "w",
  "h",
  "min-w",
  "max-w",
  "min-h",
  "max-h",
  "p",
  "px",
  "py",
  "pt",
  "pr",
  "pb",
  "pl",
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "gap",
  "gap-x",
  "gap-y",
  "space-x",
  "space-y",
  "inset",
  "inset-x",
  "inset-y",
  "top",
  "right",
  "bottom",
  "left",
  "translate-x",
  "translate-y",
];
const PREFIX_SET = new Set(SPACING_PREFIXES);

// Suffixes that are valid regardless of the numeric spacing scale (keyword
// values, or utilities from an unrelated scale like fractional width).
const KEYWORD_SUFFIXES = new Set(["full", "auto", "px", "screen", "min", "max", "fit", "none"]);

// Matches `<optional variant prefixes>:<optional -><name>-<suffix>`, e.g.
// "min-[900px]:mt-1.5", "-translate-y-1/2", "w-72". Only flags suffixes
// that are a bare integer/decimal (fractions like `1/2` and arbitrary
// `[...]` values are left alone — they don't consult theme.spacing).
const UTILITY_RE = /(?:[a-zA-Z0-9_[\]-]+:)*(-)?([a-zA-Z-]+)-(\d+(?:\.\d+)?)(?![a-zA-Z0-9./])/g;

function walk(dir: string, out: string[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) out.push(full);
  }
}

function findViolations(root: string): string[] {
  const files: string[] = [];
  walk(path.resolve(__dirname, "../..", root), files);

  const violations: string[] = [];
  for (const file of files) {
    const lines = fs.readFileSync(file, "utf-8").split("\n");
    lines.forEach((line, i) => {
      UTILITY_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = UTILITY_RE.exec(line))) {
        const [whole, , name, suffix] = m;
        if (!PREFIX_SET.has(name)) continue;
        if (KEYWORD_SUFFIXES.has(suffix)) continue;
        const num = Number(suffix);
        if (VALID_NUMBERS.has(num)) continue;
        violations.push(`${path.relative(process.cwd(), file)}:${i + 1} -> "${whole}"`);
      }
    });
  }
  return violations;
}

describe("public-v2 Tailwind spacing utilities stay inside the configured scale", () => {
  it("app/(public-v2) has no spacing-family class outside theme.spacing", () => {
    const violations = findViolations("app/(public-v2)");
    expect(violations, `Unsupported spacing utilities (silently generate no CSS):\n${violations.join("\n")}`).toEqual([]);
  });

  it("components/public-v2 has no spacing-family class outside theme.spacing", () => {
    const violations = findViolations("components/public-v2");
    expect(violations, `Unsupported spacing utilities (silently generate no CSS):\n${violations.join("\n")}`).toEqual([]);
  });
});
