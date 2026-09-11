interface EmptySearchResultsProps {
  title: string;
  message: string;
  resetLabel: string;
  onReset: () => void;
}

// The one approved empty-result treatment (from the GĐ4 rental Filter panel
// render) — reused verbatim wherever a "no results" state can occur across
// public search/filter UIs, instead of inventing a second visual language.
export function EmptySearchResults({ title, message, resetLabel, onReset }: EmptySearchResultsProps) {
  return (
    <div className="rounded-md bg-soft p-6">
      <p className="text-h3 text-ink">{title}</p>
      <p className="mt-2 text-body text-muted">{message}</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded-md border border-primary px-6 py-3 text-button uppercase text-primary hover:bg-surface"
      >
        {resetLabel}
      </button>
    </div>
  );
}
