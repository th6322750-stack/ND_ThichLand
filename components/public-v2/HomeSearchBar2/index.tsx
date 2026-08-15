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

// Mobile boxes label+value together in ONE bordered field (small grey label
// line, larger value line below); WEB shows the label above a separately
// bordered select. Same underlying <select> for both — see the field()
// helper below — so there is only ever ONE live element per filter, never
// two competing for the same accessible name (a duplicated mobile+desktop
// pair previously broke tests/e2e/rental-url-state.spec.ts's getByLabel
// query, and no amount of hydration-timing tuning fixed that reliably).
const FIELD_LABEL_CLASS =
  "min-w-0 rounded-md border border-[#E4E1E0] px-2 py-1 min-[900px]:min-w-[90px] min-[900px]:flex-1 min-[900px]:border-0 min-[900px]:p-0";
const FIELD_TEXT_CLASS = "block text-[8px] leading-tight text-[#5F5D5D] min-[900px]:text-[10px]";
const FIELD_CONTROL_CLASS =
  "block w-full border-0 bg-transparent p-0 text-[10px] leading-tight text-[#0C0D0D] focus:outline-none min-[900px]:mt-1 min-[900px]:rounded-md min-[900px]:border min-[900px]:border-[#E4E1E0] min-[900px]:bg-white min-[900px]:px-2 min-[900px]:py-[6px] min-[900px]:text-[11px] min-[900px]:leading-normal";

interface HomeSearchBar2Props {
  locationOptions: string[];
  propertyTypeOptions: PropertyType[];
}

// Client-side search — builds a clean query string via the same
// rentalFiltersToParams helper components/public/SearchPanel already uses
// (only non-empty fields are set), instead of a native form GET submission
// that would serialize every empty field into the URL.
//
// ONE shared grid of fields (not two CSS-toggled copies): mobile is a 2x2
// grid of selects + a full-width keyword-and-button row; WEB is the same
// six fields flowed into one row via grid-template-columns. Only col-span
// and the field() styling change per breakpoint — no duplicated DOM, so no
// duplicated accessible names either.
export function HomeSearchBar2({ locationOptions, propertyTypeOptions }: HomeSearchBar2Props) {
  const router = useRouter();
  const [state, setState] = useState<HomeSearchState>(EMPTY_STATE);

  function handleSearch() {
    const params = rentalFiltersToParams({ ...EMPTY_RENTAL_FILTERS, ...state }, 1);
    const qs = params.toString();
    router.push(qs ? `/cho-thue?${qs}` : "/cho-thue");
  }

  return (
    <div className="rounded-lg border border-[#EDEBEA] bg-white p-2 min-[900px]:p-1">
      <p className="mb-1 text-[11px] font-bold leading-tight text-[#0C0D0D] min-[900px]:hidden">Tìm kiếm bất động sản</p>
      <div className="grid grid-cols-2 gap-1 min-[900px]:grid-cols-[1fr_1fr_1fr_1fr_1.4fr_auto] min-[900px]:items-end min-[900px]:gap-2">
        <label className={FIELD_LABEL_CLASS}>
          <span className={FIELD_TEXT_CLASS}>Loại bất động sản</span>
          <select
            className={FIELD_CONTROL_CLASS}
            value={state.propertyType}
            onChange={(e) => setState((s) => ({ ...s, propertyType: e.target.value as PropertyType | "" }))}
          >
            <option value="">Chọn loại</option>
            {propertyTypeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className={FIELD_LABEL_CLASS}>
          <span className={FIELD_TEXT_CLASS}>Khu vực</span>
          <select className={FIELD_CONTROL_CLASS} value={state.location} onChange={(e) => setState((s) => ({ ...s, location: e.target.value }))}>
            <option value="">Chọn khu vực</option>
            {locationOptions.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className={FIELD_LABEL_CLASS}>
          <span className={FIELD_TEXT_CLASS}>Khoảng giá</span>
          <select className={FIELD_CONTROL_CLASS} value={state.priceRange} onChange={(e) => setState((s) => ({ ...s, priceRange: e.target.value }))}>
            <option value="">Chọn khoảng giá</option>
            {PRICE_RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className={FIELD_LABEL_CLASS}>
          <span className={FIELD_TEXT_CLASS}>Diện tích</span>
          <select className={FIELD_CONTROL_CLASS} value={state.areaRange} onChange={(e) => setState((s) => ({ ...s, areaRange: e.target.value }))}>
            <option value="">Chọn diện tích</option>
            {AREA_RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label
          className={`col-span-2 min-[900px]:col-span-1 min-[900px]:min-w-[130px] min-[900px]:flex-[1.4] ${FIELD_LABEL_CLASS}`}
        >
          <span className={FIELD_TEXT_CLASS}>Từ khóa</span>
          <input
            type="search"
            value={state.q}
            onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
            placeholder="Nhập từ khóa, vị trí, dự án..."
            className={`${FIELD_CONTROL_CLASS} placeholder:text-[#A6A6A6]`}
          />
        </label>
        <button
          type="button"
          onClick={handleSearch}
          className="col-span-2 flex items-center justify-center gap-1 rounded-md bg-[#880206] px-3 py-2 text-[11px] font-semibold leading-tight text-white hover:bg-[#750F0D] min-[900px]:col-span-1 min-[900px]:shrink-0 min-[900px]:gap-2 min-[900px]:px-4 min-[900px]:text-[12px]"
        >
          Tìm kiếm <Icon name="search" size={13} className="text-white" />
        </button>
      </div>
    </div>
  );
}
