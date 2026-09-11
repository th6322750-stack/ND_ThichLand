import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SOURCE_ROOTS = ["app", "components", path.join("lib", "data")];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const LEAKED_COPY = [
  /khu vực theo dữ liệu sheet/i,
  /theo dữ liệu dự án/i,
  /theo dữ liệu cms/i,
  /tin tức là module cms riêng/i,
  /typography đã khóa/i,
];

function sourceFiles(root: string): string[] {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(file);
    return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [file] : [];
  });
}

describe("customer-facing copy hygiene", () => {
  it("does not reintroduce implementation notes into public or admin copy", () => {
    const offenders = SOURCE_ROOTS.flatMap(sourceFiles).flatMap((file) => {
      const content = fs.readFileSync(file, "utf8");
      return LEAKED_COPY.filter((pattern) => pattern.test(content)).map((pattern) => ({ file, pattern: pattern.source }));
    });

    expect(offenders).toEqual([]);
  });
});
