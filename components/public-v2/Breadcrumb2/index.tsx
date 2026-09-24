import Link from "next/link";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb2({
  items,
  withHomeIcon = false,
  className = "flex",
}: {
  items: Crumb[];
  withHomeIcon?: boolean;
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`${className} flex-wrap items-center gap-1 text-[9px] text-[#5F5D5D] min-[900px]:gap-[6px] min-[900px]:text-[13px]`}
    >
      {withHomeIcon && (
        <>
          <Link href="/" aria-label="Trang chủ" className="flex items-center hover:text-[#880206]">
            <Icon name="home" size={10} className="min-[900px]:!h-[15px] min-[900px]:!w-[15px]" />
          </Link>
          <Icon name="chevron-right" size={9} className="text-[#C9C6C5] min-[900px]:!h-[13px] min-[900px]:!w-[13px]" />
        </>
      )}
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1 min-[900px]:gap-[6px]">
          {item.href ? (
            <Link href={item.href} className="hover:text-[#880206]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#0C0D0D]">{item.label}</span>
          )}
          {i < items.length - 1 && (
            <Icon name="chevron-right" size={9} className="text-[#C9C6C5] min-[900px]:!h-[13px] min-[900px]:!w-[13px]" />
          )}
        </span>
      ))}
    </nav>
  );
}
