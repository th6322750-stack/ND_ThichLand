"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

// MOBILE_PROJECT_FIRST_POLISH: client feedback after seeing the 2-line
// box (bold label + separate "Chọn ..." placeholder line) live — drop the
// placeholder line entirely, same single-line collapse WebField already
// uses (the field's own name doubles as the empty-state option text), so
// each box is just one compact line instead of two.
function MobileField({ label, value, onChange, options }: Omit<FilterFieldProps, "placeholder">) {
  return (
    <label className="flex min-w-0 cursor-pointer items-center gap-1 rounded-md border border-[#E4E1E0] px-2 py-2 hover:border-[#C9C5C3] hover:bg-[#FAFAFA]">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 appearance-none truncate border-0 bg-transparent p-0 text-[12px] font-bold leading-tight text-[#0C0D0D] focus:outline-none"
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevron-right" size={11} className="shrink-0 rotate-90 text-[#A6A6A6]" />
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
//
// A native <select>'s open popup is painted by the OS/browser, not this
// page — no amount of CSS reaches it, and on Windows Chrome that popup
// paints a frame or two behind the click, which reads as "khựng"/frozen
// right where the rest of the site is otherwise smooth. This is a real
// button + a portaled panel instead, so the open/close is a transition
// this page actually controls — reusing animate-v2-sheet-up (the same
// "panel arriving" motion FilterDrawer2/SortSheet2 already use) rather
// than inventing a new one.
//
// Portaled to document.body (not absolutely positioned inside this field)
// and repositioned from getBoundingClientRect() each open, with an
// open-upward flip when there isn't room below — studied from a sibling
// project's own hand-rolled combobox (same problem, same fix: an
// absolutely-positioned-in-place panel gets clipped the moment an
// ancestor ever gains overflow-hidden, and a search bar near the bottom
// of a short viewport has nowhere to open downward). Full arrow-key
// navigation for the same reason a native <select> already had it for
// free — this replacement shouldn't regress keyboard use down to
// Escape-only.
function WebField({ label, value, onChange, options }: Omit<FilterFieldProps, "placeholder">) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [panelRect, setPanelRect] = useState<{ top?: number; bottom?: number; left: number; width: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listboxId = useId();

  // Index 0 is the "Tất cả/label" reset option; the real options follow —
  // keeps a single flat list for keyboard nav instead of two separate cases.
  const allOptions = [{ value: "", label }, ...options];

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const estimatedHeight = Math.min(allOptions.length * 36 + 8, 280);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < estimatedHeight && rect.top > spaceBelow;
    const width = Math.max(rect.width, 200);
    setPanelRect({
      top: openUpward ? undefined : rect.bottom + 6,
      bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
      left: Math.min(Math.max(rect.left, 8), window.innerWidth - width - 8),
      width,
    });
  }, [open, allOptions.length]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    // rAF-delayed: the click that opened this panel can itself still be
    // settling a scrollIntoView (trigger near the edge of the viewport) —
    // an immediate scroll listener catches that leftover motion and closes
    // the panel a frame after it opened.
    let attached = false;
    const onScroll = () => setOpen(false);
    const raf = requestAnimationFrame(() => {
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onScroll);
      attached = true;
    });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      cancelAnimationFrame(raf);
      if (attached) {
        window.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onScroll);
      }
    };
  }, [open]);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const selected = options.find((o) => o.value === value);

  function pick(v: string) {
    onChange(v);
    setOpen(false);
  }

  // activeIndex is seeded here (not reactively from an effect keyed on
  // `open`) so opening never triggers a synchronous setState-in-effect
  // cascade — it only needs a starting point once, right as the panel opens.
  function openPanel() {
    setActiveIndex(Math.max(0, allOptions.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  // ONE handler on the trigger button, not a second one on the portaled
  // panel — opening never moves DOM focus into the panel (standard
  // combobox/listbox-button pattern), so a handler attached to the panel
  // would simply never receive these keydown events at all. Behaviour
  // branches on whether the panel is already open.
  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        openPanel();
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, allOptions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(allOptions.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        // Non-null: activeIndex is always clamped into [0, allOptions.length
        // - 1] (which is >= 0 — allOptions always has the placeholder entry).
        pick(allOptions[activeIndex]!.value);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div className="relative min-w-0 flex-1">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        onKeyDown={onTriggerKeyDown}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? `${listboxId}-opt-${activeIndex}` : undefined}
        aria-label={label}
        className="flex w-full min-w-0 items-center gap-2 px-4 py-3 text-left transition-colors duration-fast ease-base hover:bg-[#F7F6F6] active:bg-[#F0EEED] wide:h-[54px] wide:px-5"
      >
        <span className="min-w-0 flex-1 truncate text-[13px] font-bold leading-tight text-[#0C0D0D] wide:text-[14px]">
          {selected ? selected.label : label}
        </span>
        <Icon
          name="chevron-right"
          size={14}
          className={`shrink-0 text-[#A6A6A6] transition-transform duration-fast ease-base wide:!h-[19px] wide:!w-[19px] ${open ? "-rotate-90" : "rotate-90"}`}
        />
      </button>

      {open &&
        panelRect &&
        createPortal(
          <div
            ref={panelRef}
            id={listboxId}
            role="listbox"
            aria-label={label}
            style={{ position: "fixed", top: panelRect.top, bottom: panelRect.bottom, left: panelRect.left, width: panelRect.width }}
            className="animate-v2-sheet-up z-dropdown max-h-[280px] overflow-y-auto rounded-md border border-white/60 bg-white/95 py-1 shadow-[0_16px_40px_-12px_rgba(12,13,13,0.22)] backdrop-blur-md"
          >
            {allOptions.map((o, i) => (
              <button
                key={o.value || "__all__"}
                id={`${listboxId}-opt-${i}`}
                ref={(el) => {
                  optionRefs.current[i] = el;
                }}
                type="button"
                role="option"
                aria-selected={o.value === value}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => pick(o.value)}
                className={`block w-full truncate px-4 py-2 text-left text-[13px] transition-colors duration-fast ease-base active:bg-[#EFEAE8] ${
                  i === activeIndex ? "bg-[#F7F6F6] text-[#880206]" : "text-[#0C0D0D]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

interface HomeSearchBar2Props {
  locationOptions: string[];
  propertyTypeOptions: PropertyType[];
}

// Client-side search — builds a clean query string via the same
// rentalFiltersToParams helper components/public/SearchPanel already uses.
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
    <div className="glass-card rounded-lg p-3 min-[900px]:rounded-xl min-[900px]:p-2 min-[900px]:shadow-[0_20px_45px_-24px_rgba(12,13,13,0.18)] wide:rounded-[16px] wide:p-3 wide:shadow-[0_10px_24px_-6px_rgba(12,13,13,0.22)]">
      <p className="mb-2 text-[12px] font-bold leading-tight text-[#0C0D0D] min-[900px]:hidden">Tìm kiếm bất động sản</p>

      <div className="flex flex-col gap-2 min-[900px]:gap-2 wide:gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 w-[63%] min-[900px]:w-auto min-[900px]:flex-1">
              <input
                type="search"
                aria-label="Từ khóa"
                value={state.q}
                onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
                placeholder="Nhập từ khóa, vị trí, dự án..."
                className="block h-[38px] w-full min-w-0 rounded-[10px] border border-[#E4E1E0] bg-white/90 px-2 text-[13px] leading-tight text-[#0C0D0D] placeholder:text-[#5F5D5D] focus:bg-white focus:outline-none min-[900px]:h-[42px] min-[900px]:rounded-md min-[900px]:px-4 min-[900px]:text-[14px] wide:h-[46px] wide:text-[15px]"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="btn-primary-gradient flex h-[38px] w-[34%] shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-[10px] px-2 text-[13px] font-bold text-white transition-transform duration-fast ease-base active:scale-[0.97] motion-reduce:active:scale-100 min-[900px]:h-[42px] min-[900px]:w-auto min-[900px]:gap-2 min-[900px]:rounded-lg min-[900px]:px-5 min-[900px]:text-[14px] wide:h-[46px] wide:w-[130px]"
            >
              Tìm kiếm
              <Icon name="search" size={14} className="text-white" />
            </button>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-2 min-[900px]:hidden">
            {FIELDS.map((f) => (
              <MobileField key={f.key} label={f.label} value={f.value} onChange={f.onChange} options={f.options} />
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
