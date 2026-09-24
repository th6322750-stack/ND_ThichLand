import "server-only";
import type { ZodError } from "zod";

/**
 * Every admin form already renders errors from a flat `{ field: message }`
 * map (one message per field, not zod's own `{ field: string[] }` shape) —
 * this is the one conversion point so schemas can move to zod without
 * touching every form component's error-rendering code.
 *
 * Built from `error.issues` directly, not `error.flatten()`: flatten only
 * keeps the first segment of an issue's path, so a nested array field like
 * `path: ["stats", 0, "value"]` (the admin "Năng lực" repeater) collapses
 * to the key `stats` — losing exactly which row and field was invalid, so
 * the form could no longer highlight the one field that needs fixing.
 * Joining the full path with "." instead reproduces the dotted keys
 * (`stats.0.value`) the hand-rolled validators already produced.
 */
export function fieldErrorsFromZodError(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
