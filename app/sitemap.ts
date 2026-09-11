import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";
import { getRentalProviders } from "@/lib/server/rental/providers";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { toPublicPropertyListings } from "@/lib/server/rental/dto";
import { getProjectRepository } from "@/lib/server/projects/providers";
import { toPublicProjectListings } from "@/lib/server/projects/dto";
import { getNewsRepository } from "@/lib/server/news/providers";
import { absoluteUrl } from "@/lib/seo";

// Detail URLs come from the same published-only DTOs the public pages use,
// so an unpublished/hidden record can never be advertised here.
export const dynamic = "force-dynamic";

const STATIC_ROUTES = ["", "/cho-thue", "/du-an", "/tin-tuc", "/gioi-thieu", "/lien-he"];

/** A provider failure must not take the whole sitemap down — the static
    routes are still valid and worth serving. */
async function safe<T>(load: () => Promise<T[]>): Promise<T[]> {
  try {
    return await load();
  } catch {
    return [];
  }
}

function validDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await safe(async () => {
    const { source, overlay } = await getRentalProviders();
    const merged = await buildMergedRentalData(source, overlay);
    return toPublicPropertyListings(merged.admin);
  });

  const projects = await safe(async () => {
    const repo = await getProjectRepository();
    const records = await repo.list();
    const publicProjects = toPublicProjectListings(records);
    return publicProjects.map((project) => ({
      project,
      updatedAt: records.find((record) => record.slug === project.slug)?.updatedAt,
    }));
  });

  const articles = await safe(async () => {
    const repo = await getNewsRepository();
    return (await repo.list()).filter((r) => r.published);
  });

  return [
    ...STATIC_ROUTES.map((path) => ({
      url: `${SITE_URL}${path || "/"}`,
      changeFrequency: "daily" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...properties.map((p) => ({
      url: `${SITE_URL}/cho-thue/${p.slug}`,
      ...(validDate(p.postedAt) ? { lastModified: validDate(p.postedAt) } : {}),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.media.map(absoluteUrl),
    })),
    ...projects.map(({ project, updatedAt }) => ({
      url: `${SITE_URL}/du-an/${project.slug}`,
      ...(validDate(updatedAt) ? { lastModified: validDate(updatedAt) } : {}),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: project.media.map(absoluteUrl),
    })),
    ...articles.map((a) => ({
      url: `${SITE_URL}/tin-tuc/${a.slug}`,
      ...(validDate(a.updatedAt || a.publishedAt) ? { lastModified: validDate(a.updatedAt || a.publishedAt) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.5,
      images: a.cover ? [absoluteUrl(a.cover)] : [],
    })),
  ];
}
