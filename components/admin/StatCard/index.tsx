import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";

interface StatCardProps {
  /** The section this figure counts — the card navigates there. */
  href: string;
  icon: IconName;
  label: string;
  value: string;
  note: string;
}

/**
 * These four figures are counts, not health signals: "10 BĐS đang trống" is
 * neither good nor bad on its own. The previous card gave each one a large
 * decorative colour dot and tinted its caption to match, which read as a
 * status the data does not carry — and spent semantic red/amber/green on
 * nothing. Colour is gone; the icon identifies the section, the number is
 * the object, and the whole card is the link into that section.
 */
export function StatCard({ href, icon, label, value, note }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-md border border-line bg-surface p-6 transition-[border-color,box-shadow,transform] duration-fast ease-base hover:-translate-y-1 hover:border-primary hover:shadow-v2-premium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-0 motion-reduce:transform-none"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-label uppercase tracking-[0.08em] text-muted">{label}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-soft">
          <Icon name={icon} size={16} className="opacity-60" aria-hidden />
        </span>
      </div>
      <span className="text-h2 tabular-nums text-ink">{value}</span>
      <span className="text-body text-muted">{note}</span>
    </Link>
  );
}
