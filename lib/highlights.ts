/**
 * Turns the admin/Sheet "Thông tin nổi bật" cell into one public bullet per
 * line. New lines are the preferred authoring format; the older separators
 * remain supported so existing records keep rendering correctly.
 */
export function splitHighlights(value: string | readonly string[]): string[] {
  const values = typeof value === "string" ? [value] : value;
  return values
    .flatMap((item) => item.split(/\r?\n|[•|;]+/))
    .map((item) => item.trim())
    .filter(Boolean);
}
