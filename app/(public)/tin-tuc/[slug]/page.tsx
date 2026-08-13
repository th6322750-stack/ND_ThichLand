import { notFound } from "next/navigation";
import Image from "next/image";
import { Breadcrumb } from "@/components/public/Breadcrumb";
import { NewsCard } from "@/components/public/NewsCard";
import { Icon } from "@/components/icons";
import { getNewsBySlug, news } from "@/lib/data/news";

export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default async function TinTucDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getNewsBySlug(slug);
  if (!article) notFound();

  const related = news.filter((n) => n.slug !== article.slug).slice(0, 3);

  return (
    <div className="container-page py-8">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Tin tức", href: "/tin-tuc" },
          { label: article.category },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-10 desktop:grid-cols-[1fr_280px]">
        <article>
          <span className="text-label text-primary">{article.category.toUpperCase()}</span>
          <h1 className="mt-3 text-h1-mobile text-ink desktop:text-h1">{article.title}</h1>
          <p className="mt-3 text-body text-muted">
            {formatDate(article.publishedAt)} • {article.readMinutes} phút đọc
          </p>

          <div className="relative mt-6 aspect-video overflow-hidden rounded-md">
            <Image src={article.cover} alt="" fill className="object-cover" unoptimized />
            <span className="absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 text-label text-surface">
              Ảnh bài viết 16:9
            </span>
          </div>

          {article.sections.map((section) => (
            <section key={section.heading} className="mt-10">
              <h2 className="text-h2-mobile text-ink desktop:text-h2">{section.heading}</h2>
              <p className="mt-3 text-body-lg-mobile text-body desktop:text-body-lg">{section.body}</p>
              <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-md">
                <Image src={article.cover} alt="" fill className="object-cover" unoptimized />
                <span className="absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 text-label text-surface">
                  Ảnh minh họa
                </span>
              </div>
            </section>
          ))}
        </article>

        <aside className="desktop:sticky desktop:top-24 desktop:h-fit">
          <div className="rounded-md border border-line bg-surface p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <h2 className="text-h3 text-ink">Liên hệ NDTHICH</h2>
            <p className="mt-1 text-body text-muted">Tư vấn nguồn đang trống</p>
            <a
              href="tel:0986602203"
              className="mt-4 flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
            >
              <Icon name="phone" size={16} className="invert" /> Gọi ngay
            </a>
            <a
              href="tel:0986602203"
              className="mt-3 flex items-center justify-center gap-2 rounded-md border border-primary px-6 py-3 text-button uppercase text-primary hover:bg-soft"
            >
              <Icon name="chat" size={16} /> Zalo
            </a>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <span className="text-label text-primary">ĐỌC THÊM</span>
          <h2 className="mt-2 text-h2-mobile text-ink desktop:text-h2">Bài viết liên quan</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 tablet:grid-cols-3">
            {related.map((n) => (
              <NewsCard key={n.slug} article={n} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
