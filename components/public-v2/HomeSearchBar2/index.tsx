"use client";

import { useEffect, useState } from "react";
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

const SELECT_CLASS = "mt-1 w-full rounded-md border border-[#E4E1E0] px-3 py-[10px] text-[13px] text-[#0C0D0D]";
const DESKTOP_SELECT_CLASS = "mt-1 w-full rounded-md border border-[#E4E1E0] px-2 py-2 text-[12px] text-[#0C0D0D]";

interface HomeSearchBar2Props {
  locationOptions: string[];
  propertyTypeOptions: PropertyType[];
}

// Client-side search — builds a clean query string via the same
// rentalFiltersToParams helper components/public/SearchPanel already uses
// (only non-empty fields are set), instead of a native form GET submission
// that would serialize every empty field into the URL.
//
// Rendered as two SEPARATE markup blocks (mobile / desktop), each fully
// self-contained, rather than toggling display:grid/flex on shared
// elements via responsive prefixes — the master's WEB layout (one compact
// row: 4 selects + keyword + button, ~70px tall) and MOBILE layout (2x2
// grid + keyword + button stacked) are different enough structurally that
// sharing DOM nodes across both was fragile.
export function HomeSearchBar2({ locationOptions, propertyTypeOptions }: HomeSearchBar2Props) {
  const router = useRouter();
  const [state, setState] = useState<HomeSearchState>(EMPTY_STATE);

  // Both blocks below render during SSR/first paint (CSS alone decides which
  // is visible, avoiding a hydration mismatch). Once mounted, only the block
  // matching the real viewport stays in the DOM — two live <select> elements
  // sharing the same visible label ("Loại bất động sản" etc.) would otherwise
  // both match a11y/test queries like getByLabel regardless of which one CSS
  // hides, which is exactly what broke tests/e2e/rental-url-state.spec.ts.
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 900px)");
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  function handleSearch() {
    const params = rentalFiltersToParams({ ...EMPTY_RENTAL_FILTERS, ...state }, 1);
    const qs = params.toString();
    router.push(qs ? `/cho-thue?${qs}` : "/cho-thue");
  }

  return (
    <div className="rounded-lg border border-[#EDEBEA] bg-white p-4 min-[900px]:p-3">
      {/* MOBILE */}
      {isDesktop !== true && (
      <div className="min-[900px]:hidden">
        <p className="mb-3 text-[15px] font-bold text-[#0C0D0D]">Tìm kiếm bất động sản</p>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="block text-[12px] text-[#5F5D5D]">Loại bất động sản</span>
            <select
              className={SELECT_CLASS}
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
          <label>
            <span className="block text-[12px] text-[#5F5D5D]">Khu vực</span>
            <select className={SELECT_CLASS} value={state.location} onChange={(e) => setState((s) => ({ ...s, location: e.target.value }))}>
              <option value="">Chọn khu vực</option>
              {locationOptions.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="block text-[12px] text-[#5F5D5D]">Khoảng giá</span>
            <select className={SELECT_CLASS} value={state.priceRange} onChange={(e) => setState((s) => ({ ...s, priceRange: e.target.value }))}>
              <option value="">Chọn khoảng giá</option>
              {PRICE_RANGES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="block text-[12px] text-[#5F5D5D]">Diện tích</span>
            <select className={SELECT_CLASS} value={state.areaRange} onChange={(e) => setState((s) => ({ ...s, areaRange: e.target.value }))}>
              <option value="">Chọn diện tích</option>
              {AREA_RANGES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-3 block">
          <span className="block text-[12px] text-[#5F5D5D]">Từ khóa</span>
          <input
            type="search"
            value={state.q}
            onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
            placeholder="Nhập từ khóa, vị trí, dự án..."
            className="mt-1 w-full rounded-md border border-[#E4E1E0] px-3 py-[10px] text-[13px] text-[#0C0D0D] placeholder:text-[#A6A6A6]"
          />
        </label>
        <button
          type="button"
          onClick={handleSearch}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[#880206] px-6 py-[10px] text-[13px] font-semibold text-white hover:bg-[#750F0D]"
        >
          <Icon name="search" size={16} className="text-white" /> Tìm kiếm
        </button>
      </div>
      )}

      {/* WEB — one compact row, matching 01_TrangChu_WEB.png exactly. */}
      {isDesktop !== false && (
      <div className="hidden min-[900px]:flex min-[900px]:items-end min-[900px]:gap-2">
        <label className="min-[900px]:min-w-[90px] min-[900px]:flex-1">
          <span className="block text-[11px] text-[#5F5D5D]">Loại bất động sản</span>
          <select
            className={DESKTOP_SELECT_CLASS}
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
        <label className="min-[900px]:min-w-[90px] min-[900px]:flex-1">
          <span className="block text-[11px] text-[#5F5D5D]">Khu vực</span>
          <select className={DESKTOP_SELECT_CLASS} value={state.location} onChange={(e) => setState((s) => ({ ...s, location: e.target.value }))}>
            <option value="">Chọn khu vực</option>
            {locationOptions.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="min-[900px]:min-w-[90px] min-[900px]:flex-1">
          <span className="block text-[11px] text-[#5F5D5D]">Khoảng giá</span>
          <select className={DESKTOP_SELECT_CLASS} value={state.priceRange} onChange={(e) => setState((s) => ({ ...s, priceRange: e.target.value }))}>
            <option value="">Chọn khoảng giá</option>
            {PRICE_RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className="min-[900px]:min-w-[90px] min-[900px]:flex-1">
          <span className="block text-[11px] text-[#5F5D5D]">Diện tích</span>
          <select className={DESKTOP_SELECT_CLASS} value={state.areaRange} onChange={(e) => setState((s) => ({ ...s, areaRange: e.target.value }))}>
            <option value="">Chọn diện tích</option>
            {AREA_RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className="min-[900px]:min-w-[130px] min-[900px]:flex-[1.4]">
          <span className="block text-[11px] text-[#5F5D5D]">Từ khóa</span>
          <input
            type="search"
            value={state.q}
            onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
            placeholder="Nhập từ khóa, vị trí, dự án..."
            className="mt-1 w-full rounded-md border border-[#E4E1E0] px-2 py-2 text-[12px] text-[#0C0D0D] placeholder:text-[#A6A6A6]"
          />
        </label>
        <button
          type="button"
          onClick={handleSearch}
          className="flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#880206] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#750F0D]"
        >
          <Icon name="search" size={14} className="text-white" /> Tìm kiếm
        </button>
      </div>
      )}
    </div>
  );
}
