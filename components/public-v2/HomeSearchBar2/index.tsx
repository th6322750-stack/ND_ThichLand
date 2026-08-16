"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { AREA_RANGES, EMPTY_RENTAL_FILTERS, PRICE_RANGES, rentalFiltersToParams } from "@/lib/rentalFilters";
import type { PropertyType } from "@/lib/types";

interface HomeSearchState {
  propertyType: PropertyType | "";
  location: string;
  priceRange: string;
  areaRange: string;
  q: string;
}

const EMPTY_STATE: HomeSearchState = { propertyType: "", location: "", priceRange: "", areaRange: "", q: "" };

interface FieldOption {
  value: string;
  label: string;
}

interface FilterFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: FieldOption[];
}

// MOBILE_PROJECT_FIRST_POLISH section 2B: compact 2-line box (bold label
// over a lighter value/placeholder line) in a 2x2 grid, sized down (~41px
// control height) so the filter grid takes less vertical room and "Dự án
// nổi bật" appears sooner on the page.
function MobileField({ label, placeholder, value, onChange, options }: FilterFieldProps) {
  return (
    <label className="flex min-w-0 cursor-pointer items-center gap-1 rounded-md border border-[#E4E1E0] px-2 py-1 hover:border-[#C9C5C3] hover:bg-[#FAFAFA]">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold leading-tight text-[#0C0D0D]">{label}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`mt-[2px] block w-full appearance-none border-0 bg-transparent p-0 text-[11px] leading-tight focus:outline-none ${
            value ? "text-[#0C0D0D]" : "text-[#5F5D5D]"
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </span>
      <Icon name="chevron-right" size={12} className="shrink-0 rotate-90 text-[#A6A6A6]" />
    </label>
  );
}

// WEB: client feedback on the real single-row master layout — cramming
// "Từ khóa" in as a 5th column truncated its placeholder, and the
// label+placeholder 2-line stack per field ("Loại bất động sản" / "Chọn
// loại") read as cluttered. Simplified to what the client asked for
// directly: Từ khóa gets its own full-width row on top (room to show the
// whole placeholder), the 4 selects sit in one row below, and each select
// collapses to a SINGLE line — its own name doubles as the empty-state
// option text, no separate "Chọn ..." line.
function WebField({ label, value, onChange, options }: Omit<FilterFieldProps, "placeholder">) {
  return (
    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-4 py-3 hover:bg-[#F7F6F6] wide:h-[54px] wide:px-5">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 appearance-none truncate border-0 bg-transparent p-0 text-[13px] font-bold leading-tight text-[#0C0D0D] focus:outline-none wide:text-[14px]"
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevron-right" size={14} className="shrink-0 rotate-90 text-[#A6A6A6] wide:!h-[19px] wide:!w-[19px]" />
    </label>
  );
}

interface HomeSearchBar2Props {
  locationOptions: string[];
  propertyTypeOptions: PropertyType[];
}

// Client-side search — builds a clean query string via the same
// rentalFiltersToParams helper components/public/SearchPanel already uses
// (only non-empty fields are set), instead of a native form GET submission
// that would serialize every empty field into the URL.
export function HomeSearchBar2({ locationOptions, propertyTypeOptions }: HomeSearchBar2Props) {
  const router = useRouter();
  const [state, setState] = useState<HomeSearchState>(EMPTY_STATE);

  function handleSearch() {
    const params = rentalFiltersToParams({ ...EMPTY_RENTAL_FILTERS, ...state }, 1);
    const qs = params.toString();
    router.push(qs ? `/cho-thue?${qs}` : "/cho-thue");
  }

  const FIELDS: (FilterFieldProps & { key: string })[] = [
    {
      key: "propertyType",
      label: "Loại bất động sản",
      placeholder: "Chọn loại",
      value: state.propertyType,
      onChange: (v) => setState((s) => ({ ...s, propertyType: v as PropertyType | "" })),
      options: propertyTypeOptions.map((t) => ({ value: t, label: t })),
    },
    {
      key: "location",
      label: "Khu vực",
      placeholder: "Chọn khu vực",
      value: state.location,
      onChange: (v) => setState((s) => ({ ...s, location: v })),
      options: locationOptions.map((l) => ({ value: l, label: l })),
    },
    {
      key: "priceRange",
      label: "Khoảng giá",
      placeholder: "Chọn khoảng giá",
      value: state.priceRange,
      onChange: (v) => setState((s) => ({ ...s, priceRange: v })),
      options: PRICE_RANGES.map((r) => ({ value: r.id, label: r.label })),
    },
    {
      key: "areaRange",
      label: "Diện tích",
      placeholder: "Chọn diện tích",
      value: state.areaRange,
      onChange: (v) => setState((s) => ({ ...s, areaRange: v })),
      options: AREA_RANGES.map((r) => ({ value: r.id, label: r.label })),
    },
  ];

  return (
    <div className="rounded-lg border border-[#EDEBEA] bg-white p-3 min-[900px]:rounded-xl min-[900px]:p-3 min-[900px]:shadow-[0_20px_45px_-24px_rgba(12,13,13,0.18)] wide:rounded-[16px] wide:p-4 wide:shadow-[0_10px_24px_-6px_rgba(12,13,13,0.22)]">
      <p className="mb-2 text-[12px] font-bold leading-tight text-[#0C0D0D] min-[900px]:hidden">Tìm kiếm bất động sản</p>

      <div className="flex flex-col gap-2 min-[900px]:gap-2 wide:gap-4">
        {/* MOBILE_PROJECT_FIRST_POLISH section 2: keyword+button row now
            comes FIRST on mobile too (same order as WEB already used), so
            the whole search block is shorter and "Dự án nổi bật" appears
            sooner — no more order-1/order-2 flip needed between tiers. The
            outer flex-col's own `gap` (10-12px target) separates the two
            rows, matching how WEB already did it — no divider border. */}
        <div>
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 w-[63%]">
              <span className="mb-[2px] block text-[12px] font-bold leading-tight text-[#0C0D0D] min-[900px]:hidden">Từ khóa</span>
              <input
                type="search"
                aria-label="Từ khóa"
                value={state.q}
                onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
                placeholder="Nhập từ khóa, vị trí, dự án..."
                className="block h-[38px] w-full min-w-0 rounded-[10px] border border-[#E4E1E0] bg-white px-2 text-[13px] leading-tight text-[#0C0D0D] placeholder:text-[#5F5D5D] focus:outline-none min-[900px]:h-[46px] min-[900px]:rounded-md min-[900px]:px-4 min-[900px]:text-[14px] wide:h-[54px] wide:text-[15px]"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="flex h-[38px] w-[34%] shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-[10px] bg-[#880206] px-2 text-[13px] font-bold text-white hover:bg-[#750F0D] min-[900px]:h-[46px] min-[900px]:w-auto min-[900px]:gap-2 min-[900px]:rounded-lg min-[900px]:px-6 min-[900px]:text-[14px] wide:h-[54px] wide:w-[140px]"
            >
              Tìm kiếm
              <Icon name="search" size={14} className="text-white" />
            </button>
          </div>
        </div>

        {/* 4 filters — MOBILE: 2x2 grid of 2-line boxes. WEB: one row of
            single-line selects. */}
        <div>
          <div className="grid grid-cols-2 gap-2 min-[900px]:hidden">
            {FIELDS.map((f) => (
              <MobileField key={f.key} label={f.label} placeholder={f.placeholder} value={f.value} onChange={f.onChange} options={f.options} />
            ))}
          </div>
          <div className="hidden min-[900px]:flex min-[900px]:divide-x min-[900px]:divide-[#E4E1E0] min-[900px]:rounded-md min-[900px]:border min-[900px]:border-[#E4E1E0]">
            {FIELDS.map((f) => (
              <WebField key={f.key} label={f.label} value={f.value} onChange={f.onChange} options={f.options} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
