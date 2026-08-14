import { Icon, type IconName } from "@/components/icons";

const METRICS: { icon: IconName; value: string; label: string }[] = [
  { icon: "person", value: "500+", label: "Bất động sản cho thuê" },
  { icon: "building", value: "50+", label: "Dự án đã & đang tham gia" },
  { icon: "shield", value: "100%", label: "Pháp lý minh bạch" },
  { icon: "clock", value: "24/7", label: "Hỗ trợ tận tâm" },
];

// Master (both viewports) shows all 4 metrics in ONE row — a 2x2 wrap on
// narrow widths is a FAIL, so grid-cols-4 applies unconditionally, with
// icon/text sized down at the base (mobile) breakpoint to still fit.
export function TrustMetrics2() {
  return (
    <div className="grid grid-cols-4 gap-[6px] rounded-lg border border-[#EDEBEA] bg-white p-[10px] min-[900px]:gap-6 min-[900px]:divide-x min-[900px]:divide-[#EDEBEA] min-[900px]:p-6">
      {METRICS.map((m) => (
        <div key={m.label} className="flex items-center gap-1 min-[900px]:gap-3 min-[900px]:pl-6 min-[900px]:first:pl-0">
          <Icon name={m.icon} size={14} className="shrink-0 text-[#C08E47] min-[900px]:hidden" />
          <Icon name={m.icon} size={26} className="hidden shrink-0 text-[#C08E47] min-[900px]:block" />
          <div className="min-w-0">
            <p className="truncate text-[9px] font-bold text-[#0C0D0D] min-[900px]:text-[20px]">{m.value}</p>
            <p className="text-[6px] leading-tight text-[#5F5D5D] min-[900px]:text-[12px]">{m.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
