// No "server-only" guard — see lib/server/env.ts for why.
import { readSheetRange, appendSheetRow, updateSheetRange } from "@/lib/server/google/sheets";
import { requireGoogleSpreadsheetEnv } from "@/lib/server/env";
import { CMS_TABS } from "@/lib/server/cmsSheetSchema";
import type { NewsArticle } from "@/lib/types";

export interface NewsRecord extends NewsArticle {
  id: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsRepository {
  list(): Promise<NewsRecord[]>;
  upsert(record: NewsRecord): Promise<void>;
  softDelete(id: string): Promise<void>;
}

function safeJsonSections(json: string | undefined): NewsArticle["sections"] {
  if (!json) return [];
  try {
    const value = JSON.parse(json);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (s): s is { heading: string; body: string } =>
        s && typeof s.heading === "string" && typeof s.body === "string",
    );
  } catch {
    return [];
  }
}

function rowToRecord(row: string[]): NewsRecord | null {
  const [id, slug, title, category, , publishedAt, readMinutes, excerpt, cover, sectionsJson, published, createdAt, updatedAt] = row;
  if (!id) return null;
  return {
    id,
    slug: slug ?? "",
    title: title ?? "",
    category: category ?? "",
    publishedAt: publishedAt ?? "",
    readMinutes: readMinutes ? Number(readMinutes) : 0,
    excerpt: excerpt ?? "",
    cover: cover ?? "",
    sections: safeJsonSections(sectionsJson),
    published: published === "true",
    createdAt: createdAt ?? "",
    updatedAt: updatedAt ?? "",
  };
}

function recordToRow(r: NewsRecord): (string | number)[] {
  return [
    r.id,
    r.slug,
    r.title,
    r.category,
    r.published ? "published" : "draft",
    r.publishedAt,
    r.readMinutes,
    r.excerpt,
    r.cover,
    JSON.stringify(r.sections),
    String(r.published),
    r.createdAt,
    r.updatedAt,
  ];
}

export class GoogleNewsRepository implements NewsRepository {
  async list(): Promise<NewsRecord[]> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const values = await readSheetRange(cmsSpreadsheetId, `${CMS_TABS.news}!A2:M`);
    return values.map(rowToRecord).filter((r): r is NewsRecord => r !== null);
  }

  async upsert(record: NewsRecord): Promise<void> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const values = await readSheetRange(cmsSpreadsheetId, `${CMS_TABS.news}!A2:M`);
    const rowIndex = values.findIndex((row) => row[0] === record.id);
    const row = recordToRow(record);
    if (rowIndex >= 0) {
      await updateSheetRange(cmsSpreadsheetId, `${CMS_TABS.news}!A${rowIndex + 2}:M${rowIndex + 2}`, row);
    } else {
      await appendSheetRow(cmsSpreadsheetId, CMS_TABS.news, row);
    }
  }

  async softDelete(id: string): Promise<void> {
    const records = await this.list();
    const existing = records.find((r) => r.id === id);
    if (!existing) return;
    await this.upsert({ ...existing, published: false, updatedAt: new Date().toISOString() });
  }
}

export class InMemoryNewsRepository implements NewsRepository {
  private readonly records = new Map<string, NewsRecord>();

  async list(): Promise<NewsRecord[]> {
    return [...this.records.values()];
  }

  async upsert(record: NewsRecord): Promise<void> {
    this.records.set(record.id, record);
  }

  async softDelete(id: string): Promise<void> {
    const existing = this.records.get(id);
    if (existing) this.records.set(id, { ...existing, published: false, updatedAt: new Date().toISOString() });
  }
}
