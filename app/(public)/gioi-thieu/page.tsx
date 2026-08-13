import { Icon } from "@/components/icons";
import { ContactCTA } from "@/components/public/ContactCTA";

const STATS = [
  { value: "500+", label: "Lượt tư vấn" },
  { value: "Nhiều loại hình", label: "Nguồn BĐS cho thuê" },
  { value: "2 hotline", label: "Liên hệ trực tiếp" },
  { value: "CMS", label: "Chủ động cập nhật" },
];

const VALUES = [
  { title: "Uy tín", body: "Thông tin rõ ràng, hạn chế nhập nhằng." },
  { title: "Tận tâm", body: "Liên hệ trực tiếp và hỗ trợ nhanh." },
  { title: "Bền vững", body: "Hệ thống nội dung có thể mở rộng lâu dài." },
];

const BUSINESS_AREAS = [
  { title: "Bất động sản cho thuê", gradient: "from-[#D3D8DD] via-[#B5BEC5] to-[#89949C]" },
  { title: "Dự án công ty", gradient: "from-[#E6D6CE] via-[#C5AEA1] to-[#9A786A]" },
  { title: "Tin tức & tư vấn", gradient: "from-[#C9D6CC] via-[#9CB09E] to-[#6E8570]" },
];

export default function GioiThieuPage() {
  return (
    <>
      <section className="bg-soft">
        <div className="container-page grid grid-cols-1 gap-8 py-16 desktop:grid-cols-2 desktop:items-center">
          <div>
            <span className="text-label text-primary">VỀ NDTHICH</span>
            <h1 className="mt-3 text-h1-mobile text-ink desktop:text-h1">
              Đầu tư uy tín,
              <br />
              kinh doanh bền vững
            </h1>
            <p className="mt-4 text-body-lg-mobile text-body desktop:text-body-lg">
              Công ty tập trung bất động sản cho thuê và các dự án đầu tư / kinh doanh với trải
              nghiệm khách hàng rõ ràng.
            </p>
          </div>
          <div className="relative flex aspect-[4/3] items-end rounded-md bg-gradient-to-br from-[#E6D6CE] via-[#C5AEA1] to-[#9A786A] p-4">
            <span className="text-label text-surface/80">Thương hiệu / văn phòng</span>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <span className="text-label text-primary">NĂNG LỰC</span>
        <h2 className="mt-2 text-h2-mobile text-ink desktop:text-h2">Các con số nổi bật</h2>
        <p className="mt-1 text-body text-muted">Thông tin có thể cập nhật khi có số liệu chính thức</p>
        <div className="mt-8 grid grid-cols-2 gap-4 desktop:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-md border border-line p-6">
              <p className="text-h2-mobile text-ink desktop:text-h2">{stat.value}</p>
              <p className="mt-1 text-body text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <span className="text-label text-primary">GIÁ TRỊ</span>
        <h2 className="mt-2 text-h2-mobile text-ink desktop:text-h2">Cách NDTHICH vận hành</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 tablet:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-md bg-soft p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
                <Icon name="check" size={18} className="text-primary" />
              </span>
              <h3 className="mt-4 text-h3 text-ink">{value.title}</h3>
              <p className="mt-2 text-body text-muted">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <span className="text-label text-primary">HOẠT ĐỘNG</span>
        <h2 className="mt-2 text-h2-mobile text-ink desktop:text-h2">Lĩnh vực chính</h2>
        <p className="mt-1 text-body text-muted">Tập trung đúng nhu cầu khách và năng lực công ty</p>
        <div className="mt-8 grid grid-cols-1 gap-6 tablet:grid-cols-3">
          {BUSINESS_AREAS.map((area) => (
            <div key={area.title}>
              <div className={`relative flex aspect-[4/3] items-end rounded-md bg-gradient-to-br p-4 ${area.gradient}`}>
                <span className="text-label text-surface/80">{area.title}</span>
              </div>
              <h3 className="mt-4 text-h3 text-ink">{area.title}</h3>
              <p className="mt-1 text-body text-muted">Nội dung chi tiết theo CMS.</p>
            </div>
          ))}
        </div>
      </section>

      <ContactCTA
        title="Kết nối với NDTHICH"
        subtitle="Trao đổi trực tiếp về nhu cầu thuê hoặc dự án."
        callLabel="Gọi ngay"
        zaloLabel="Zalo"
      />
    </>
  );
}
