"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Icon2 as Icon, type IconName } from "@/components/public-v2/Icon2";
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

interface FilterFieldProps {
  icon: IconName;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

// One field = icon + stacked label/value + chevron, all inside ONE <label>
// so the entire cell (not just the tiny value text) is a click target that
// opens the <select> — every other rounded-md/border/divide-x class here
// only changes the surrounding card style between mobile (its own boxed
// cell) and WEB (one shared row, per the user's reference).
function FilterField({ icon, label, value, placeholder, onChange, children }: FilterFieldProps) {
  return (
    <label className="flex min-w-0 cursor-pointer items-center gap-2 rounded-md border border-[#E4E1E0] px-2 py-2 hover:border-[#C9C5C3] hover:bg-[#FAFAFA] min-[900px]:flex-1 min-[900px]:rounded-none min-[900px]:border-0 min-[900px]:px-4 min-[900px]:py-[10px] min-[900px]:hover:bg-[#F7F6F6]">
      <Icon name={icon} size={16} className="shrink-0 text-[#5F5D5D] min-[900px]:!h-[18px] min-[900px]:!w-[18px]" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[8px] font-bold leading-tight text-[#0C0D0D] min-[900px]:text-[12px]">{label}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`block w-full appearance-none border-0 bg-transparent p-0 text-[9px] leading-tight focus:outline-none min-[900px]:mt-[2px] min-[900px]:text-[12px] ${
            value ? "text-[#0C0D0D]" : "text-[#5F5D5D]"
          }`}
        >
          <option value="">{placeholder}</option>
          {children}
        </select>
      </span>
      <Icon name="chevron-right" size={12} className="shrink-0 rotate-90 text-[#A6A6A6]" />
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
//
// WEB puts the keyword field on its own row on top (icon-in-input, dark
// "Tìm kiếm" button), with the 4 filters in one icon+label+value row below
// — per the user's reference (a Vite/Tailwind listings site at
// KieuQuangLadipage/src/components/Hero.tsx: one white card, `divide-y`
// between the keyword row and the filter row, `divide-x` between filter
// cells). MOBILE keeps the original 2x2 filter grid with the keyword row
// last, each field its own bordered cell — only sizing/spacing/`order`
// change between breakpoints, so this stays ONE set of DOM nodes (no
// duplicated <select>/<input> elements).
export function HomeSearchBar2({ locationOptions, propertyTypeOptions }: HomeSearchBar2Props) {
  const router = useRouter();
  const [state, setState] = useState<HomeSearchState>(EMPTY_STATE);

  function handleSearch() {
    const params = rentalFiltersToParams({ ...EMPTY_RENTAL_FILTERS, ...state }, 1);
    const qs = params.toString();
    router.push(qs ? `/cho-thue?${qs}` : "/cho-thue");
  }

  return (
    <div className="flex flex-col divide-y divide-[#EDEBEA] rounded-lg border border-[#EDEBEA] bg-white min-[900px]:rounded-xl min-[900px]:shadow-[0_20px_45px_-24px_rgba(12,13,13,0.18)]">
      {/* Keyword + search button */}
      <div className="order-2 p-2 min-[900px]:order-1 min-[900px]:p-2">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Icon
              name="search"
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 text-[#A6A6A6] min-[900px]:block"
            />
            <span className="mb-[2px] block text-[8px] font-bold leading-tight text-[#0C0D0D] min-[900px]:hidden">Từ khóa</span>
            <input
              type="search"
              aria-label="Từ khóa"
              value={state.q}
              onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
              placeholder="Nhập từ khóa, vị trí, dự án..."
              className="block w-full min-w-0 rounded-md border border-[#E4E1E0] bg-white px-2 py-2 text-[10px] leading-tight text-[#0C0D0D] placeholder:text-[#A6A6A6] focus:outline-none min-[900px]:h-[44px] min-[900px]:rounded-none min-[900px]:border-0 min-[900px]:px-0 min-[900px]:pl-8 min-[900px]:pr-2 min-[900px]:text-[13px] min-[900px]:font-medium"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="flex shrink-0 items-center justify-center gap-1 rounded-md bg-[#880206] px-3 py-2 text-[11px] font-semibold leading-tight text-white hover:bg-[#750F0D] min-[900px]:h-[44px] min-[900px]:gap-2 min-[900px]:rounded-lg min-[900px]:bg-[#0C0D0D] min-[900px]:px-5 min-[900px]:text-[13px] min-[900px]:font-bold min-[900px]:hover:bg-[#2A2A2A]"
          >
            <Icon name="search" size={13} className="text-white min-[900px]:hidden" />
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="order-1 p-2 min-[900px]:order-2 min-[900px]:p-0">
        <p className="mb-1 text-[11px] font-bold leading-tight text-[#0C0D0D] min-[900px]:hidden">Tìm kiếm bất động sản</p>
        <div className="grid grid-cols-2 gap-2 min-[900px]:flex min-[900px]:gap-0 min-[900px]:divide-x min-[900px]:divide-[#EDEBEA]">
          <FilterField
            icon="building"
            label="Loại bất động sản"
            placeholder="Chọn loại"
            value={state.propertyType}
            onChange={(v) => setState((s) => ({ ...s, propertyType: v as PropertyType | "" }))}
          >
            {propertyTypeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </FilterField>
          <FilterField
            icon="pin"
            label="Khu vực"
            placeholder="Chọn khu vực"
            value={state.location}
            onChange={(v) => setState((s) => ({ ...s, location: v }))}
          >
            {locationOptions.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </FilterField>
          <FilterField
            icon="key"
            label="Khoảng giá"
            placeholder="Chọn khoảng giá"
            value={state.priceRange}
            onChange={(v) => setState((s) => ({ ...s, priceRange: v }))}
          >
            {PRICE_RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </FilterField>
          <FilterField
            icon="area"
            label="Diện tích"
            placeholder="Chọn diện tích"
            value={state.areaRange}
            onChange={(v) => setState((s) => ({ ...s, areaRange: v }))}
          >
            {AREA_RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </FilterField>
        </div>
      </div>
    </div>
  );
}
