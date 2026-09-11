import { Icon } from "@/components/icons";

interface MapEmbedProps {
  address: string;
}

export function MapEmbed({ address }: MapEmbedProps) {
  return (
    <div className="flex aspect-[16/9] flex-col items-center justify-center gap-2 rounded-md border border-line bg-soft text-muted">
      <Icon name="pin" size={24} />
      <span className="text-body">{address}</span>
      <span className="text-body text-muted">Bản đồ sẽ được tích hợp ở giai đoạn sau</span>
    </div>
  );
}
