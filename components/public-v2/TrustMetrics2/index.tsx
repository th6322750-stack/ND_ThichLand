import { Icon, type IconName } from "@/components/icons";

const METRICS: { icon: IconName; value: string; label: string }[] = [
  { icon: "person", value: "500+", label: "Bất động sản cho thuê" },
  { icon: "building", value: "50+", label: "Dự án đã & đang tham gia" },
  { icon: "shield", value: "100%", label: "Pháp lý minh bạch" },
  { icon: "clock", value: "24/7", label: "Hỗ trợ tận tâm" },
];

export function TrustMetrics2() {
  return (
    <div className="grid grid-cols-2 gap-6 rounded-lg border border-[#EDEBEA] bg-white p-5 min-[900px]:grid-cols-4 min-[900px]:divide-x min-[900px]:divide-[#EDEBEA] min-[900px]:p-6">
      {METRICS.map((m) => (
        <div key={m.label} className="flex items-center gap-3 min-[900px]:pl-6 min-[900px]:first:pl-0">
          <Icon name={m.icon} size={26} className="shrink-0 text-[#C08E47]" />
          <div>
            <p className="text-[18px] font-bold text-[#0C0D0D] min-[900px]:text-[20px]">{m.value}</p>
            <p className="text-[12px] text-[#5F5D5D]">{m.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
