import { Icon } from "@/components/icons";

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-sticky-header flex h-20 items-center justify-between border-b border-line bg-surface px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Menu quản trị"
          onClick={onMenuClick}
          className="flex h-11 w-11 items-center justify-center tablet:hidden"
        >
          <Icon name="menu" size={24} />
        </button>
        <h1 className="text-admin-title-mobile text-ink desktop:text-admin-title">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-md border border-line px-4 py-2 tablet:flex">
          <Icon name="search" size={16} className="text-muted" />
          <input
            type="search"
            placeholder="Tìm nhanh"
            className="w-40 text-body text-ink outline-none placeholder:text-muted"
          />
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-soft text-label text-primary">
          AD
        </span>
      </div>
    </header>
  );
}
