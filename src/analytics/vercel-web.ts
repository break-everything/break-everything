/**
 * Vercel Web Analytics custom events (client-only).
 * @see https://vercel.com/docs/analytics/custom-events
 */
import { track } from "@vercel/analytics";

export type VercelEventProps = Record<string, string | number | boolean | null>;

/**
 * Non-throwing wrapper — safe to call from client components and effects.
 */
export function trackVercelEvent(name: string, properties?: VercelEventProps): void {
  if (typeof window === "undefined") return;
  try {
    if (properties && Object.keys(properties).length > 0) {
      track(name, properties);
    } else {
      track(name);
    }
  } catch {
    // ignore analytics failures
  }
}
