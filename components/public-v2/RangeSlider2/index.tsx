"use client";

export interface RangeStop {
  value: number;
  label: string;
}

interface RangeSlider2Props {
  fromLabel?: string;
  toLabel?: string;
  stops: RangeStop[];
  fromIndex: number;
  toIndex: number;
  onChange: (fromIndex: number, toIndex: number) => void;
}

// Từ/Đến dual-select + two-handle range slider, matching the approved
// 02_ChoThue_WEB.png master's "Khoảng giá"/"Diện tích" control exactly
// (two labeled selects above a slider track with two round handles).
// `stops` are index positions into the SAME PRICE_RANGES/AREA_RANGES
// boundary values already used by the pre-PHA2 bucket selects — this is a
// presentation-layer adapter (continuous Từ/Đến over the existing
// boundaries), not a new backend range-filtering capability.
export function RangeSlider2({ fromLabel = "Từ", toLabel = "Đến", stops, fromIndex, toIndex, onChange }: RangeSlider2Props) {
  const max = stops.length - 1;

  function handleFromChange(next: number) {
    onChange(Math.min(next, toIndex), toIndex);
  }
  function handleToChange(next: number) {
    onChange(fromIndex, Math.max(next, fromIndex));
  }

  const fromPct = (fromIndex / max) * 100;
  const toPct = (toIndex / max) * 100;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-[12px] text-[#5F5D5D]">{fromLabel}</span>
          <select
            className="mt-1 w-full rounded-md border border-[#E4E1E0] px-3 py-[10px] text-[13px] text-[#0C0D0D]"
            value={fromIndex}
            onChange={(e) => handleFromChange(Number(e.target.value))}
          >
            {stops.map((s, i) => (
              <option key={s.value} value={i} disabled={i > toIndex}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-[12px] text-[#5F5D5D]">{toLabel}</span>
          <select
            className="mt-1 w-full rounded-md border border-[#E4E1E0] px-3 py-[10px] text-[13px] text-[#0C0D0D]"
            value={toIndex}
            onChange={(e) => handleToChange(Number(e.target.value))}
          >
            {stops.map((s, i) => (
              <option key={s.value} value={i} disabled={i < fromIndex}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="relative mt-4 h-5">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#E4E1E0]" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#880206]"
          style={{ left: `${fromPct}%`, right: `${100 - toPct}%` }}
        />
        <input
          type="range"
          aria-label={`${fromLabel} — thanh trượt`}
          min={0}
          max={max}
          step={1}
          value={fromIndex}
          onChange={(e) => handleFromChange(Number(e.target.value))}
          className="range-slider-thumb pointer-events-none absolute inset-x-0 top-1/2 h-5 w-full -translate-y-1/2 appearance-none bg-transparent"
        />
        <input
          type="range"
          aria-label={`${toLabel} — thanh trượt`}
          min={0}
          max={max}
          step={1}
          value={toIndex}
          onChange={(e) => handleToChange(Number(e.target.value))}
          className="range-slider-thumb pointer-events-none absolute inset-x-0 top-1/2 h-5 w-full -translate-y-1/2 appearance-none bg-transparent"
        />
      </div>
    </div>
  );
}
