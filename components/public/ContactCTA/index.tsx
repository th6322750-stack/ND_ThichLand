import { Icon } from "@/components/icons";
import { getZaloHref } from "@/lib/zalo";

interface ContactCTAProps {
  title?: string;
  subtitle?: string;
  callLabel?: string;
  zaloLabel?: string;
}

export function ContactCTA({
  title = "Cần tìm căn phù hợp?",
  subtitle = "Liên hệ trực tiếp để trao đổi nhu cầu và xem nguồn đang trống.",
  callLabel = "Gọi 0986 602 203",
  zaloLabel = "Nhắn Zalo",
}: ContactCTAProps) {
  return (
    <div className="container-page py-10">
      <div className="flex flex-col items-start justify-between gap-6 rounded-md bg-footer p-8 tablet:flex-row tablet:items-center">
        <div>
          <h2 className="text-h2 text-surface">{title}</h2>
          <p className="mt-2 text-body text-[#B9B9B9]">{subtitle}</p>
        </div>
        <div className="flex gap-3">
          <a
            href="tel:0986602203"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
          >
            <Icon name="phone" size={16} className="invert" /> {callLabel}
          </a>
          <a
            href={getZaloHref()}
            className="inline-flex items-center gap-2 rounded-md border border-surface px-6 py-3 text-button uppercase text-surface hover:bg-surface hover:text-ink"
          >
            <Icon name="chat" size={16} className="invert" /> {zaloLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
