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
      {/* Master (both WEB and MOBILE) shows a full-bleed photo occupying the
          right ~50% of the hero at every width — text and photo sit side by
          side even in the 362px-wide mobile capture, not stacked. The photo
          bleeds to the section's own edges (no rounded corners, no padding)
          rather than sitting in a padded/rounded 4:3 card. */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#FBF7F5] to-[#F2E5E6]">
        <div className="absolute inset-y-0 right-0 w-1/2">
          <Image
            src="/assets/v2/home/hero-building.png"
            alt="NDTHICH — không gian sống & kinh doanh"
            fill
            className="object-cover"
            unoptimized
            priority
          />
        </div>
        <div className="relative mx-auto max-w-[1240px] px-3 py-5 min-[900px]:px-10 min-[900px]:py-16">
          <div className="w-1/2 pr-2 min-[900px]:w-1/2 min-[900px]:pr-0">
            <h1 className="text-[16px] font-extrabold leading-[1.15] text-[#0C0D0D] min-[900px]:text-[42px]">
              Không gian sống &amp;
              <br />
              <span className="text-[#880206]">Kinh doanh lý tưởng</span>
            </h1>
            <p className="mt-[6px] text-[10px] font-bold text-[#0C0D0D] min-[900px]:mt-3 min-[900px]:text-[18px]">
              Từ Nguyễn Đắc Thích
            </p>
            <p className="mt-[6px] max-w-md text-[7px] leading-relaxed text-[#5F5D5D] min-[900px]:mt-3 min-[900px]:text-[14px]">
              Chuyên cho thuê nhà, căn hộ, mặt bằng kinh doanh tại các vị trí đắc địa. Pháp lý rõ ràng, hỗ
              trợ tận tâm.
            </p>
            <div className="mt-[10px] flex flex-wrap gap-[6px] min-[900px]:mt-5 min-[900px]:gap-3">
              <Link
                href="/cho-thue"
                className="flex items-center gap-1 rounded-md bg-[#880206] px-2 py-[6px] text-[8px] font-semibold text-white hover:bg-[#750F0D] min-[900px]:gap-2 min-[900px]:px-6 min-[900px]:py-3 min-[900px]:text-[14px]"
              >
                Tìm thuê ngay <Icon name="arrow-right" size={10} className="invert min-[900px]:hidden" />
                <Icon name="arrow-right" size={16} className="hidden invert min-[900px]:block" />
              </Link>
              <Link
                href="/du-an"
                className="flex items-center gap-2 rounded-md border border-[#880206] bg-white px-2 py-[6px] text-[8px] font-semibold text-[#880206] hover:bg-[#F7F6F6] min-[900px]:px-6 min-[900px]:py-3 min-[900px]:text-[14px]"
              >
                Xem dự án
              </Link>
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
          {featuredProperties.map((p, i) => (
            // Master mobile shows exactly 3 cards in one row — with 4 sliced
            // in for desktop's 4-col row, the 4th must not wrap to its own
            // row on the 3-col mobile grid.
            <div key={p.slug} className={i === 3 ? "hidden min-[900px]:block" : undefined}>
              <PropertyCardGrid2 listing={p} />
            </div>
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
        <div className="mt-6 grid grid-cols-4 gap-[6px] min-[900px]:gap-5">
          {featuredProjects.map((p) => (
            <ProjectCardOverlay2 key={p.slug} slug={p.slug} name={p.name} location={p.location} image={p.cardMedia} compact />
          ))}
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      {/* Master keeps image-left/text-right side by side at every width —
          stacking to grid-cols-1 on mobile is a FAIL, so this is grid-cols-2
          unconditionally, with mobile-only smaller type/spacing. */}
      <section className="mx-auto max-w-[1240px] px-3 pb-6 min-[900px]:px-10 min-[900px]:pb-12">
        <div className="grid grid-cols-2 gap-3 min-[900px]:items-center min-[900px]:gap-8">
          <div className="relative aspect-[16/10] overflow-hidden rounded-md min-[900px]:rounded-lg">
            <Image src="/assets/v2/home/about-reception.png" alt="Sảnh đón NDTHICH" fill className="object-cover" unoptimized />
          </div>
          <div>
            <h2 className="text-[11px] font-extrabold text-[#0C0D0D] min-[900px]:text-[26px]">
              Về <span className="text-[#880206]">Nguyễn Đắc Thích</span>
            </h2>
            <p className="mt-1 text-[6.5px] leading-relaxed text-[#5F5D5D] min-[900px]:mt-3 min-[900px]:text-[14px]">
              Với nhiều năm kinh nghiệm trong lĩnh vực bất động sản, chúng tôi cam kết mang đến những sản
              phẩm chất lượng, pháp lý minh bạch và dịch vụ tận tâm.
            </p>
            <div className="mt-[6px] grid grid-cols-2 gap-1 min-[900px]:mt-5 min-[900px]:gap-4">
              {ABOUT_FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-[2px] min-[900px]:gap-[10px]">
                  <Icon name={f.icon} size={8} className="mt-[2px] hidden shrink-0 text-[#C08E47] min-[900px]:block min-[900px]:!h-5 min-[900px]:!w-5" />
                  <div className="min-w-0">
                    <p className="truncate text-[6px] font-bold text-[#0C0D0D] min-[900px]:text-[13px]">{f.title}</p>
                    <p className="hidden text-[12px] text-[#5F5D5D] min-[900px]:block">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/gioi-thieu"
              className="mt-[6px] inline-flex items-center gap-1 rounded-md bg-[#880206] px-[6px] py-1 text-[6px] font-semibold text-white hover:bg-[#750F0D] min-[900px]:mt-5 min-[900px]:gap-2 min-[900px]:px-5 min-[900px]:py-[10px] min-[900px]:text-[13px]"
            >
              Tìm hiểu thêm về chúng tôi
              <Icon name="arrow-right" size={14} className="hidden invert min-[900px]:block" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      {/* Master keeps 3 compact cards in one row at every width. */}
      <section className="mx-auto max-w-[1240px] px-3 pb-6 min-[900px]:px-10 min-[900px]:pb-12">
        <div className="flex items-end justify-between">
          <h2 className="text-[11px] font-extrabold text-[#0C0D0D] min-[900px]:text-[24px]">
            Khách hàng nói về chúng tôi
          </h2>
          <Link href="/lien-he" className="hidden items-center gap-1 text-[13px] font-semibold text-[#880206] min-[900px]:flex">
            Xem tất cả đánh giá <Icon name="arrow-right" size={13} />
          </Link>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-[6px] min-[900px]:mt-6 min-[900px]:gap-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-md border border-[#EDEBEA] bg-white p-[6px] min-[900px]:rounded-lg min-[900px]:p-4">
              <Icon name="quote" size={8} className="text-[#C08E47] min-[900px]:!h-5 min-[900px]:!w-5" />
              <p className="mt-1 line-clamp-2 text-[6px] leading-relaxed text-[#3A3838] min-[900px]:mt-2 min-[900px]:text-[13px]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-1 flex gap-[2px] text-[#C08E47] min-[900px]:mt-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon key={i} name="star" size={6} className="min-[900px]:!h-[14px] min-[900px]:!w-[14px]" />
                ))}
              </div>
              <p className="mt-1 truncate text-[6px] font-bold text-[#0C0D0D] min-[900px]:mt-3 min-[900px]:text-[13px]">{t.name}</p>
              <p className="hidden text-[12px] text-[#5F5D5D] min-[900px]:block">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CONTACT + MAP ============ */}
      {/* Master keeps the burgundy panel and map side by side at every
          width — stacked below 900px is a FAIL, so `flex` applies always. */}
      <section className="mx-auto max-w-[1240px] px-3 pb-8 min-[900px]:px-10 min-[900px]:pb-[56px]">
        <div className="flex overflow-hidden rounded-md border border-[#880206] min-[900px]:rounded-lg">
          <div className="w-[58%] bg-[#880206] p-2 text-white min-[900px]:w-[380px] min-[900px]:shrink-0 min-[900px]:p-8">
            <h2 className="text-[9px] font-bold min-[900px]:text-[19px]">Liên hệ với chúng tôi</h2>
            <ul className="mt-[6px] flex flex-col gap-1 text-[6px] min-[900px]:mt-4 min-[900px]:gap-3 min-[900px]:text-[13px]">
              <li className="flex items-start gap-1 min-[900px]:gap-2">
                <Icon name="pin" size={16} className="mt-[2px] hidden shrink-0 invert min-[900px]:block" />
                120 Nguyễn Xí, Phường 26, Quận Bình Thạnh, TP. HCM
              </li>
              <li className="flex items-center gap-1 min-[900px]:gap-2">
                <Icon name="phone" size={16} className="hidden shrink-0 invert min-[900px]:block" /> 0984 602 303 - 0989 811 396
              </li>
              <li className="flex items-center gap-1 min-[900px]:gap-2">
                <Icon name="chat" size={16} className="hidden shrink-0 invert min-[900px]:block" /> info@ndthich.com.vn
              </li>
              <li className="flex items-start gap-1 min-[900px]:gap-2">
                <Icon name="clock" size={16} className="mt-[2px] hidden shrink-0 invert min-[900px]:block" />
                Thứ 2 - Thứ 7: 8:00 - 18:00
                <br />
                Chủ nhật: 8:00 - 12:00
              </li>
            </ul>
            <Link
              href="/lien-he"
              className="mt-[6px] inline-flex items-center gap-1 rounded-md bg-white px-[6px] py-1 text-[6px] font-semibold text-[#880206] min-[900px]:mt-5 min-[900px]:gap-2 min-[900px]:px-5 min-[900px]:py-[10px] min-[900px]:text-[13px]"
            >
              Gửi yêu cầu tư vấn <Icon name="arrow-right" size={14} className="hidden min-[900px]:block" />
            </Link>
          </div>
          <div className="relative min-h-[110px] flex-1 min-[900px]:min-h-[220px]">
            <Image src="/assets/v2/home/contact-map.png" alt="Bản đồ NDTHICH" fill className="object-cover" unoptimized />
          </div>
        </div>
      </section>
    </>
  );
}
