import Link from "next/link";
import { Icon } from "@/components/icons";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb2({ items, withHomeIcon = false }: { items: Crumb[]; withHomeIcon?: boolean }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-[#5F5D5D]">
      {withHomeIcon && (
        <>
          <Link href="/" aria-label="Trang chủ" className="flex items-center hover:text-[#880206]">
            <Icon name="home" size={15} />
          </Link>
          <Icon name="chevron-right" size={13} className="text-[#C9C6C5]" />
        </>
      )}
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {item.href ? (
            <Link href={item.href} className="hover:text-[#880206]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#0C0D0D]">{item.label}</span>
          )}
          {i < items.length - 1 && <Icon name="chevron-right" size={13} className="text-[#C9C6C5]" />}
        </span>
      ))}
    </nav>
  );
}
