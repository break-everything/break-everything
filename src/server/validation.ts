/** HTTP(S) URLs only — blocks javascript:, data:, etc. in stored link fields */
export function isAllowedHttpUrl(value: string): boolean {
  const t = value.trim();
  if (!t) return false;
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    if (!u.hostname) return false;
    return true;
  } catch {
    return false;
  }
}

/** Safe positive integer IDs from dynamic route segments */
export function parsePositiveIntId(param: string): number | null {
  if (!/^\d+$/.test(param)) return null;
  const n = Number(param);
  if (!Number.isSafeInteger(n) || n < 1) return null;
  return n;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidToolSlug(slug: string): boolean {
  return typeof slug === "string" && slug.length >= 1 && slug.length <= 120 && SLUG_RE.test(slug);
}

export type ParsedToolKind = "download" | "web";
export type ParsedDeliveryMode = "redirect" | "embedded" | "browserRuntime" | "download";
export type ParsedSandboxLevel = "strict" | "standard" | "trusted";
export type ParsedDataHandling = "low" | "medium" | "high";

export function parseToolKind(value: unknown): ParsedToolKind | null {
  if (value === "web" || value === "download") {
    return value;
  }
  return null;
}

export function parseDeliveryMode(value: unknown): ParsedDeliveryMode | null {
  if (
    value === "redirect" ||
    value === "embedded" ||
    value === "browserRuntime" ||
    value === "download"
  ) {
    return value;
  }
  return null;
}

export function parseSandboxLevel(value: unknown): ParsedSandboxLevel | null {
  if (value === "strict" || value === "standard" || value === "trusted") {
    return value;
  }
  return null;
}

export function parseDataHandling(value: unknown): ParsedDataHandling | null {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }
  return null;
}

/** Categories preserve user casing while enforcing simple, deduped labels. */
export function normalizeCategoriesInput(
  value: unknown
): { ok: true; categories: string[] } | { ok: false; error: string } {
  if (!Array.isArray(value)) {
    return { ok: false, error: "categories must be an array of strings" };
  }

  const normalized: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") {
      return { ok: false, error: "categories must be an array of strings" };
    }
    const c = item.trim();
    if (!c) continue;
    if (c.length > 40) {
      return { ok: false, error: "each category must be at most 40 characters" };
    }
    if (c.includes(",")) {
      return { ok: false, error: "categories must not contain commas" };
    }
    const key = c.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(c);
  }

  if (normalized.length === 0) {
    return { ok: false, error: "categories must contain at least one category" };
  }

  return { ok: true, categories: normalized };
}

/**
 * Trusted iframe allowlist entries: hostname-style labels only. Rejects bare TLDs like `com` or `uk`,
 * which would otherwise match every host under that public suffix via suffix rules.
 */
export function isValidTrustedDomainEntry(entry: string): boolean {
  const e = entry.trim().toLowerCase();
  if (!e || !/^[a-z0-9.-]+$/.test(e)) return false;
  if (e === "localhost") return true;
  return e.includes(".");
}

export function parseCsvDomains(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .filter(isValidTrustedDomainEntry);
}

/** Admin write: reject invalid tokens instead of silently dropping them (avoids accidental open embed). */
export function normalizeTrustedDomainsInput(
  value: unknown
): { ok: true; csv: string } | { ok: false; error: string } {
  if (value == null || String(value).trim() === "") {
    return { ok: true, csv: "" };
  }
  if (typeof value !== "string") {
    return { ok: false, error: "trusted_domains must be a comma-separated string" };
  }
  const parts = value.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { ok: true, csv: "" };
  }
  const normalized: string[] = [];
  for (const p of parts) {
    const lower = p.toLowerCase();
    if (!isValidTrustedDomainEntry(lower)) {
      return {
        ok: false,
        error:
          "Each trusted domain must look like a hostname (e.g. app.example.com or example.com), not a bare TLD; localhost is allowed",
      };
    }
    normalized.push(lower);
  }
  return { ok: true, csv: [...new Set(normalized)].join(",") };
}

export function isAllowedEmbedUrl(url: string, allowlist: string[]): boolean {
  if (!isAllowedHttpUrl(url)) return false;
  if (allowlist.length === 0) return false;
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return allowlist.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}
