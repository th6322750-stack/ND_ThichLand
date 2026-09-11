"use client";

import { useEffect } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { RENTAL_SORT_OPTIONS, type RentalSort } from "@/lib/rentalFilters";

/**
 * Mobile counterpart to the desktop "Sắp xếp" select. The mobile control
 * used to be a button with no handler at all; this gives it the same options
 * and the same URL-backed result, in the bottom-sheet shape the rest of the
 * mobile UI already uses (FilterDrawer2).
 */
export function SortSheet2({
  open,
  value,
  onClose,
  onSelect,
}: {
  open: boolean;
  value: RentalSort;
  onClose: () => void;
  onSelect: (sort: RentalSort) => void;
}) {
  const panelRef = useFocusTrap(open, onClose);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-sheet-backdrop bg-black/45 animate-v2-fade-in" aria-hidden="true" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Sắp xếp kết quả"
        className="fixed inset-x-0 bottom-0 z-sheet-panel rounded-t-2xl bg-white p-5 animate-v2-sheet-up"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#0C0D0D]">Sắp xếp</h2>
          <button
            type="button"
            aria-label="Đóng sắp xếp"
            onClick={onClose}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-md border border-[#E4E1E0]"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <ul className="mt-3 flex flex-col">
          {RENTAL_SORT_OPTIONS.map((option) => {
            const selected = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => onSelect(option.value)}
                  aria-pressed={selected}
                  className={`flex min-h-[48px] w-full items-center justify-between rounded-md px-3 text-[14px] transition-colors duration-fast ease-base ${
                    selected ? "bg-[#FBEFE3] font-bold text-[#880206]" : "text-[#0C0D0D] hover:bg-[#F7F6F6]"
                  }`}
                >
                  {option.label}
                  {selected && <Icon name="check" size={16} />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
