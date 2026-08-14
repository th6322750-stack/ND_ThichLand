import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { TrustMetrics2 } from "@/components/public-v2/TrustMetrics2";
import { HomeSearchBar2 } from "@/components/public-v2/HomeSearchBar2";
import { PropertyCardGrid2 } from "@/components/public-v2/PropertyCardGrid2";
import { ProjectCardOverlay2 } from "@/components/public-v2/ProjectCardOverlay2";
import { getRentalProviders } from "@/lib/server/rental/providers";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { toPublicPropertyListings } from "@/lib/server/rental/dto";
import { getLocationOptions, getPropertyTypeOptions } from "@/lib/rentalFilters";
import { getProjectRepository } from "@/lib/server/projects/providers";
import { toPublicProjectListings } from "@/lib/server/projects/dto";
import { isVisualFixtureV2Enabled, getVisualFixtureProperties, getVisualFixtureProjects } from "@/lib/visualFixtureV2";

export const dynamic = "force-dynamic";

const TESTIMONIALS = [
  {
    quote: "Dịch vụ rất chuyên nghiệp, hỗ trợ nhanh chóng. Tôi đã tìm được căn ưng ý chỉ sau 2 ngày.",
    name: "Anh Minh Tuấn",
    role: "Khách thuê căn hộ",
  },
  {
    quote: "Mặt bằng đẹp, vị trí kinh doanh tốt. Rất hài lòng với tư vấn tận tâm.",
    name: "Chị Thu Hằng",
    role: "Khách thuê mặt bằng",
  },
  {
    quote: "Thủ tục rõ ràng, minh bạch. Sẽ tiếp tục hợp tác trong các dự án sắp tới.",
    name: "Anh Quốc Bảo",
    role: "Đối tác đầu tư",
  },
];

const ABOUT_FEATURES: { icon: "check" | "pin" | "clock" | "building"; title: string; desc: string }[] = [
  { icon: "check", title: "Pháp lý minh bạch", desc: "Hợp đồng rõ ràng, thủ tục nhanh gọn" },
  { icon: "pin", title: "Vị trí đắc địa", desc: "Bất động sản tại các khu vực tiềm năng, thuận tiện" },
  { icon: "clock", title: "Dịch vụ tận tâm", desc: "Hỗ trợ 24/7, đồng hành cùng khách hàng" },
  { icon: "building", title: "Giá trị bền vững", desc: "Mang đến không gian sống & kinh doanh lý tưởng" },
];

export default async function HomePageV2() {
  let properties, projects;
  if (isVisualFixtureV2Enabled()) {
    properties = getVisualFixtureProperties();
    projects = getVisualFixtureProjects();
  } else {
    const { source, overlay } = await getRentalProviders();
    const merged = await buildMergedRentalData(source, overlay);
    properties = toPublicPropertyListings(merged.admin);
    const projectRepo = await getProjectRepository();
    projects = toPublicProjectListings(await projectRepo.list()).map((p) => ({ ...p, cardMedia: p.media[0] }));
  }

  const featuredProperties = properties.slice(0, 4);
  const featuredProjects = projects.slice(0, 4);
  const locationOptions = getLocationOptions(properties);
  const propertyTypeOptions = getPropertyTypeOptions(properties);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="bg-gradient-to-br from-white via-[#FBF7F5] to-[#F2E5E6]">
        <div className="mx-auto max-w-[1240px] px-4 py-10 min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:items-center min-[900px]:gap-10 min-[900px]:px-10 min-[900px]:py-16">
          <div>
            <h1 className="text-[30px] font-extrabold leading-[1.15] text-[#0C0D0D] min-[900px]:text-[42px]">
              Không gian sống &amp;
              <br />
              <span className="text-[#880206]">Kinh doanh lý tưởng</span>
            </h1>
            <p className="mt-3 text-[16px] font-bold text-[#0C0D0D] min-[900px]:text-[18px]">Từ Nguyễn Đắc Thích</p>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[#5F5D5D]">
              Chuyên cho thuê nhà, căn hộ, mặt bằng kinh doanh tại các vị trí đắc địa. Pháp lý rõ ràng, hỗ
              trợ tận tâm.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/cho-thue"
                className="flex items-center gap-2 rounded-md bg-[#880206] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#750F0D]"
              >
                Tìm thuê ngay <Icon name="arrow-right" size={16} className="invert" />
              </Link>
              <Link
                href="/du-an"
                className="flex items-center gap-2 rounded-md border border-[#880206] bg-white px-6 py-3 text-[14px] font-semibold text-[#880206] hover:bg-[#F7F6F6]"
              >
                Xem dự án
              </Link>
            </div>
          </div>

          <div className="relative mt-8 min-[900px]:mt-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/assets/v2/home/hero-building.png"
                alt="NDTHICH — không gian sống & kinh doanh"
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST METRICS ============ */}
      <section className="mx-auto max-w-[1240px] px-4 min-[900px]:-mt-10 min-[900px]:px-10">
        <TrustMetrics2 />
      </section>

      {/* ============ SEARCH ============ */}
      <section className="mx-auto max-w-[1240px] px-4 pt-8 min-[900px]:px-10">
        <HomeSearchBar2 locationOptions={locationOptions} propertyTypeOptions={propertyTypeOptions} />
      </section>

      {/* ============ FEATURED RENTALS ============ */}
      <section className="mx-auto max-w-[1240px] px-4 py-12 min-[900px]:px-10">
        <div className="flex items-end justify-between">
          <h2 className="text-[20px] font-extrabold text-[#0C0D0D] min-[900px]:text-[24px]">
            Bất động sản cho thuê nổi bật
          </h2>
          <Link href="/cho-thue" className="flex items-center gap-1 text-[13px] font-semibold text-[#880206]">
            Xem tất cả <Icon name="arrow-right" size={13} />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 min-[900px]:grid-cols-4 min-[900px]:gap-5">
          {featuredProperties.map((p) => (
            <PropertyCardGrid2 key={p.slug} listing={p} />
          ))}
        </div>
      </section>

      {/* ============ FEATURED PROJECTS ============ */}
      <section className="mx-auto max-w-[1240px] px-4 pb-12 min-[900px]:px-10">
        <div className="flex items-end justify-between">
          <h2 className="text-[20px] font-extrabold text-[#0C0D0D] min-[900px]:text-[24px]">Dự án nổi bật</h2>
          <Link href="/du-an" className="flex items-center gap-1 text-[13px] font-semibold text-[#880206]">
            Xem tất cả dự án <Icon name="arrow-right" size={13} />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 min-[900px]:grid-cols-4 min-[900px]:gap-5">
          {featuredProjects.map((p) => (
            <ProjectCardOverlay2 key={p.slug} slug={p.slug} name={p.name} location={p.location} image={p.cardMedia} />
          ))}
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section className="mx-auto max-w-[1240px] px-4 pb-12 min-[900px]:px-10">
        <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-2 min-[900px]:items-center">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
            <Image src="/assets/v2/home/about-reception.png" alt="Sảnh đón NDTHICH" fill className="object-cover" unoptimized />
          </div>
          <div>
            <h2 className="text-[22px] font-extrabold text-[#0C0D0D] min-[900px]:text-[26px]">
              Về <span className="text-[#880206]">Nguyễn Đắc Thích</span>
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#5F5D5D]">
              Với nhiều năm kinh nghiệm trong lĩnh vực bất động sản, chúng tôi cam kết mang đến những sản
              phẩm chất lượng, pháp lý minh bạch và dịch vụ tận tâm.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {ABOUT_FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-2.5">
                  <Icon name={f.icon} size={20} className="mt-0.5 shrink-0 text-[#C08E47]" />
                  <div>
                    <p className="text-[13px] font-bold text-[#0C0D0D]">{f.title}</p>
                    <p className="text-[12px] text-[#5F5D5D]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/gioi-thieu"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#880206] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#750F0D]"
            >
              Tìm hiểu thêm về chúng tôi <Icon name="arrow-right" size={14} className="invert" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="mx-auto max-w-[1240px] px-4 pb-12 min-[900px]:px-10">
        <div className="flex items-end justify-between">
          <h2 className="text-[20px] font-extrabold text-[#0C0D0D] min-[900px]:text-[24px]">
            Khách hàng nói về chúng tôi
          </h2>
          <Link href="/lien-he" className="hidden items-center gap-1 text-[13px] font-semibold text-[#880206] min-[900px]:flex">
            Xem tất cả đánh giá <Icon name="arrow-right" size={13} />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 min-[900px]:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-lg border border-[#EDEBEA] bg-white p-4">
              <Icon name="quote" size={20} className="text-[#C08E47]" />
              <p className="mt-2 text-[13px] leading-relaxed text-[#3A3838]">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-3 flex gap-0.5 text-[#C08E47]">
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon key={i} name="star" size={14} />
                ))}
              </div>
              <p className="mt-3 text-[13px] font-bold text-[#0C0D0D]">{t.name}</p>
              <p className="text-[12px] text-[#5F5D5D]">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CONTACT + MAP ============ */}
      <section className="mx-auto max-w-[1240px] px-4 pb-14 min-[900px]:px-10">
        <div className="overflow-hidden rounded-lg border border-[#880206] min-[900px]:flex">
          <div className="bg-[#880206] p-6 text-white min-[900px]:w-[380px] min-[900px]:shrink-0 min-[900px]:p-8">
            <h2 className="text-[19px] font-bold">Liên hệ với chúng tôi</h2>
            <ul className="mt-4 flex flex-col gap-3 text-[13px]">
              <li className="flex items-start gap-2">
                <Icon name="pin" size={16} className="mt-0.5 shrink-0 invert" />
                120 Nguyễn Xí, Phường 26, Quận Bình Thạnh, TP. HCM
              </li>
              <li className="flex items-center gap-2">
                <Icon name="phone" size={16} className="shrink-0 invert" /> 0984 602 303 - 0989 811 396
              </li>
              <li className="flex items-center gap-2">
                <Icon name="chat" size={16} className="shrink-0 invert" /> info@ndthich.com.vn
              </li>
              <li className="flex items-start gap-2">
                <Icon name="clock" size={16} className="mt-0.5 shrink-0 invert" />
                Thứ 2 - Thứ 7: 8:00 - 18:00
                <br />
                Chủ nhật: 8:00 - 12:00
              </li>
            </ul>
            <Link
              href="/lien-he"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-[13px] font-semibold text-[#880206]"
            >
              Gửi yêu cầu tư vấn <Icon name="arrow-right" size={14} />
            </Link>
          </div>
          <div className="relative min-h-[220px] flex-1">
            <Image src="/assets/v2/home/contact-map.png" alt="Bản đồ NDTHICH" fill className="object-cover" unoptimized />
          </div>
        </div>
      </section>
    </>
  );
}
