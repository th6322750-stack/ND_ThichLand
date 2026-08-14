import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";

interface ProjectCardOverlay2Props {
  slug: string;
  name: string;
  location: string;
  image: string;
  showButton?: boolean;
  /** Home page's mobile row (4 narrow cards in one row, per master) needs much smaller type than the 3-col /du-an grid. */
  compact?: boolean;
  /** Mobile aspect ratio — Home's 4-col row is portrait (4/5); /du-an's single-column mobile list is wide landscape, per 04_DuAn_MOBILE.png. */
  mobileAspect?: string;
}

// Dark-gradient-overlay project card — home featured projects and the
// /du-an grid. Title + location sit over a bottom gradient on the full
// photo; /du-an additionally shows a "Xem chi tiết" button.
export function ProjectCardOverlay2({
  slug,
  name,
  location,
  image,
  showButton = false,
  compact = false,
  mobileAspect = "4/5",
}: ProjectCardOverlay2Props) {
  return (
    <Link
      href={`/du-an/${slug}`}
      className="group relative block aspect-[var(--mobile-aspect)] overflow-hidden rounded-lg min-[900px]:aspect-[272/292]"
      style={{ "--mobile-aspect": mobileAspect } as CSSProperties}
    >
      <Image src={image} alt={name} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className={compact ? "absolute inset-x-0 bottom-0 p-[6px] min-[900px]:p-4" : "absolute inset-x-0 bottom-0 p-4"}>
        <h3
          className={
            compact
              ? "line-clamp-1 text-[8px] font-bold text-white min-[900px]:text-[17px]"
              : "text-[16px] font-bold text-white min-[900px]:text-[17px]"
          }
        >
          {name}
        </h3>
        <p
          className={
            compact
              ? "mt-[2px] line-clamp-1 text-[6px] text-white/90 min-[900px]:mt-1 min-[900px]:flex min-[900px]:items-center min-[900px]:gap-1 min-[900px]:text-[12px]"
              : "mt-1 flex items-center gap-1 text-[12px] text-white/90"
          }
        >
          <Icon name="pin" size={compact ? 13 : 13} className={compact ? "hidden invert min-[900px]:inline" : "invert"} />{" "}
          {location}
        </p>
        {showButton && (
          <span className="mt-3 inline-flex items-center gap-[6px] rounded-md bg-white px-[14px] py-2 text-[12px] font-semibold text-[#0C0D0D]">
            Xem chi tiết <Icon name="arrow-right" size={13} />
          </span>
        )}
      </div>
    </Link>
  );
}
