import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumb } from "@/components/public/Breadcrumb";
import { NewsCard } from "@/components/public/NewsCard";
import { Icon } from "@/components/icons";
import { getNewsRepository } from "@/lib/server/news/providers";
import { toPublicNewsArticle, toPublicNewsArticles } from "@/lib/server/news/dto";
import { mediaSrc, NEWS_PLACEHOLDER } from "@/lib/media";
import { getZaloHref } from "@/lib/zalo";

export const dynamic = "force-dynamic";

// Shared by generateMetadata and the page body — one CMS read per request.
const loadArticles = cache(async () => {
  const repo = await getNewsRepository();
  return repo.list();
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const record = (await loadArticles()).find((r) => r.slug === slug && r.published);
  if (!record) return { title: "Không tìm thấy bài viết | NDTHICH LAND" };
  return {
    title: `${record.title} | Tin tức NDTHICH LAND`,
    description: record.excerpt || undefined,
    alternates: { canonical: `/tin-tuc/${record.slug}` },
    openGraph: {
      type: "article",
      title: record.title,
      description: record.excerpt || undefined,
      publishedTime: record.publishedAt || undefined,
      images: record.cover ? [record.cover] : undefined,
    },
  };
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "—";
  return `${d}.${m}.${y}`;
}

export default async function TinTucDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const records = await loadArticles();
  const record = records.find((r) => r.slug === slug && r.published);
  if (!record) notFound();

  const article = toPublicNewsArticle(record);
  const related = toPublicNewsArticles(records)
    .filter((n) => n.slug !== article.slug)
    .slice(0, 3);

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

          {/* The "Ảnh bài viết 16:9" / "Ảnh minh họa" chips were layout-mock
              scaffolding that shipped into production, and every section
              repeated the SAME cover photo below it labelled as an
              illustration — one article's single photo shown three or four
              times as if it illustrated each section. Cover renders once,
              unlabelled; sections are text, which is all the CMS stores. */}
          <div className="relative mt-6 aspect-video overflow-hidden rounded-md">
            <Image
              src={mediaSrc(article.cover, NEWS_PLACEHOLDER)}
              alt={article.title}
              fill
              className="object-cover"
              unoptimized
              loading="eager"
            />
          </div>

          {article.sections.map((section, i) => (
            <section key={`${section.heading}-${i}`} className="mt-10">
              {section.heading && <h2 className="text-h2-mobile text-ink desktop:text-h2">{section.heading}</h2>}
              <p className="mt-3 whitespace-pre-line text-body-lg-mobile text-body desktop:text-body-lg">
                {section.body}
              </p>
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
              href={getZaloHref()}
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
