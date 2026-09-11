import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { MapEmbed2 } from "@/components/public-v2/MapEmbed2";

/**
 * Location block for the project and rental detail pages.
 *
 * What this replaced: a static picture (/assets/v2/property-detail/map.png)
 * with a decorative dot grid over it and a pin drawn dead centre, labelled
 * `alt="Bản đồ {address}"`. It showed the same streets for every record — a
 * project in Hà Nội rendered a map captioned "SUNRISE CITY" — so the pin
 * pointed at nothing. The "Vệ tinh" toggle swapped in a sunset marketing
 * render captioned `alt="Vệ tinh {address}"`, the +/- buttons wrote to a
 * `zoomLevel` state nothing read, and a hardcoded list claimed a school 350m
 * away, a hospital at 800m and a metro stop 150m away for every property in
 * the catalogue — including projects in a city with no metro.
 *
 * None of that was data the CMS holds, so none of it survived. What is left
 * is the only part that is true: a real embed of the address the admin
 * entered and verified, plus a route link.
 */
export function InteractiveMap2({
  query,
  address,
  locationNote,
  title = "Vị trí & Tiện ích kết nối",
}: {
  /** Precise address/place/"lat, lng" to pin. Caller must not render this component with an empty value. */
  query: string;
  /** Human-readable line shown under the title. */
  address: string;
  locationNote?: string | null;
  title?: string;
}) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed&hl=vi&z=16`;

  return (
    <div className="overflow-hidden rounded-lg border border-[#EDEBEA] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EDEBEA] bg-[#FAFAFA] px-3 py-2 min-[900px]:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#880206] text-white">
            <Icon name="pin" size={13} className="text-white" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[12px] font-bold text-[#0C0D0D] min-[900px]:text-[14px]">{title}</h3>
            <p className="line-clamp-1 text-[10px] text-[#5F5D5D] min-[900px]:text-[12px]">{address}</p>
          </div>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-md border border-[#E4E1E0] bg-white px-3 py-1 text-[11px] font-semibold text-[#5F5D5D] transition-colors duration-fast ease-base hover:border-[#880206] hover:text-[#880206]"
        >
          Mở Google Maps ↗
        </a>
      </div>

      <div className="relative aspect-[16/9] min-h-[260px] w-full min-[900px]:min-h-[360px]">
        <MapEmbed2 src={embedSrc} title={`Bản đồ ${address}`} directionsUrl={directionsUrl} />
      </div>

      {locationNote && (
        <p className="px-3 py-3 text-[11px] leading-relaxed text-[#3A3838] min-[900px]:px-4 min-[900px]:text-[13px]">
          {locationNote}
        </p>
      )}
    </div>
  );
}
