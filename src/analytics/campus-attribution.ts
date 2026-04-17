/**
 * Client-only campus campaign attribution (first-touch, localStorage).
 * Campaign: utm_campaign=be_campus_2026; university slug from utm_source before first "_".
 */

export const CAMPUS_CAMPAIGN_ID = "be_campus_2026" as const;

/** Versioned storage key — matches `be:*:v1` convention (see useFavorites). */
export const CAMPUS_ATTRIBUTION_STORAGE_KEY = "be:school:v1";

const CAMPUS_ATTRIBUTION_EVENT = "be:school:changed";

/** Hyphenated slug segments only (lowercase). */
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type CampusAttribution = {
  slug: string;
  capturedAt: string;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isValidSlug(candidate: string): boolean {
  return SLUG_RE.test(candidate);
}

/**
 * Pure parse: returns `{ slug }` or null. Does not read storage.
 */
export function parseCampusAttributionFromSearchParams(
  searchParams: URLSearchParams
): { slug: string } | null {
  if (searchParams.get("utm_campaign") !== CAMPUS_CAMPAIGN_ID) {
    return null;
  }
  const rawSource = searchParams.get("utm_source");
  if (rawSource == null || rawSource === "") {
    return null;
  }
  const underscore = rawSource.indexOf("_");
  if (underscore < 0) {
    return null;
  }
  const candidate = rawSource.slice(0, underscore).trim().toLowerCase();
  if (!candidate) {
    return null;
  }
  if (!isValidSlug(candidate)) {
    return null;
  }
  return { slug: candidate };
}

function parseStoredAttribution(raw: string | null): CampusAttribution | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const slug = (parsed as { slug?: unknown }).slug;
    const capturedAt = (parsed as { capturedAt?: unknown }).capturedAt;
    if (typeof slug !== "string" || typeof capturedAt !== "string") return null;
    const normalized = slug.trim().toLowerCase();
    if (!isValidSlug(normalized)) return null;
    return { slug: normalized, capturedAt };
  } catch {
    return null;
  }
}

/**
 * Read persisted attribution, or null if missing/invalid.
 */
export function readCampusAttribution(): CampusAttribution | null {
  if (!canUseStorage()) return null;
  return parseStoredAttribution(window.localStorage.getItem(CAMPUS_ATTRIBUTION_STORAGE_KEY));
}

function writeCampusAttribution(value: CampusAttribution): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(CAMPUS_ATTRIBUTION_STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(CAMPUS_ATTRIBUTION_EVENT));
}

/**
 * First-touch capture from current URL: only writes when storage has no valid attribution yet.
 */
export function captureCampusAttributionFromUrl(): void {
  if (!canUseStorage()) return;
  const existing = readCampusAttribution();
  if (existing) return;

  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const parsed = parseCampusAttributionFromSearchParams(params);
  if (!parsed) return;

  writeCampusAttribution({
    slug: parsed.slug,
    capturedAt: new Date().toISOString(),
  });
}

export { CAMPUS_ATTRIBUTION_EVENT };
