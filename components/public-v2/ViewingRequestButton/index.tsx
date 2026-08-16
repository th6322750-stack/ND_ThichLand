"use client";

import { useState } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { ProjectInquiryForm2 } from "@/components/public-v2/ProjectInquiryForm2";

/**
 * "Đặt lịch xem" on /cho-thue/[slug] was an inert <button>. There is no
 * separate viewing/booking backend and the freeze package forbids inventing
 * one, so this routes the request through the already-approved contact
 * channel (WEB_CONTACTS) with the listing named in the "need" line — the
 * office receives a real, actionable request instead of the click doing
 * nothing.
 */
export function ViewingRequestButton({
  listingName,
  className = "",
}: {
  listingName: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useFocusTrap(open, () => setOpen(false));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={className}
      >
        <Icon name="calendar" size={12} className="shrink-0" /> Đặt lịch xem
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-sheet-backdrop bg-black/45 animate-v2-fade-in"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dat-lich-xem-title"
            className="fixed inset-x-0 bottom-0 z-sheet-panel max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5 animate-v2-sheet-up min-[900px]:inset-0 min-[900px]:m-auto min-[900px]:h-fit min-[900px]:max-w-[420px] min-[900px]:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="dat-lich-xem-title" className="text-[16px] font-bold text-[#0C0D0D]">
                  Đặt lịch xem
                </h2>
                <p className="mt-1 text-[12px] text-[#5F5D5D]">
                  {listingName} — để lại số điện thoại, NDTHICH sẽ gọi lại để hẹn giờ xem trực tiếp.
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setOpen(false)}
                className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-md border border-[#E4E1E0]"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="mt-4">
              <ProjectInquiryForm2
                projectName={listingName}
                need={`Đặt lịch xem BĐS: ${listingName}`}
                submitLabel="Gửi yêu cầu xem nhà"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
