import { Icon2 as Icon, type IconName } from "@/components/public-v2/Icon2";
import { CountUp } from "@/components/public-v2/CountUp";

const METRICS: { icon: IconName; value: string; label: string }[] = [
  { icon: "person", value: "500+", label: "Bất động sản cho thuê" },
  { icon: "building", value: "50+", label: "Dự án đã & đang tham gia" },
  { icon: "shield", value: "100%", label: "Pháp lý minh bạch" },
  { icon: "clock", value: "24/7", label: "Hỗ trợ tận tâm" },
];

// Master (both viewports) shows all 4 metrics in ONE row — a 2x2 wrap on
// narrow widths is a FAIL, so the base (mobile) layout stays an unconditional
// grid-cols-4 to guarantee that.
//
// At >=900px, centering each stat inside an equal-width grid column (the
// previous attempt) only redistributed the dead space evenly around each
// stat — it didn't remove it, because the outer box still stretched to the
// FULL width of a container that's much wider than the 4 stats need. Fixed
// by switching the box itself to a content-sized (flex, w-fit) group
// centered in the section, instead of a full-bleed grid — same one-row
// guarantee (flex never wraps here), but the box now hugs its own content.
export function TrustMetrics2() {
  return (
    <div className="grid grid-cols-4 gap-2 rounded-lg border border-[#EDEBEA] bg-white p-3 min-[900px]:mx-auto min-[900px]:flex min-[900px]:w-fit min-[900px]:gap-0 min-[900px]:divide-x min-[900px]:divide-[#EDEBEA] min-[900px]:p-2 wide:min-h-[96px] wide:items-center wide:rounded-[17px] wide:p-3 wide:shadow-v2-premium">
      {METRICS.map((m) => (
        <div
          key={m.label}
          className="group flex items-center gap-1 min-[900px]:gap-2 min-[900px]:px-6 wide:px-8"
        >
          <Icon
            name={m.icon}
            size={18}
            className="shrink-0 text-[#C08E47] transition-transform duration-base ease-base group-hover:scale-110 motion-reduce:transform-none min-[900px]:hidden"
          />
          <Icon
            name={m.icon}
            size={22}
            className="hidden shrink-0 text-[#C08E47] transition-transform duration-base ease-base group-hover:scale-110 motion-reduce:transform-none min-[900px]:block wide:!h-[24px] wide:!w-[24px]"
          />
          <div className="min-w-0">
            <CountUp
              value={m.value}
              className="truncate text-[13px] font-bold text-[#0C0D0D] min-[900px]:text-[17px] wide:text-[22px]"
            />
            <p className="truncate text-[10px] leading-tight text-[#5F5D5D] min-[900px]:text-[11px] wide:text-[13px]">{m.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
