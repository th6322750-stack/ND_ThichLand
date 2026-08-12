import Link from "next/link";
import { Button } from "@/components/public/Button";
import { SearchPanel } from "@/components/public/SearchPanel";
import { PropertyCard } from "@/components/public/PropertyCard";
import { ProjectCard } from "@/components/public/ProjectCard";
import { NewsCard } from "@/components/public/NewsCard";
import { ContactCTA } from "@/components/public/ContactCTA";
import { Icon } from "@/components/icons";
import { properties } from "@/lib/data/properties";
import { projects } from "@/lib/data/projects";
import { news } from "@/lib/data/news";

const HERO_STATS = [
  { value: "500+", label: "lượt tư vấn" },
  { value: "Nhiều loại hình", label: "căn hộ • nhà • mặt bằng • xưởng" },
  { value: "2 hotline", label: "hỗ trợ trực tiếp" },
];

export default function HomePage() {
  const featuredProperties = properties.slice(0, 4);
  const featuredProjects = projects.slice(0, 3);
  const featuredNews = news.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-surface via-[#FBF7F5] to-[#F2E5E6]">
        <div className="container-page grid grid-cols-1 gap-10 py-16 desktop:grid-cols-2 desktop:items-center">
          <div>
            <span className="text-label text-primary">BẤT ĐỘNG SẢN CHO THUÊ • DỰ ÁN</span>
            <h1 className="mt-4 text-h1-mobile text-ink desktop:text-h1">
              Không gian phù hợp
              <br />
              cho sống &amp; kinh doanh
            </h1>
            <p className="mt-4 text-body-lg-mobile text-body desktop:text-body-lg">
              Danh sách BĐS thực tế, giá và diện tích rõ ràng. Tìm nhanh theo nhu cầu, liên hệ trực
              tiếp NDTHICH.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/cho-thue">
                <Icon name="search" size={16} className="invert" /> Tìm cho thuê
              </Button>
              <Button href="/du-an" variant="secondary">
                Xem dự án
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="flex aspect-[4/3] items-end justify-center rounded-md bg-gradient-to-br from-[#D3D8DD] via-[#B5BEC5] to-[#89949C] p-4">
              <span className="text-label text-surface/80">Hero asset • media treatment</span>
            </div>
            <div className="mt-[-32px] grid grid-cols-3 gap-3 rounded-md bg-surface p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] desktop:mx-6">
              {HERO_STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-h3 text-ink">{stat.value}</p>
                  <p className="text-body text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search panel overlapping hero */}
      <section className="container-page -mt-8 desktop:-mt-10">
        <SearchPanel />
      </section>

      {/* Featured properties */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-label text-primary">CHO THUÊ</span>
            <h2 className="mt-2 text-h2-mobile text-ink desktop:text-h2">Bất động sản mới nhất</h2>
            <p className="mt-1 text-body text-muted">Thông tin công khai, dễ so sánh</p>
          </div>
          <Link href="/cho-thue" className="text-label text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-4">
          {featuredProperties.map((listing) => (
            <PropertyCard key={listing.slug} listing={listing} />
          ))}
        </div>
      </section>

      {/* Featured projects */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-label text-primary">DỰ ÁN</span>
            <h2 className="mt-2 text-h2-mobile text-ink desktop:text-h2">Dự án tiêu biểu</h2>
            <p className="mt-1 text-body text-muted">Những dự án công ty đã và đang tham gia</p>
          </div>
          <Link href="/du-an" className="text-label text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      {/* About preview */}
      <section className="container-page py-16">
        <div className="grid grid-cols-1 gap-8 rounded-md bg-soft p-8 desktop:grid-cols-2 desktop:items-center">
          <div className="flex aspect-[4/3] items-end rounded-md bg-gradient-to-br from-[#C9D6CC] via-[#9CB09E] to-[#6E8570] p-4">
            <span className="text-label text-surface/80">Thương hiệu / văn phòng</span>
          </div>
          <div>
            <span className="text-label text-primary">VỀ NDTHICH</span>
            <h2 className="mt-2 text-h2-mobile text-ink desktop:text-h2">
              Uy tín trong đầu tư, rõ ràng trong vận hành
            </h2>
            <p className="mt-4 text-body text-body">
              Website tập trung hai nhiệm vụ: giúp khách tìm BĐS cho thuê nhanh và giới thiệu năng
              lực dự án của công ty một cách chuyên nghiệp.
            </p>
            <div className="mt-6">
              <Button href="/gioi-thieu" variant="secondary">
                Giới thiệu công ty
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* News preview */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-label text-primary">NỘI DUNG</span>
            <h2 className="mt-2 text-h2-mobile text-ink desktop:text-h2">Tin tức &amp; kinh nghiệm</h2>
            <p className="mt-1 text-body text-muted">Thông tin dễ đọc, ưu tiên giá trị thực tế</p>
          </div>
          <Link href="/tin-tuc" className="text-label text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
          {featuredNews.map((article) => (
            <NewsCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
