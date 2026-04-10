/**
 * Browser-only analytics helpers (non-blocking; failures are swallowed).
 * POSTs to `/api/events` — see `src/server/analytics-ingest.ts` for allowed payloads.
 */

export async function trackToolActionClick(slug: string, action: string): Promise<void> {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "tool_action_click", slug, action }),
    });
  } catch {
    // non-blocking analytics
  }
}
