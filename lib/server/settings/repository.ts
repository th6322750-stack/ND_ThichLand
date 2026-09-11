// No "server-only" guard — see lib/server/env.ts for why.
import { readSheetRange, appendSheetRow, updateSheetRange } from "@/lib/server/google/sheets";
import { requireGoogleSpreadsheetEnv } from "@/lib/server/env";
import { CMS_TABS } from "@/lib/server/cmsSheetSchema";
import { DEFAULT_SITE_SETTINGS } from "@/lib/data/siteSettings";
import type { SiteSettings } from "@/lib/types";

export interface SiteSettingsRepository {
  /** Never returns null — an unsaved record falls back to DEFAULT_SITE_SETTINGS. */
  get(): Promise<SiteSettings>;
  save(settings: SiteSettings): Promise<void>;
}

/**
 * A missing cell falls back to the shipped default rather than an empty
 * string, so a partially-filled sheet row cannot blank out the address or
 * the hotline on the live site.
 */
function rowToSettings(row: string[] | undefined): SiteSettings {
  if (!row || row.length === 0) return DEFAULT_SITE_SETTINGS;
  const [address, mapQuery, phonePrimary, phoneSecondary, email, hoursWeekday, hoursWeekend, , profilePdfUrl] = row;
  return {
    address: address?.trim() || DEFAULT_SITE_SETTINGS.address,
    // Optional fields keep "" when deliberately cleared — only the required
    // ones fall back, otherwise an operator could never remove a second phone.
    mapQuery: mapQuery ?? "",
    phonePrimary: phonePrimary?.trim() || DEFAULT_SITE_SETTINGS.phonePrimary,
    phoneSecondary: phoneSecondary ?? "",
    email: email?.trim() || DEFAULT_SITE_SETTINGS.email,
    hoursWeekday: hoursWeekday?.trim() || DEFAULT_SITE_SETTINGS.hoursWeekday,
    hoursWeekend: hoursWeekend ?? "",
    profilePdfUrl: profilePdfUrl ?? "",
  };
}

function settingsToRow(s: SiteSettings): string[] {
  return [
    s.address,
    s.mapQuery,
    s.phonePrimary,
    s.phoneSecondary,
    s.email,
    s.hoursWeekday,
    s.hoursWeekend,
    new Date().toISOString(),
    s.profilePdfUrl,
  ];
}

const RANGE = `${CMS_TABS.settings}!A2:I2`;

export class GoogleSiteSettingsRepository implements SiteSettingsRepository {
  async get(): Promise<SiteSettings> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const values = await readSheetRange(cmsSpreadsheetId, RANGE);
    return rowToSettings(values[0]);
  }

  async save(settings: SiteSettings): Promise<void> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const values = await readSheetRange(cmsSpreadsheetId, RANGE);
    const row = settingsToRow(settings);
    // Single-row tab: update row 2 in place when it exists, otherwise create it.
    if (values.length > 0) {
      await updateSheetRange(cmsSpreadsheetId, RANGE, row);
    } else {
      await appendSheetRow(cmsSpreadsheetId, CMS_TABS.settings, row);
    }
  }
}

export class InMemorySiteSettingsRepository implements SiteSettingsRepository {
  private current: SiteSettings = DEFAULT_SITE_SETTINGS;

  async get(): Promise<SiteSettings> {
    return this.current;
  }

  async save(settings: SiteSettings): Promise<void> {
    this.current = settings;
  }
}
