import type { Availability } from "@/lib/types";

/**
 * Deliberately silent for "Còn trống". A tag that appears on every card
 * carries no information — being available is what a visitor already assumes
 * of a rental listing. Only the two states that change their decision are
 * worth the ink: one they should hurry for, one they should skip.
 */
const STYLES: Partial<Record<Availability, string>> = {
  "Sắp trống": "bg-[#FBEFE3] text-[#8A5A12]",
  "Đã cho thuê": "bg-[#EFEEEE] text-[#5F5D5D]",
};

export function AvailabilityTag2({
  availability,
  availableFrom,
  className = "",
}: {
  availability: Availability;
  /** Appended to "Sắp trống" so the list answers "from when?" without a click. */
  availableFrom?: string | null;
  className?: string;
}) {
  const style = STYLES[availability];
  if (!style) return null;

  const label =
    availability === "Sắp trống" && availableFrom ? `Sắp trống · ${availableFrom}` : availability;

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-[3px] text-[11px] font-semibold ${style} ${className}`}
    >
      {label}
    </span>
  );
}
