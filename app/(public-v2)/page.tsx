import Image from "next/image";
import Link from "next/link";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
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
import { firstMedia, PROJECT_PLACEHOLDER } from "@/lib/media";

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
    projects = toPublicProjectListings(await projectRepo.list()).map((p) => ({
      ...p,
      cardMedia: firstMedia(p.media, PROJECT_PLACEHOLDER),
    }));
  }

  const featuredProperties = properties.slice(0, 4);
  // Round 8 asset map, section 3 "HOME Featured Rentals": R8_05-08.
  // Decorative filler ONLY for a listing with no photo of its own — a real
  // listing always shows its own photo (see the call site below), because a
  // stock skyline presented as a specific rental misrepresents it.
  const HOME_RENTAL_FALLBACK_IMAGES = [
    "/assets/round8/R8_05-quang-truong-hien-dai-duoi-thap-kinh.png",
    "/assets/round8/R8_06-do-thi-ven-song-luc-hoang-hon.png",
    "/assets/round8/R8_07-bo-song-do-thi-luc-hoang-hon.png",
    "/assets/round8/R8_08-hoang-hon-ben-pho-ven-song.png",
  ];
  const featuredProjects = projects.slice(0, 4);
  const locationOptions = getLocationOptions(properties);
  const propertyTypeOptions = getPropertyTypeOptions(properties);

  return (
    <>
      {/* ============ HERO ============ */}
      {/* HERO_PACK_PREMIUM_V1 (NDTHICH_HOME_HERO_PREMIUM_4K.png): full-bleed
          photo at every width, text overlaid over a white->transparent
          gradient from the left so the seam disappears instead of sitting
          at a hard line. Mobile and desktop/wide all share this ONE asset —
          only height and objectPosition differ per breakpoint (see the two
          Image elements below); there is no separate "box on the right"
          tier or asset anymore. */}
      <section className="relative overflow-hidden bg-[#F7F6F6]" data-qa-region="hero">
        {/* HERO_PACK_PREMIUM_V1: single 4K master shared by mobile AND
            desktop — same asset both tiers, only object-position/height
            differ per NDTHICH_HERO_PACK_PREMIUM_V1/HERO_ASSET_MANIFEST.json
            (mobile 72% 50%, desktop 50% 50%). Full-bleed at every width —
            no more separate 900-1439px "box on right" asset/treatment. */}
        <div className="relative h-[280px] min-[900px]:h-[520px] wide:h-[560px]">
          {/* Mobile crop — manifest objectPosition "72% 50%". */}
          <div className="absolute inset-0 min-[900px]:hidden">
            <Image
              src="/assets/v2/hero/NDTHICH_HOME_HERO_PREMIUM_4K.png"
              alt="NDTHICH — không gian sống & kinh doanh"
              fill
              className="object-cover"
              style={{ objectPosition: "72% 50%" }}
              sizes="100vw"
              unoptimized
              priority
            />
          </div>
          {/* Desktop/wide crop — same asset, manifest objectPosition "50% 50%". */}
          <div className="absolute inset-0 hidden min-[900px]:block">
            <Image
              src="/assets/v2/hero/NDTHICH_HOME_HERO_PREMIUM_4K.png"
              alt="NDTHICH — không gian sống & kinh doanh"
              fill
              className="object-cover"
              style={{ objectPosition: "50% 50%" }}
              sizes="100vw"
              unoptimized
              priority
            />
          </div>
          <div
            className="absolute inset-0 min-[900px]:hidden"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,.97) 0%, rgba(255,255,255,.93) 45%, rgba(255,255,255,.55) 68%, rgba(255,255,255,0) 88%)",
            }}
          />
          <div
            className="absolute inset-0 hidden min-[900px]:block"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,.97) 0%, rgba(255,255,255,.9) 32%, rgba(255,255,255,.6) 48%, rgba(255,255,255,.2) 62%, rgba(255,255,255,0) 74%)",
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-center px-4 min-[900px]:hidden">
            <h1 className="text-[22px] font-extrabold leading-[1.15] text-[#0C0D0D]">
              Không gian sống &amp;
              <br />
              <span className="text-[#880206]">Kinh doanh lý tưởng</span>
            </h1>
            <p className="mt-1 text-[13px] font-bold text-[#0C0D0D]">Từ Nguyễn Đắc Thích</p>
            <p className="mt-1 max-w-[220px] text-[13px] leading-snug text-[#5F5D5D]">
              Chuyên cho thuê nhà, căn hộ, mặt bằng kinh doanh tại các vị trí đắc địa.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/cho-thue"
                className="flex items-center gap-1 rounded-[10px] bg-[#880206] px-4 py-[10px] text-[13px] font-semibold text-white hover:bg-[#750F0D]"
              >
                Tìm thuê ngay <Icon name="arrow-right" size={14} className="text-white" />
              </Link>
              <Link
                href="/du-an"
                className="flex items-center gap-1 rounded-[10px] border border-[#880206] bg-white px-4 py-[10px] text-[13px] font-semibold text-[#880206] hover:bg-[#F7F6F6]"
              >
                Xem dự án
              </Link>
            </div>
          </div>
        </div>

        <div className="v2-container absolute inset-0 hidden min-[900px]:flex min-[900px]:items-center">
          <div className="w-1/2 wide:w-full wide:max-w-[620px]">
            <h1 className="text-[32px] font-extrabold leading-[1.15] text-[#0C0D0D] wide:text-v2-hero">
              Không gian sống &amp;
              <br />
              <span className="text-[#880206]">Kinh doanh lý tưởng</span>
            </h1>
            <p className="mt-3 text-[16px] font-bold text-[#0C0D0D] wide:text-[18px] wide:leading-[26px]">
              Từ Nguyễn Đắc Thích
            </p>
            <p className="mt-3 max-w-md text-[14px] leading-snug text-[#5F5D5D] wide:max-w-[560px] wide:text-[17px] wide:leading-[28px]">
              Chuyên cho thuê nhà, căn hộ, mặt bằng kinh doanh tại các vị trí đắc địa. Pháp lý rõ ràng, hỗ
              trợ tận tâm.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/cho-thue"
                className="flex items-center gap-2 rounded-md bg-[#880206] px-5 py-[10px] text-[13px] font-semibold text-white hover:bg-[#750F0D] wide:h-[52px] wide:rounded-[10px] wide:px-6 wide:text-[15px]"
              >
                Tìm thuê ngay <Icon name="arrow-right" size={16} className="text-white" />
              </Link>
              <Link
                href="/du-an"
                className="flex items-center gap-2 rounded-md border border-[#880206] bg-white px-5 py-[10px] text-[13px] font-semibold text-[#880206] hover:bg-[#F7F6F6] wide:h-[52px] wide:rounded-[10px] wide:px-6 wide:text-[15px]"
              >
                Xem dự án
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST METRICS ============ */}
      {/* No negative margin here — the hero photo is now full-bleed to the
          section's own bottom edge (inset-y-0), so any overlap would sit
          directly on top of the photo instead of the old gradient-only
          backdrop, cutting into the metrics card's own icons/text. */}
      <section className="v2-container pt-2 min-[900px]:pt-3 wide:pt-8" data-qa-region="trustmetrics">
        <TrustMetrics2 />
      </section>

      {/* ============ SEARCH ============ */}
      <section className="v2-container pt-2 min-[900px]:pt-3 wide:pt-8" data-qa-region="search">
        <HomeSearchBar2 locationOptions={locationOptions} propertyTypeOptions={propertyTypeOptions} />
      </section>

      {/* ============ FEATURED PROJECTS ============ */}
      {/* Business priority: this site exists to sell projects, so "Dự án
          nổi bật" now leads, ahead of the rentals grid. */}
      <section className="v2-container pb-2 pt-4 min-[900px]:py-6 wide:py-16" data-qa-region="featured-projects">
        <div className="flex items-end justify-between">
          <h2 className="text-[16px] font-extrabold text-[#0C0D0D] min-[900px]:text-[17px] wide:text-v2-h2">Dự án nổi bật</h2>
          <Link
            href="/du-an"
            className="flex items-center gap-1 text-[11px] font-semibold text-[#880206] min-[900px]:text-[12px] wide:text-v2-viewall"
          >
            Xem tất cả dự án <Icon name="arrow-right" size={10} className="min-[900px]:!h-[12px] min-[900px]:!w-[12px]" />
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 min-[900px]:mt-3 min-[900px]:grid-cols-4 min-[900px]:gap-4 wide:mt-6 wide:gap-6">
          {featuredProjects.map((p) => (
            <ProjectCardOverlay2
              key={p.slug}
              slug={p.slug}
              name={p.name}
              location={p.location}
              image={p.cardMedia}
              compact
              mobileAspect="3/2"
              desktopAspect="199/144"
              wideAspect="16/10"
            />
          ))}
        </div>
      </section>

      {/* ============ FEATURED RENTALS ============ */}
      <section className="v2-container pb-3 min-[900px]:pb-6 wide:pb-16" data-qa-region="featured-rentals">
        <div className="flex items-end justify-between">
          <h2 className="text-[15px] font-extrabold text-[#0C0D0D] min-[900px]:text-[17px] wide:text-v2-h2">
            Bất động sản cho thuê nổi bật
          </h2>
          <Link
            href="/cho-thue"
            className="flex items-center gap-1 text-[11px] font-semibold text-[#880206] min-[900px]:text-[12px] wide:text-v2-viewall"
          >
            Xem tất cả <Icon name="arrow-right" size={10} className="min-[900px]:!h-[12px] min-[900px]:!w-[12px]" />
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 min-[900px]:mt-1 min-[900px]:grid-cols-4 min-[900px]:gap-4 wide:mt-6 wide:gap-6">
          {featuredProperties.map((p, i) => (
            <PropertyCardGrid2
              key={p.slug}
              listing={p}
              mobileAspect="3/2"
              imageOverride={p.media.length > 0 ? undefined : HOME_RENTAL_FALLBACK_IMAGES[i]}
              wideAspect="16/10"
            />
          ))}
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      {/* MOBILE_PROJECT_FIRST_POLISH section 5: the old side-by-side 50/50
          split couldn't fit readable text (was down to 6-10px). Stacked
          image-on-top/text-below on mobile instead — readability over
          matching the old master's side-by-side mobile composition, which
          this task explicitly authorizes. 900px+ keeps the original
          side-by-side layout unchanged. */}
      <section className="v2-container pb-3 min-[900px]:pb-6 wide:pb-16" data-qa-region="about">
        <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-2 min-[900px]:items-center min-[900px]:gap-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg min-[900px]:aspect-auto min-[900px]:h-[193px] wide:h-[360px] wide:rounded-[16px]">
            <Image src="/assets/round8/R8_11-sanh-sang-trong-hien-dai.png" alt="Sảnh đón NDTHICH" fill className="object-cover" unoptimized />
          </div>
          <div>
            <h2 className="text-[18px] font-extrabold text-[#0C0D0D] min-[900px]:text-[16px] wide:text-v2-h2">
              Về <span className="text-[#880206]">Nguyễn Đắc Thích</span>
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-[#5F5D5D] min-[900px]:mt-1 min-[900px]:line-clamp-2 min-[900px]:text-[11px] wide:mt-3 wide:text-v2-body">
              Với nhiều năm kinh nghiệm trong lĩnh vực bất động sản, chúng tôi cam kết mang đến những sản
              phẩm chất lượng, pháp lý minh bạch và dịch vụ tận tâm.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 min-[900px]:mt-2 min-[900px]:grid-cols-4 min-[900px]:gap-2 wide:mt-5 wide:gap-4">
              {ABOUT_FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-2 min-[900px]:gap-1 wide:gap-2">
                  <Icon
                    name={f.icon}
                    size={14}
                    className="mt-[2px] shrink-0 text-[#C08E47] min-[900px]:!h-3 min-[900px]:!w-3 wide:!h-4 wide:!w-4"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-[#0C0D0D] min-[900px]:text-[10px] wide:text-[13px] wide:leading-[18px]">
                      {f.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/gioi-thieu"
              className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-[#880206] px-4 py-[10px] text-[13px] font-semibold text-white hover:bg-[#750F0D] min-[900px]:mt-2 min-[900px]:gap-2 min-[900px]:rounded-md min-[900px]:px-4 min-[900px]:py-[6px] min-[900px]:text-[11px] wide:mt-6 wide:h-[52px] wide:rounded-[10px] wide:px-6 wide:text-[15px]"
            >
              Tìm hiểu thêm về chúng tôi
              <Icon name="arrow-right" size={14} className="text-white" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      {/* Master keeps 3 compact cards in one row at every width. */}
      <section className="v2-container pb-3 min-[900px]:pb-6 wide:pb-16" data-qa-region="testimonials">
        <div className="flex items-end justify-between">
          <h2 className="text-[16px] font-extrabold text-[#0C0D0D] min-[900px]:text-[16px] wide:text-v2-h2">
            Khách hàng nói về chúng tôi
          </h2>
          <Link
            href="/lien-he"
            className="hidden items-center gap-1 text-[12px] font-semibold text-[#880206] min-[900px]:flex wide:text-v2-viewall"
          >
            Xem tất cả đánh giá <Icon name="arrow-right" size={12} />
          </Link>
        </div>
        {/* MOBILE_PROJECT_FIRST_POLISH section 6: a 3-up mobile grid couldn't
            sustain the 13px readability floor for quote/name text — stacked
            single-column on mobile instead; 900px+ keeps the original 3-up
            row unchanged. */}
        <div className="mt-3 grid grid-cols-1 gap-3 min-[900px]:mt-1 min-[900px]:grid-cols-3 min-[900px]:gap-2 wide:mt-6 wide:gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-lg border border-[#EDEBEA] bg-white p-4 min-[900px]:rounded-lg min-[900px]:p-1 wide:rounded-[14px] wide:p-5 wide:shadow-v2-premium"
            >
              <Icon name="quote" size={16} className="text-[#C08E47] min-[900px]:!h-3 min-[900px]:!w-3" />
              <p className="mt-2 text-[13px] leading-snug text-[#3A3838] min-[900px]:mt-[2px] min-[900px]:line-clamp-2 min-[900px]:text-[10px] wide:mt-2 wide:text-v2-body">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-2 flex gap-1 text-[#C08E47] min-[900px]:mt-[2px]">
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon key={i} name="star" size={13} className="min-[900px]:!h-[10px] min-[900px]:!w-[10px]" />
                ))}
              </div>
              <p className="mt-2 truncate text-[13px] font-bold text-[#0C0D0D] min-[900px]:mt-[2px] min-[900px]:text-[10px] wide:mt-3 wide:text-v2-h3">
                {t.name}
              </p>
              <p className="truncate text-[12px] text-[#5F5D5D] min-[900px]:text-[9px] wide:text-v2-caption">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CONTACT + MAP ============ */}
      {/* Master keeps the burgundy panel and map side by side at every
          width — stacked below 900px is a FAIL, so `flex` applies always. */}
      <section className="v2-container pb-3 min-[900px]:pb-6 wide:pb-16" data-qa-region="contact-map">
        <div className="flex overflow-hidden rounded-md border border-[#880206] min-[900px]:rounded-lg wide:rounded-[16px]">
          <div className="w-[58%] bg-[#880206] p-3 text-white min-[900px]:w-[280px] min-[900px]:shrink-0 min-[900px]:p-3 wide:w-[360px] wide:p-8">
            <h2 className="text-[13px] font-bold min-[900px]:text-[14px] wide:text-v2-h3">Liên hệ với chúng tôi</h2>
            <ul className="mt-2 flex flex-col gap-1 text-[11px] leading-snug min-[900px]:mt-2 min-[900px]:line-clamp-none min-[900px]:gap-1 min-[900px]:text-[11px] wide:mt-4 wide:gap-2 wide:text-v2-body">
              <li className="flex items-start gap-1 min-[900px]:gap-1">
                <Icon name="pin" size={13} className="mt-[2px] hidden shrink-0 text-white min-[900px]:block" />
                120 Nguyễn Xí, Phường 26, Quận Bình Thạnh, TP. HCM
              </li>
              <li className="flex items-center gap-1 min-[900px]:gap-1">
                <Icon name="phone" size={13} className="hidden shrink-0 text-white min-[900px]:block" /> 0986 602 203 - 0985 551 396
              </li>
              <li className="flex items-center gap-1 min-[900px]:gap-1">
                <Icon name="chat" size={13} className="hidden shrink-0 text-white min-[900px]:block" /> info@ndthich.com.vn
              </li>
              <li className="flex items-start gap-1 min-[900px]:gap-1">
                <Icon name="clock" size={13} className="mt-[2px] hidden shrink-0 text-white min-[900px]:block" />
                Thứ 2 - Thứ 7: 8:00 - 18:00
                <br />
                Chủ nhật: 8:00 - 12:00
              </li>
            </ul>
            <Link
              href="/lien-he"
              className="mt-3 inline-flex items-center gap-1 rounded-md bg-white px-3 py-[6px] text-[12px] font-semibold text-[#880206] min-[900px]:mt-2 min-[900px]:gap-1 min-[900px]:px-3 min-[900px]:py-[6px] min-[900px]:text-[11px] wide:mt-6 wide:h-[48px] wide:rounded-[10px] wide:px-5 wide:text-[14px]"
            >
              Gửi yêu cầu tư vấn <Icon name="arrow-right" size={13} className="hidden min-[900px]:block" />
            </Link>
          </div>
          <div className="relative min-h-[95px] flex-1 min-[900px]:min-h-[110px] wide:min-h-[320px]">
            <Image src="/assets/v2/home/contact-map.png" alt="Bản đồ NDTHICH" fill className="object-cover" unoptimized />
          </div>
        </div>
      </section>
    </>
  );
}
