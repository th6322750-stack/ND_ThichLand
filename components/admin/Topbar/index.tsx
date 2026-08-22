import Link from "next/link";
import { Icon } from "@/components/icons";

export interface Crumb {
  label: string;
  href?: string;
}

interface TopbarProps {
  crumbs: Crumb[];
  accountEmail: string;
  onMenuClick: () => void;
}

export function Topbar({ crumbs, accountEmail, onMenuClick }: TopbarProps) {
  const initial = (accountEmail.trim()[0] ?? "A").toUpperCase();

  return (
    <header className="sticky top-0 z-sticky-header flex h-20 items-center justify-between gap-4 border-b border-line bg-surface px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Menu quản trị"
          onClick={onMenuClick}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm transition-colors duration-fast ease-base hover:bg-soft tablet:hidden"
        >
          <Icon name="menu" size={24} />
        </button>
        {/* The bar used to repeat the page's own <h1> a few pixels above it.
            It now carries the trail instead — the one thing the page itself
            cannot show, and the only way to get back up a level from a
            deep edit screen without the browser's back button. */}
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex min-w-0 items-center gap-2 text-body">
            {crumbs.map((crumb, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={`${crumb.label}-${i}`} className="flex min-w-0 items-center gap-2">
                  {i > 0 && (
                    <Icon name="chevron-right" size={14} className="shrink-0 opacity-40" aria-hidden />
                  )}
                  {crumb.href && !last ? (
                    <Link
                      href={crumb.href}
                      className="truncate text-muted transition-colors duration-fast ease-base hover:text-primary"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={last ? "page" : undefined}
                      className={last ? "truncate font-semibold text-ink" : "truncate text-muted"}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {/* Replaces a search input that had no state and no handler — it
            looked operable and did nothing. This goes somewhere real. */}
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-2 rounded-sm border border-line px-4 py-2 text-label text-body transition-colors duration-fast ease-base hover:border-primary hover:text-primary tablet:inline-flex"
        >
          Xem website
          <Icon name="arrow-right" size={13} aria-hidden />
        </Link>
        <span
          title={accountEmail}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-soft text-label text-primary"
        >
          {initial}
        </span>
      </div>
    </header>
  );
}
