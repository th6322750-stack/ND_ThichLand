"use client";

import { useState, type ReactNode } from "react";
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

// Shared field box classes: master shows no icons on either breakpoint —
// each cell is just a bold label over a value/placeholder line, with a
// chevron for selects. MOBILE: its own bordered rounded box (2x2 grid).
// WEB: 01_Home_WEB.png's search bar is a SINGLE row of 5 cells (4 selects
// + Từ khóa) divided by plain left borders, so the box border collapses to
// border-l only (border-l-0 on the first cell via :first-child).
const FIELD_BOX =
  "rounded-md border border-[#E4E1E0] px-3 py-3 min-[900px]:min-w-0 min-[900px]:flex-1 min-[900px]:rounded-none min-[900px]:border-y-0 min-[900px]:border-r-0 min-[900px]:px-4 min-[900px]:py-3 min-[900px]:first:border-l-0";

interface FilterFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

function FilterField({ label, value, placeholder, onChange, children }: FilterFieldProps) {
  return (
    <label className={`flex min-w-0 cursor-pointer items-center gap-1 hover:border-[#C9C5C3] hover:bg-[#FAFAFA] min-[900px]:hover:bg-[#F7F6F6] ${FIELD_BOX}`}>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-bold leading-tight text-[#0C0D0D] min-[900px]:text-[13px]">{label}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`mt-[2px] block w-full appearance-none border-0 bg-transparent p-0 text-[12px] leading-tight focus:outline-none min-[900px]:text-[13px] ${
            value ? "text-[#0C0D0D]" : "text-[#5F5D5D]"
          }`}
        >
          <option value="">{placeholder}</option>
          {children}
        </select>
      </span>
      <Icon name="chevron-right" size={14} className="shrink-0 rotate-90 text-[#A6A6A6]" />
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
// Structure matches 01_Home_WEB.png / 01_Home_MOBILE.png exactly: WEB is
// ONE row of 6 items (4 selects + Từ khóa + Tìm kiếm button); MOBILE is a
// 2x2 select grid with Từ khóa+button as their own full-width row below.
// The keyword+button pair is wrapped in a div that is a normal flex row on
// mobile (so the pair shares one grid row) and `display:contents` on WEB
// (>=900px) so its two children un-nest into direct items of the outer
// row — same DOM, no duplicated <input>/<button>.
export function HomeSearchBar2({ locationOptions, propertyTypeOptions }: HomeSearchBar2Props) {
  const router = useRouter();
  const [state, setState] = useState<HomeSearchState>(EMPTY_STATE);

  function handleSearch() {
    const params = rentalFiltersToParams({ ...EMPTY_RENTAL_FILTERS, ...state }, 1);
    const qs = params.toString();
    router.push(qs ? `/cho-thue?${qs}` : "/cho-thue");
  }

  return (
    <div className="rounded-lg border border-[#EDEBEA] bg-white p-4 min-[900px]:rounded-xl min-[900px]:p-2 min-[900px]:shadow-[0_20px_45px_-24px_rgba(12,13,13,0.18)]">
      <p className="mb-3 text-[13px] font-bold leading-tight text-[#0C0D0D] min-[900px]:hidden">Tìm kiếm bất động sản</p>
      <div className="grid grid-cols-2 gap-2 min-[900px]:flex min-[900px]:items-center min-[900px]:gap-0">
        <FilterField
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

        <div className="col-span-2 flex items-stretch gap-2 min-[900px]:contents">
          <div className={FIELD_BOX}>
            <span className="block text-[12px] font-bold leading-tight text-[#0C0D0D] min-[900px]:text-[13px]">Từ khóa</span>
            <input
              type="search"
              aria-label="Từ khóa"
              value={state.q}
              onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
              placeholder="Nhập từ khóa, vị trí, dự án..."
              className="mt-[2px] block w-full min-w-0 border-0 bg-transparent p-0 text-[12px] leading-tight text-[#0C0D0D] placeholder:text-[#5F5D5D] focus:outline-none min-[900px]:text-[13px]"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="flex shrink-0 items-center justify-center gap-2 self-stretch rounded-md bg-[#880206] px-4 text-[13px] font-semibold text-white hover:bg-[#750F0D] min-[900px]:my-2 min-[900px]:ml-3 min-[900px]:mr-2 min-[900px]:self-auto min-[900px]:rounded-lg min-[900px]:px-6 min-[900px]:text-[14px]"
          >
            Tìm kiếm
            <Icon name="search" size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
