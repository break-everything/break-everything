/**
 * Rules for public POST `/api/events` (client ingest). Keep in sync with `src/analytics/client.ts`.
 */

export const ANALYTICS_INGEST_ALLOWED_EVENTS = new Set(["tool_action_click"]);

const ACTION_MAX_LEN = 64;
const ACTION_RE = /^[a-zA-Z0-9_-]+$/;

/** Returns normalized action string, `""` if omitted, or `null` if invalid. */
export function normalizeAnalyticsAction(raw: unknown): string | null {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (s.length > ACTION_MAX_LEN) return null;
  if (!ACTION_RE.test(s)) return null;
  return s;
}
