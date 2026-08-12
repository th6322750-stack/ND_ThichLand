import { StatCard } from "@/components/admin/StatCard";
import { adminProperties } from "@/lib/data/properties.admin";
import { formatCurrencyVnd, formatArea } from "@/lib/format";

const STATS = [
  { color: "#8A1822", label: "BĐS đang trống", value: "128", delta: "+12 tuần này", deltaColor: "#8A1822" },
  { color: "#BE8A3F", label: "Dự án", value: "06", delta: "3 đang triển khai", deltaColor: "#BE8A3F" },
  { color: "#2E6FE0", label: "Tin đã đăng", value: "24", delta: "+4 tháng này", deltaColor: "#2E6FE0" },
  { color: "#23825C", label: "Media", value: "386", delta: "ảnh / video", deltaColor: "#23825C" },
];

export default function AdminDashboardPage() {
  const recent = adminProperties.slice(0, 4);

  return (
    <div>
      <h2 className="text-h1-mobile text-ink desktop:text-h1">Tổng quan</h2>
      <p className="mt-2 text-body text-muted">Theo dõi nguồn cho thuê và nội dung đang vận hành.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <h3 className="mt-10 text-h2-mobile text-ink desktop:text-h2">BĐS cập nhật gần đây</h3>
      <div className="mt-4 overflow-x-auto rounded-md border border-line bg-surface">
        <table className="w-full min-w-[720px] text-left text-body">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="px-6 py-3 font-normal">Phòng / BĐS</th>
              <th className="px-6 py-3 font-normal">Loại</th>
              <th className="px-6 py-3 font-normal">Khu vực</th>
              <th className="px-6 py-3 font-normal">Giá</th>
              <th className="px-6 py-3 font-normal">Diện tích</th>
              <th className="px-6 py-3 font-normal">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((p) => (
              <tr key={p.slug} className="border-b border-line last:border-0 hover:bg-soft">
                <td className="px-6 py-4 font-bold text-ink">{p.roomNo}</td>
                <td className="px-6 py-4">{p.propertyType}</td>
                <td className="px-6 py-4">{p.location}</td>
                <td className="px-6 py-4">{formatCurrencyVnd(p.price)}</td>
                <td className="px-6 py-4">{formatArea(p.area)}</td>
                <td className="px-6 py-4">{p.availability}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-10 text-h2-mobile text-ink desktop:text-h2">Lưu ý dữ liệu</h3>
      <div className="mt-4 rounded-md border border-gold bg-[#FBF3E4] p-6 text-body text-ink">
        <p className="font-bold text-gold">Sheet nguồn có dòng phân nhóm và một số dòng lệch cột.</p>
        <p className="mt-2">Admin nhập theo schema chuẩn hóa. Không render raw row trực tiếp.</p>
        <p className="mt-1">Hoa hồng / người dẫn / ghi chú là INTERNAL-ONLY.</p>
      </div>
    </div>
  );
}
