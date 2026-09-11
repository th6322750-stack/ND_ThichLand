import { appendSheetRow, readSheetRange, updateSheetRange } from "@/lib/server/google/sheets";
import { requireGoogleSpreadsheetEnv } from "@/lib/server/env";
import { CMS_TABS } from "@/lib/server/cmsSheetSchema";
import {
  normalizeAboutPageContent,
  normalizeContactPageContent,
} from "@/lib/data/pageContent";
import type { AboutPageContent, ContactPageContent } from "@/lib/types";

export interface PageContentMap {
  about: AboutPageContent;
  contact: ContactPageContent;
}

export type PageContentKey = keyof PageContentMap;

export interface PageContentRepository {
  get<K extends PageContentKey>(key: K): Promise<PageContentMap[K]>;
  save<K extends PageContentKey>(key: K, content: PageContentMap[K]): Promise<void>;
}

function normalize<K extends PageContentKey>(key: K, value: unknown): PageContentMap[K] {
  return (key === "about" ? normalizeAboutPageContent(value) : normalizeContactPageContent(value)) as PageContentMap[K];
}

function parse<K extends PageContentKey>(key: K, raw: string | undefined): PageContentMap[K] {
  if (!raw) return normalize(key, {});
  try {
    return normalize(key, JSON.parse(raw));
  } catch {
    return normalize(key, {});
  }
}

const RANGE = `${CMS_TABS.pageContent}!A2:C`;

export class GooglePageContentRepository implements PageContentRepository {
  async get<K extends PageContentKey>(key: K): Promise<PageContentMap[K]> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const rows = await readSheetRange(cmsSpreadsheetId, RANGE);
    return parse(key, rows.find((row) => row[0] === key)?.[1]);
  }

  async save<K extends PageContentKey>(key: K, content: PageContentMap[K]): Promise<void> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const rows = await readSheetRange(cmsSpreadsheetId, RANGE);
    const index = rows.findIndex((row) => row[0] === key);
    const row = [key, JSON.stringify(normalize(key, content)), new Date().toISOString()];
    if (index >= 0) {
      const rowNumber = index + 2;
      await updateSheetRange(cmsSpreadsheetId, `${CMS_TABS.pageContent}!A${rowNumber}:C${rowNumber}`, row);
    } else {
      await appendSheetRow(cmsSpreadsheetId, CMS_TABS.pageContent, row);
    }
  }
}

export class InMemoryPageContentRepository implements PageContentRepository {
  private readonly content: PageContentMap = {
    about: normalizeAboutPageContent({}),
    contact: normalizeContactPageContent({}),
  };

  async get<K extends PageContentKey>(key: K): Promise<PageContentMap[K]> {
    return normalize(key, this.content[key]);
  }

  async save<K extends PageContentKey>(key: K, content: PageContentMap[K]): Promise<void> {
    if (key === "about") this.content.about = normalizeAboutPageContent(content);
    else this.content.contact = normalizeContactPageContent(content);
  }
}
