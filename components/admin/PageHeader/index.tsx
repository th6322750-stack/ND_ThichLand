import type { ReactNode } from "react";

/**
 * Every admin page opened with its own heading at `text-h1` (42px/800) — the
 * marketing scale, set directly under the topbar which was already printing
 * the same words. `admin-title` (28px/700) exists in the token set for
 * exactly this surface and was going unused. One heading per screen, at the
 * scale the system already defined for it, with the page's primary action
 * pinned to the same row.
 */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-admin-title-mobile text-ink desktop:text-admin-title">{title}</h2>
        {description && <p className="mt-1 max-w-[68ch] text-body text-muted">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-3">{action}</div>}
    </div>
  );
}
