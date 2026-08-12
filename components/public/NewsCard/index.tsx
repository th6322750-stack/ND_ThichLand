import Image from "next/image";
import Link from "next/link";
import type { NewsArticle } from "@/lib/types";

interface NewsCardProps {
  article: NewsArticle;
  state?: "default" | "hover" | "loading";
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export function NewsCard({ article, state = "default" }: NewsCardProps) {
  if (state === "loading") {
    return (
      <div className="animate-pulse overflow-hidden rounded-md border border-line bg-surface">
        <div className="aspect-[4/3] bg-soft" />
        <div className="space-y-2 p-4">
          <div className="h-4 w-3/4 rounded bg-soft" />
          <div className="h-3 w-1/2 rounded bg-soft" />
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/tin-tuc/${article.slug}`}
      className="block overflow-hidden rounded-md border border-line bg-surface transition-colors duration-fast hover:border-primary"
    >
      <div className="relative aspect-[4/3]">
        <Image src={article.cover} alt={article.title} fill className="object-cover" unoptimized />
        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 text-label text-surface">
          Tin tức
        </span>
      </div>
      <div className="p-4">
        <span className="text-label text-primary">{article.category.toUpperCase()}</span>
        <h3 className="mt-2 line-clamp-2 text-h3 text-ink">{article.title}</h3>
        <p className="mt-3 text-body text-muted">
          {formatDate(article.publishedAt)} • {article.readMinutes} phút đọc
        </p>
      </div>
    </Link>
  );
}
