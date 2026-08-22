import Image from "next/image";
import Link from "next/link";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { firstMedia, PROPERTY_PLACEHOLDER } from "@/lib/media";
import type { NewsArticle } from "@/lib/types";

/**
 * Vertical news rail parked in the homepage's side margin.
 *
 * Only rendered from 1850px up (`.v2-news-rail` in globals.css), where the
 * container has been narrowed enough to leave a real gutter. Below that it is
 * `display: none` rather than squeezed — a 120px rail of truncated headlines
 * is worse than no rail, and it must never overlap the content column.
 *
 * The card inside is `position: sticky`, so it travels with the reader
 * through the content and stops at its end — an earlier `fixed` version
 * floated over the hero photograph and the footer. `aria-hidden` is
 * deliberately NOT set: these are real links to real articles and a screen
 * reader user should reach them; the `<aside>` is labelled so they are
 * announced as a side region rather than part of the main flow.
 */
export function NewsRail2({
  side,
  articles,
}: {
  side: "left" | "right";
  articles: NewsArticle[];
}) {
  if (articles.length === 0) return null;

  return (
    <aside
      aria-label={side === "left" ? "Tin tức mới (cột trái)" : "Tin tức mới (cột phải)"}
      className={`v2-news-rail ${side === "left" ? "v2-news-rail-left" : "v2-news-rail-right"}`}
      data-qa-region={`news-rail-${side}`}
    >
      {/* The card sticks; the <aside> around it spans the whole block so the
          sticky has room to travel. */}
      <div className="v2-news-rail-inner">
      <div className="flex items-center justify-between gap-2 border-b border-[#EDEBEA] pb-2">
        <h2 className="text-[14px] font-bold uppercase tracking-[0.08em] text-[#0C0D0D]">Tin tức</h2>
        <Link
          href="/tin-tuc"
          className="text-[13px] font-semibold text-[#880206] transition-opacity duration-fast ease-base hover:opacity-70"
        >
          Xem tất cả
        </Link>
      </div>

      <ul className="mt-4 flex flex-col gap-5">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/tin-tuc/${a.slug}`}
              className="group flex gap-3 rounded-md p-1 transition-colors duration-fast ease-base hover:bg-[#F7F6F6]"
            >
              {/* h-16/w-20 (64x80), not arbitrary h-[60px]/w-[80px]: this theme replaces
                  Tailwind's spacing scale wholesale, and the arbitrary width was
                  silently not generated — the thumbnail collapsed to 0px wide while
                  keeping its height, so the rail rendered as text only. Scale values
                  are what the publicV2TailwindSpacing test exists to enforce. */}
              <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={firstMedia([a.cover], PROPERTY_PLACEHOLDER)}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-base ease-base group-hover:scale-[1.04] motion-reduce:transform-none"
                  unoptimized
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-3 block text-[15px] font-semibold leading-[21px] text-[#0C0D0D] transition-colors duration-fast ease-base group-hover:text-[#880206]">
                  {a.title}
                </span>
                {a.readMinutes > 0 && (
                  <span className="mt-2 flex items-center gap-1 text-[12px] text-[#8A8785]">
                    <Icon name="clock" size={12} /> {a.readMinutes} phút đọc
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      </div>
    </aside>
  );
}
