import Image from "next/image";
import Link from "next/link";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { TrustMetrics2 } from "@/components/public-v2/TrustMetrics2";
import { HomeSearchBar2 } from "@/components/public-v2/HomeSearchBar2";
import { PropertyCardGrid2 } from "@/components/public-v2/PropertyCardGrid2";
import { ProjectCardOverlay2 } from "@/components/public-v2/ProjectCardOverlay2";
import { Carousel2 } from "@/components/public-v2/Carousel2";
import { ContactMap2 } from "@/components/public-v2/ContactMap2";
import { ProfileFlipbook2 } from "@/components/public-v2/ProfileFlipbook2";
import { NewsRail2 } from "@/components/public-v2/NewsRail2";
import { telHref } from "@/lib/data/siteSettings";
import { getSiteSettingsRepository } from "@/lib/server/settings/providers";
import { getRentalProviders } from "@/lib/server/rental/providers";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { toPublicPropertyListings } from "@/lib/server/rental/dto";
import { getLocationOptions, getPropertyTypeOptions } from "@/lib/rentalFilters";
import { getNewsRepository } from "@/lib/server/news/providers";
import { toPublicNewsArticles } from "@/lib/server/news/dto";
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
  const siteSettings = await (await getSiteSettingsRepository()).get();
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

  // 8, not 4: at the 4-up desktop breakpoint exactly four slides fill the
  // track, so the carousel had nothing to advance to and correctly hid its
  // own controls. Two pages' worth is what makes it move.
  const featuredProperties = properties.slice(0, 8);
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
  const featuredProjects = projects.slice(0, 8);

  // Side rails only render from 1700px up (see .v2-news-rail), but the read
  // is unconditional — this page is force-dynamic and already hits the CMS
  // for rentals and projects, so one more list costs a query, not a render
  // mode. Newest first, split across the two rails.
  const newsRepo = await getNewsRepository();
  const articles = toPublicNewsArticles(await newsRepo.list()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  const leftNews = articles.slice(0, 4);
  const rightNews = articles.slice(4, 8);
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
              className="animate-v2-hero-settle object-cover"
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
              className="animate-v2-hero-settle object-cover"
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
            {/* Above the fold, so this runs on load rather than on scroll —
                staggered in reading order. */}
            <h1
              className="animate-v2-rise-in text-[22px] font-extrabold leading-[1.15] text-[#0C0D0D]"
              style={{ animationDelay: "80ms" }}
            >
              Không gian sống &amp;
              <br />
              <span className="text-[#880206]">Kinh doanh lý tưởng</span>
            </h1>
            <p
              className="animate-v2-rise-in mt-1 text-[13px] font-bold text-[#0C0D0D]"
              style={{ animationDelay: "200ms" }}
            >
              NDTHICH LAND
            </p>
            <p
              className="animate-v2-rise-in mt-1 max-w-[260px] text-[13px] leading-snug text-[#5F5D5D]"
              style={{ animationDelay: "320ms" }}
            >
              Chuyên cho thuê nhà, căn hộ, mặt bằng kinh doanh và bán các dự án BĐS cao cấp của Sun Group,
              Vin Group.
            </p>
            <div className="animate-v2-rise-in mt-3 flex flex-wrap gap-2" style={{ animationDelay: "440ms" }}>
              <Link
                href="/cho-thue"
                className="group flex items-center gap-1 rounded-[10px] bg-[#880206] px-4 py-[10px] text-[13px] font-semibold text-white transition-[background-color,transform,box-shadow] duration-fast ease-base hover:-translate-y-[1px] hover:bg-[#750F0D] hover:shadow-[0_8px_18px_-8px_rgba(136,2,6,0.7)] active:translate-y-0 motion-reduce:transform-none"
              >
                Tìm thuê ngay{" "}
                <Icon
                  name="arrow-right"
                  size={14}
                  className="text-white transition-transform duration-fast ease-base group-hover:translate-x-[3px] motion-reduce:transform-none"
                />
              </Link>
              <Link
                href="/du-an"
                className="flex items-center gap-1 rounded-[10px] border border-[#880206] bg-white px-4 py-[10px] text-[13px] font-semibold text-[#880206] transition-[background-color,transform] duration-fast ease-base hover:-translate-y-[1px] hover:bg-[#F7F6F6] active:translate-y-0 motion-reduce:transform-none"
              >
                Xem dự án
              </Link>
            </div>
          </div>
        </div>

        <div className="v2-container absolute inset-0 hidden min-[900px]:flex min-[900px]:items-center">
          <div className="w-1/2 wide:w-full wide:max-w-[620px]">
            <h1
              className="animate-v2-rise-in text-[32px] font-extrabold leading-[1.15] text-[#0C0D0D] wide:text-v2-hero"
              style={{ animationDelay: "80ms" }}
            >
              Không gian sống &amp;
              <br />
              <span className="text-[#880206]">Kinh doanh lý tưởng</span>
            </h1>
            <p
              className="animate-v2-rise-in mt-3 text-[16px] font-bold text-[#0C0D0D] wide:text-[18px] wide:leading-[26px]"
              style={{ animationDelay: "200ms" }}
            >
              NDTHICH LAND
            </p>
            <p
              className="animate-v2-rise-in mt-3 max-w-md text-[14px] leading-snug text-[#5F5D5D] wide:max-w-[560px] wide:text-[17px] wide:leading-[28px]"
              style={{ animationDelay: "320ms" }}
            >
              Chuyên cho thuê nhà, căn hộ, mặt bằng kinh doanh và bán các dự án BĐS cao cấp của Sun Group,
              Vin Group.
            </p>
            <div className="animate-v2-rise-in mt-5 flex flex-wrap gap-3" style={{ animationDelay: "440ms" }}>
              <Link
                href="/cho-thue"
                className="group flex items-center gap-2 rounded-md bg-[#880206] px-5 py-[10px] text-[13px] font-semibold text-white transition-[background-color,transform,box-shadow] duration-fast ease-base hover:-translate-y-[1px] hover:bg-[#750F0D] hover:shadow-[0_10px_22px_-10px_rgba(136,2,6,0.75)] active:translate-y-0 motion-reduce:transform-none wide:h-[52px] wide:rounded-[10px] wide:px-6 wide:text-[15px]"
              >
                Tìm thuê ngay{" "}
                <Icon
                  name="arrow-right"
                  size={16}
                  className="text-white transition-transform duration-fast ease-base group-hover:translate-x-[3px] motion-reduce:transform-none"
                />
              </Link>
              <Link
                href="/du-an"
                className="flex items-center gap-2 rounded-md border border-[#880206] bg-white px-5 py-[10px] text-[13px] font-semibold text-[#880206] transition-[background-color,transform] duration-fast ease-base hover:-translate-y-[1px] hover:bg-[#F7F6F6] active:translate-y-0 motion-reduce:transform-none wide:h-[52px] wide:rounded-[10px] wide:px-6 wide:text-[15px]"
              >
                Xem dự án
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Everything below the hero, with the news rails living in this
          block's own side margins. They were `fixed` before, so they floated
          over the hero photograph — the rails belong beside the content, not
          on top of the opening image. Sticky inside a full-height column:
          they follow the reader down the page and stop at its end rather
          than hovering over the footer. */}
      <div className="relative">
        <NewsRail2 side="left" articles={leftNews} />
        <NewsRail2 side="right" articles={rightNews.length > 0 ? rightNews : leftNews} />

      {/* ============ TRUST METRICS ============ */}
      {/* No negative margin here — the hero photo is now full-bleed to the
          section's own bottom edge (inset-y-0), so any overlap would sit
          directly on top of the photo instead of the old gradient-only
          backdrop, cutting into the metrics card's own icons/text. */}
      <section className="v2-reveal v2-container pt-2 min-[900px]:pt-3 wide:pt-8" data-qa-region="trustmetrics">
        <TrustMetrics2 />
      </section>

      {/* ============ SEARCH ============ */}
      {/* Capped and centred on desktop. At full container width the bar
          stretched a single keyword field across ~1200px, which is far more
          room than the content needs and made the panel read as unfinished
          rather than generous. Mobile keeps the full width — there it is
          exactly as wide as the screen and has nowhere else to go. */}
      <section className="v2-reveal v2-container pt-2 min-[900px]:pt-3 wide:pt-8" data-qa-region="search">
        <div className="min-[900px]:mx-auto min-[900px]:max-w-[860px] wide:max-w-[980px]">
          <HomeSearchBar2 locationOptions={locationOptions} propertyTypeOptions={propertyTypeOptions} />
        </div>
      </section>

      {/* ============ FEATURED PROJECTS ============ */}
      {/* Business priority: this site exists to sell projects, so "Dự án
          nổi bật" now leads, ahead of the rentals grid. */}
      <section className="v2-reveal v2-container pb-2 pt-4 min-[900px]:py-6 wide:py-16" data-qa-region="featured-projects">
        <div className="flex items-end justify-between">
          <h2 className="text-[16px] font-extrabold text-[#0C0D0D] min-[900px]:text-[17px] wide:text-v2-h2">Dự án nổi bật</h2>
          <Link
            href="/du-an"
            className="group flex items-center gap-1 text-[11px] font-semibold text-[#880206] transition-colors duration-fast ease-base hover:text-[#750F0D] min-[900px]:text-[12px] wide:text-v2-viewall"
          >
            Xem tất cả dự án <Icon
              name="arrow-right"
              size={10}
              className="transition-transform duration-fast ease-base group-hover:translate-x-[3px] motion-reduce:transform-none min-[900px]:!h-[12px] min-[900px]:!w-[12px]"
            />
          </Link>
        </div>
        {/* Auto-advancing instead of a static grid: the page previously had
            no moving content at all, which is what made it read as frozen.
            The fractional mobile width leaves the next card peeking, so it
            is obvious there is more to swipe to. */}
        <Carousel2
          ariaLabel="Dự án nổi bật"
          className="mt-3 min-[900px]:mt-3 wide:mt-6"
          slideClassName="w-[62%] min-[600px]:w-[42%] min-[900px]:w-[calc((100%-3*1rem)/4)] wide:w-[calc((100%-3*1.5rem)/4)]"
        >
          {featuredProjects.map((p) => (
            <ProjectCardOverlay2
              key={p.slug}
              slug={p.slug}
              name={p.name}
              location={p.location}
              image={p.cardMedia}
              compact
              // Portrait, not the old short landscape crop: next to the
              // rental cards below — which carry a photo plus four lines of
              // text — a 199:144 project card read as half a card. A taller
              // frame also gives the building itself somewhere to go.
              mobileAspect="4/5"
              desktopAspect="4/5"
              wideAspect="4/5"
            />
          ))}
        </Carousel2>
      </section>

      {/* ============ FEATURED RENTALS ============ */}
      <section className="v2-reveal v2-container pb-3 min-[900px]:pb-6 wide:pb-16" data-qa-region="featured-rentals">
        <div className="flex items-end justify-between">
          <h2 className="text-[15px] font-extrabold text-[#0C0D0D] min-[900px]:text-[17px] wide:text-v2-h2">
            Bất động sản cho thuê nổi bật
          </h2>
          <Link
            href="/cho-thue"
            className="group flex items-center gap-1 text-[11px] font-semibold text-[#880206] transition-colors duration-fast ease-base hover:text-[#750F0D] min-[900px]:text-[12px] wide:text-v2-viewall"
          >
            Xem tất cả <Icon
              name="arrow-right"
              size={10}
              className="transition-transform duration-fast ease-base group-hover:translate-x-[3px] motion-reduce:transform-none min-[900px]:!h-[12px] min-[900px]:!w-[12px]"
            />
          </Link>
        </div>
        <Carousel2
          ariaLabel="Bất động sản cho thuê nổi bật"
          autoPlayMs={5200}
          className="mt-4 min-[900px]:mt-5 wide:mt-6"
          slideClassName="w-[62%] min-[600px]:w-[42%] min-[900px]:w-[calc((100%-3*1rem)/4)] wide:w-[calc((100%-3*1.5rem)/4)]"
        >
          {featuredProperties.map((p, i) => (
            <PropertyCardGrid2
              key={p.slug}
              listing={p}
              mobileAspect="3/2"
              imageOverride={
                p.media.length > 0 ? undefined : HOME_RENTAL_FALLBACK_IMAGES[i % HOME_RENTAL_FALLBACK_IMAGES.length]
              }
              wideAspect="16/10"
            />
          ))}
        </Carousel2>
      </section>

      {/* ============ ABOUT ============ */}
      {/* MOBILE_PROJECT_FIRST_POLISH section 5: the old side-by-side 50/50
          split couldn't fit readable text (was down to 6-10px). Stacked
          image-on-top/text-below on mobile instead — readability over
          matching the old master's side-by-side mobile composition, which
          this task explicitly authorizes. 900px+ keeps the original
          side-by-side layout unchanged. */}
      <section className="v2-reveal v2-container pb-3 min-[900px]:pb-6 wide:pb-16" data-qa-region="about">
        <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-2 min-[900px]:items-center min-[900px]:gap-8 wide:gap-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg min-[900px]:aspect-auto min-[900px]:h-[280px] wide:h-[360px] wide:rounded-[16px]">
            <Image
              src="/assets/round8/R8_11-sanh-sang-trong-hien-dai.png"
              alt="Sảnh đón NDTHICH"
              fill
              className="v2-parallax object-cover"
              unoptimized
            />
          </div>
          <div>
            <h2 className="text-[18px] font-extrabold text-[#0C0D0D] min-[900px]:text-[22px] wide:text-v2-h2">
              Về <span className="text-[#880206]">NDTHICH LAND</span>
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-[#5F5D5D] min-[900px]:mt-3 min-[900px]:text-[14px] min-[900px]:leading-relaxed wide:mt-3 wide:text-v2-body">
              Với nhiều năm kinh nghiệm trong lĩnh vực bất động sản, chúng tôi cam kết mang đến những sản
              phẩm chất lượng, pháp lý minh bạch và dịch vụ tận tâm.
            </p>
            {/* 2 columns between 900-1439px, 4 only at >=1440: at the larger type
                size a quarter of this column is not wide enough for "Pháp lý minh
                bạch", which truncated to "Pháp lý minh b…". */}
            <div className="mt-3 grid grid-cols-2 gap-3 min-[900px]:mt-5 min-[900px]:grid-cols-2 min-[900px]:gap-x-6 min-[900px]:gap-y-3 wide:grid-cols-4 wide:mt-5 wide:gap-4">
              {ABOUT_FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-2 min-[900px]:gap-1 wide:gap-2">
                  <Icon
                    name={f.icon}
                    size={14}
                    className="mt-[2px] shrink-0 text-[#C08E47] min-[900px]:!h-4 min-[900px]:!w-4 wide:!h-4 wide:!w-4"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-[#0C0D0D] min-[900px]:text-[13px] wide:text-[13px] wide:leading-[18px]">
                      {f.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/gioi-thieu"
              className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-[#880206] px-4 py-[10px] text-[13px] font-semibold text-white hover:bg-[#750F0D] min-[900px]:mt-6 min-[900px]:gap-2 min-[900px]:rounded-[10px] min-[900px]:px-5 min-[900px]:py-[11px] min-[900px]:text-[13px] wide:mt-6 wide:h-[52px] wide:rounded-[10px] wide:px-6 wide:text-[15px]"
            >
              Tìm hiểu thêm về chúng tôi
              <Icon name="arrow-right" size={14} className="text-white" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ HỒ SƠ NĂNG LỰC ============ */}
      {/* Only when an admin has uploaded one (Cài đặt liên hệ -> Hồ sơ năng
          lực). A capability profile is a claim about the company, so an empty
          slot shows nothing rather than a stand-in booklet. */}
      {siteSettings.profilePdfUrl && (
        <section className="v2-reveal v2-container pb-3 min-[900px]:pb-6 wide:pb-16" data-qa-region="profile">
          <ProfileFlipbook2
            pdfUrl={siteSettings.profilePdfUrl}
            title="Hồ sơ năng lực"
            description="Để Quý khách hàng và Quý đối tác hiểu rõ hơn về công ty, NDTHICH LAND gửi toàn bộ thông tin trong cuốn hồ sơ năng lực này — từ dịch vụ, quy trình đến các giá trị cốt lõi chúng tôi theo đuổi."
          />
        </section>
      )}

      {/* ============ TUYỂN DỤNG ============ */}
      {/* Deliberately says nothing about how many roles are open, what they
          pay or where they are — the CMS holds no vacancies, so the bar sends
          people to the contact channels that exist rather than describing a
          hiring pipeline that does not. */}
      <section className="v2-reveal v2-container pb-3 min-[900px]:pb-6 wide:pb-16" data-qa-region="recruitment">
        <div className="flex flex-col gap-3 rounded-lg border border-[#EDEBEA] bg-[#F7F6F6] p-4 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between min-[900px]:gap-6 min-[900px]:p-6 wide:rounded-[16px] wide:p-8">
          <div className="flex items-start gap-3 min-[900px]:items-center">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#880206] min-[900px]:h-10 min-[900px]:w-10">
              <Icon name="person" size={17} className="text-white" />
            </span>
            <div>
              <h2 className="text-[13px] font-bold text-[#0C0D0D] min-[900px]:text-[16px] wide:text-[18px]">
                Tuyển dụng — gia nhập NDTHICH LAND
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-[#5F5D5D] min-[900px]:text-[13px] wide:text-[14px]">
                Chúng tôi luôn tìm thêm chuyên viên kinh doanh và cộng tác viên. Gửi hồ sơ hoặc gọi hotline để
                được trao đổi trực tiếp.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 min-[900px]:gap-3">
            <a
              href={`mailto:${siteSettings.email}?subject=${encodeURIComponent("Ứng tuyển - NDTHICH LAND")}`}
              className="btn-primary-gradient inline-flex items-center gap-2 rounded-md px-5 py-3 text-[12px] font-semibold text-white transition-transform duration-fast ease-base active:scale-[0.97] motion-reduce:active:scale-100 wide:text-[14px]"
            >
              Gửi hồ sơ ứng tuyển <Icon name="arrow-right" size={13} className="text-white" />
            </a>
            <a
              href={`tel:${telHref(siteSettings.phonePrimary)}`}
              className="inline-flex items-center gap-2 rounded-md border border-[#880206] px-5 py-3 text-[12px] font-semibold text-[#880206] transition-colors duration-fast ease-base hover:bg-[#FBEFE3] wide:text-[14px]"
            >
              <Icon name="phone" size={13} /> {siteSettings.phonePrimary}
            </a>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      {/* Master keeps 3 compact cards in one row at every width. */}
      <section className="v2-reveal v2-container pb-3 min-[900px]:pb-6 wide:pb-16" data-qa-region="testimonials">
        <div className="flex items-end justify-between">
          <h2 className="text-[18px] font-extrabold text-[#0C0D0D] min-[900px]:text-[22px] wide:text-v2-h2">
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
        <Carousel2
          ariaLabel="Khách hàng nói về chúng tôi"
          autoPlayMs={6000}
          gapClassName="gap-3 min-[900px]:gap-4 wide:gap-6"
          className="mt-4 min-[900px]:mt-5 wide:mt-6"
          slideClassName="w-[86%] min-[600px]:w-[60%] min-[900px]:w-[calc((100%-2*1rem)/3)] wide:w-[calc((100%-2*1.5rem)/3)]"
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              // The 900-1439px tier used to run at p-1 with 9-10px text — a
              // quote card too small to read, on the widest tier most
              // visitors are on. It now sits between the mobile and >=1440px
              // sizes instead of below both.
              className="flex h-full flex-col rounded-lg border border-[#EDEBEA] bg-white p-4 transition-[border-color,box-shadow,transform] duration-base ease-base hover:-translate-y-1 hover:border-[#E0D6D6] hover:shadow-v2-premium motion-reduce:transform-none min-[900px]:p-5 wide:rounded-[14px] wide:p-6 wide:shadow-v2-premium"
            >
              <Icon name="quote" size={18} className="text-[#C08E47] min-[900px]:!h-5 min-[900px]:!w-5 wide:!h-[22px] wide:!w-[22px]" />
              <p className="mt-2 line-clamp-3 flex-1 text-[13px] leading-relaxed text-[#3A3838] min-[900px]:mt-3 min-[900px]:text-[14px] wide:mt-3 wide:text-[15px] wide:leading-[23px]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-3 flex gap-1 text-[#C08E47] min-[900px]:mt-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon key={i} name="star" size={13} className="min-[900px]:!h-[14px] min-[900px]:!w-[14px]" />
                ))}
              </div>
              <p className="mt-3 truncate text-[14px] font-bold text-[#0C0D0D] min-[900px]:mt-3 min-[900px]:text-[15px] wide:text-[16px]">
                {t.name}
              </p>
              <p className="mt-[2px] truncate text-[12px] text-[#5F5D5D] min-[900px]:text-[13px] wide:text-[13px]">{t.role}</p>
            </div>
          ))}
        </Carousel2>
      </section>

      {/* ============ CONTACT + MAP ============ */}
      <ContactMap2 settings={siteSettings} />
      </div>
    </>
  );
}
