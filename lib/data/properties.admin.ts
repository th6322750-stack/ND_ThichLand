import type { AdminPropertyRecord } from "../types";
import { properties } from "./properties";

// Demo records must not turn input hints into saved values. Keeping these
// fields empty also makes it obvious to an operator which internal details
// still need to be supplied before real operation begins.
const defaultInternal: Pick<AdminPropertyRecord, "commission" | "guidePerson" | "internalNotes"> = {
  commission: "",
  guidePerson: "",
  internalNotes: "",
};

export const adminProperties: AdminPropertyRecord[] = properties.map((property) => ({
  ...property,
  ...defaultInternal,
  published: true,
}));

export function getAdminPropertyBySlug(slug: string): AdminPropertyRecord | undefined {
  return adminProperties.find((p) => p.slug === slug);
}
