/** Immutable reorder helper shared by the BĐS and project editors. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length || from === to) return [...items];
  const next = [...items];
  // Non-null: the bounds check above guarantees `from` is a real index, so
  // splice always removes exactly one element here.
  const [item] = next.splice(from, 1) as [T];
  next.splice(to, 0, item);
  return next;
}
