import Link from "next/link";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { MapEmbed2 } from "@/components/public-v2/MapEmbed2";
import { mapQueryOf, telHref } from "@/lib/data/siteSettings";
import type { SiteSettings } from "@/lib/types";

/**
 * Homepage contact panel + map. The burgundy panel and the map sit side by
 * side at every width — stacked below 900px is a FAIL against the master, so
 * `flex` applies always (unchanged from the original inline markup).
 *
 * The map used to be /assets/v2/home/contact-map.png — a screenshot, so it
 * could never actually match the address next to it and a visitor could not
 * pan, zoom or route to it. It is now a live embed keyed off the same
 * admin-editable address the panel prints.
 */
function mapEmbedSrc(query: string): string {
  const q = encodeURIComponent(query);
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  // The official Embed API is used when a browser key is configured; without
  // one the public `output=embed` form renders the same place, so the block
  // is correct out of the box and simply gets the supported endpoint later.
  return key
    ? `https://www.google.com/maps/embed/v1/place?key=${key}&q=${q}&language=vi&zoom=16`
    : `https://www.google.com/maps?q=${q}&output=embed&hl=vi&z=16`;
}

export function ContactMap2({ settings }: { settings: SiteSettings }) {
  const query = mapQueryOf(settings);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
  const phones = [settings.phonePrimary, settings.phoneSecondary].filter((p) => p.trim());

  return (
    <section className="v2-reveal v2-container pb-3 min-[900px]:pb-6 wide:pb-16" data-qa-region="contact-map">
      <div className="flex overflow-hidden rounded-md border border-[#880206] min-[900px]:rounded-lg wide:rounded-[16px]">
        <div className="w-[58%] bg-[#880206] p-3 text-white min-[900px]:w-[280px] min-[900px]:shrink-0 min-[900px]:p-3 wide:w-[360px] wide:p-6">
          {/* wide: (>=1440px) used to jump all the way to the v2-h3/v2-body
              scale (18px/16px) — sizes meant for full-width blocks elsewhere,
              not this fixed 360px side panel, where they read oversized next
              to the map. Stepped down to sit between the 900px tier and that
              scale instead of leaping straight to it. */}
          <h2 className="text-[13px] font-bold min-[900px]:text-[14px] wide:text-[15px]">Liên hệ với chúng tôi</h2>
          <ul className="mt-2 flex flex-col gap-1 text-[11px] leading-snug min-[900px]:mt-2 min-[900px]:line-clamp-none min-[900px]:gap-1 min-[900px]:text-[11px] wide:mt-3 wide:gap-1 wide:text-[12px] wide:leading-[18px]">
            <li className="flex items-start gap-1 min-[900px]:gap-1">
              <Icon name="pin" size={13} className="mt-[2px] hidden shrink-0 text-white min-[900px]:block" />
              {settings.address}
            </li>
            {phones.length > 0 && (
              <li className="flex items-center gap-1 min-[900px]:gap-1">
                <Icon name="phone" size={13} className="hidden shrink-0 text-white min-[900px]:block" />
                <span>
                  {phones.map((p, i) => (
                    <span key={p}>
                      {i > 0 && " - "}
                      <a href={`tel:${telHref(p)}`} className="hover:underline">
                        {p}
                      </a>
                    </span>
                  ))}
                </span>
              </li>
            )}
            <li className="flex items-center gap-1 min-[900px]:gap-1">
              <Icon name="chat" size={13} className="hidden shrink-0 text-white min-[900px]:block" />
              <a href={`mailto:${settings.email}`} className="hover:underline">
                {settings.email}
              </a>
            </li>
            <li className="flex items-start gap-1 min-[900px]:gap-1">
              <Icon name="clock" size={13} className="mt-[2px] hidden shrink-0 text-white min-[900px]:block" />
              <span>
                {settings.hoursWeekday}
                {settings.hoursWeekend && (
                  <>
                    <br />
                    {settings.hoursWeekend}
                  </>
                )}
              </span>
            </li>
          </ul>
          <Link
            href="/lien-he"
            className="mt-3 inline-flex items-center gap-1 rounded-md bg-white px-3 py-[6px] text-[12px] font-semibold text-[#880206] transition-transform duration-fast ease-base active:scale-[0.97] motion-reduce:active:scale-100 min-[900px]:mt-2 min-[900px]:gap-1 min-[900px]:px-3 min-[900px]:py-[6px] min-[900px]:text-[11px] wide:mt-4 wide:h-10 wide:rounded-lg wide:px-4 wide:text-[12px]"
          >
            Gửi yêu cầu tư vấn <Icon name="arrow-right" size={13} className="hidden min-[900px]:block" />
          </Link>
        </div>
        <div className="relative min-h-[95px] flex-1 min-[900px]:min-h-[110px] wide:min-h-[320px]">
          <MapEmbed2
            src={mapEmbedSrc(query)}
            title={`Bản đồ ${settings.address}`}
            directionsUrl={directionsUrl}
            showPin
          />
        </div>
      </div>
    </section>
  );
}
