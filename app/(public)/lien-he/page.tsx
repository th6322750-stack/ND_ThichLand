import { Icon } from "@/components/icons";
import { ContactForm } from "@/components/public/ContactForm";
import { getZaloHref } from "@/lib/zalo";

const CONTACT_CARDS = [
  { icon: "phone" as const, label: "Hotline chính", value: "0986 602 203", href: "tel:0986602203" },
  { icon: "phone" as const, label: "Hotline phụ", value: "0985 551 396", href: "tel:0985551396" },
  { icon: "pin" as const, label: "Khu vực hoạt động", value: "Hà Nội" },
];

export default function LienHePage() {
  return (
    <div className="container-page py-10">
      <div className="grid grid-cols-1 gap-8 rounded-md bg-soft p-8 desktop:grid-cols-2 desktop:items-center">
        <div>
          <h1 className="text-h1-mobile text-ink desktop:text-h1">Liên hệ NDTHICH</h1>
          <p className="mt-3 text-body-lg-mobile text-body desktop:text-body-lg">
            Trao đổi trực tiếp về bất động sản cho thuê hoặc thông tin dự án.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="tel:0986602203"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
            >
              <Icon name="phone" size={16} className="invert" /> Gọi 0986 602 203
            </a>
            <a
              href={getZaloHref()}
              className="inline-flex items-center gap-2 rounded-md border border-primary px-6 py-3 text-button uppercase text-primary hover:bg-surface"
            >
              <Icon name="chat" size={16} /> Nhắn Zalo
            </a>
          </div>
        </div>
        <div className="relative flex aspect-[4/3] items-end rounded-md bg-gradient-to-br from-[#C9D6CC] via-[#9CB09E] to-[#6E8570] p-4">
          <span className="text-label text-surface/80">Google Maps / văn phòng</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 tablet:grid-cols-3">
        {CONTACT_CARDS.map((card) => (
          <div key={card.label} className="flex items-center gap-4 rounded-md border border-line p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-soft">
              <Icon name={card.icon} size={20} className="text-primary" />
            </span>
            <div>
              <p className="text-body text-muted">{card.label}</p>
              {card.href ? (
                <a href={card.href} className="text-h3 text-ink hover:text-primary">
                  {card.value}
                </a>
              ) : (
                <p className="text-h3 text-ink">{card.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-md border border-line p-8">
        <h2 className="text-h2-mobile text-ink desktop:text-h2">Gửi yêu cầu tư vấn</h2>
        <p className="mt-1 text-body text-muted">
          Form liên hệ chung, không phải chức năng đặt lịch xem nhà.
        </p>
        <div className="mt-6">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
