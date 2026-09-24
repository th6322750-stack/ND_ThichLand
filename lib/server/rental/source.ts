// No "server-only" guard — see lib/server/env.ts for why.
import { readSheetRange } from "@/lib/server/google/sheets";
import { requireGoogleSpreadsheetEnv } from "@/lib/server/env";
import type { RawRentalRow } from "./types";

export const RENTAL_SHEET_NAME = "Phòng trống chính ";
const DATA_START_ROW = 3; // canonical header row is 2 (contract: canonicalHeaderRow: 2)

export interface RentalSourceProvider {
  listRawRows(): Promise<RawRentalRow[]>;
}

/** Read-only by construction: this class has no method that could write to the sheet. */
export class GoogleRentalSource implements RentalSourceProvider {
  async listRawRows(): Promise<RawRentalRow[]> {
    const { rentalSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const values = await readSheetRange(rentalSpreadsheetId, `'${RENTAL_SHEET_NAME}'!A${DATA_START_ROW}:P`);
    return values.map((cells, i) => ({ sourceRow: DATA_START_ROW + i, cells }));
  }
}

export class InMemoryRentalSource implements RentalSourceProvider {
  constructor(private readonly rows: RawRentalRow[]) {}
  async listRawRows(): Promise<RawRentalRow[]> {
    return this.rows;
  }
}
