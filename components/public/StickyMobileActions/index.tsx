import { Icon } from "@/components/icons";
import { getZaloHref } from "@/lib/zalo";

interface StickyMobileActionsProps {
  callLabel?: string;
  zaloLabel?: string;
}

export function StickyMobileActions({
  callLabel = "Gọi ngay",
  zaloLabel = "Zalo",
}: StickyMobileActionsProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-sticky-mobile-actions flex gap-3 border-t border-line bg-surface p-4 desktop:hidden">
      <a
        href="tel:0986602203"
        className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-button uppercase text-surface"
      >
        <Icon name="phone" size={16} className="invert" /> {callLabel}
      </a>
      <a
        href={getZaloHref()}
        className="flex flex-1 items-center justify-center gap-2 rounded-md border border-primary px-6 py-3 text-button uppercase text-primary"
      >
        <Icon name="chat" size={16} /> {zaloLabel}
      </a>
    </div>
  );
}
