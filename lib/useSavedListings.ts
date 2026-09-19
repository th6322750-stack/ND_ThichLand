"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "ndthich:saved-listings";
const CHANGE_EVENT = "ndthich:saved-listings-change";

/**
 * "Yêu thích" was a purely decorative affordance: two heart buttons on every
 * result row plus a bottom-nav tab, none of them wired to anything. Rather
 * than deleting approved UI or inventing a server-side favourites table (no
 * accounts exist on this site), the state lives in the visitor's own browser
 * — no personal data leaves the device, nothing to persist server-side, and
 * the controls finally do what they look like they do.
 *
 * localStorage is an external store, so this reads it through
 * useSyncExternalStore: no setState-in-effect, no hydration mismatch (the
 * server snapshot is always empty), and every mounted consumer — row hearts,
 * the bottom-nav badge, the /cho-thue saved view — stays in sync. The custom
 * event covers same-tab updates; `storage` covers other tabs.
 */
const EMPTY: string[] = [];

// useSyncExternalStore compares snapshots by reference, so the parsed array
// is cached against the exact raw string it came from — re-parsing on every
// render would hand back a new array each time and loop forever.
let cachedRaw: string | null = null;
let cachedValue: string[] = EMPTY;

function readStored(): string[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  if (!raw) {
    cachedValue = EMPTY;
    return cachedValue;
  }
  try {
    const value: unknown = JSON.parse(raw);
    cachedValue = Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : EMPTY;
  } catch {
    cachedValue = EMPTY;
  }
  return cachedValue;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Server and first client render agree on "nothing saved yet". */
function getServerSnapshot(): string[] {
  return EMPTY;
}

export function useSavedListings() {
  const saved = useSyncExternalStore(subscribe, readStored, getServerSnapshot);

  const toggle = useCallback((slug: string) => {
    const current = readStored();
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private browsing / quota exceeded. Nothing else to do — surfacing a
      // storage error for a bookmark toggle would be noise, and the button
      // simply stays in its previous state rather than lying about success.
      return;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const isSaved = useCallback((slug: string) => saved.includes(slug), [saved]);

  return { saved, isSaved, toggle };
}
