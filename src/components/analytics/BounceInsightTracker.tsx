"use client";

import { useEffect, useRef } from "react";
import { trackVercelEvent } from "@/analytics/vercel-web";

const EVENT = "be_route_engagement";

export type BounceInsightRoute = "home" | "tools";

/**
 * Emits Vercel custom events to compare quick exits vs engaged sessions on high-bounce routes.
 * Signals: view, dwell_5s / 15s / 30s, scroll_25 / 50 / 75, leave (+ dwell_s seconds).
 */
export default function BounceInsightTracker({ route }: { route: BounceInsightRoute }) {
  const mountedAt = useRef<number>(0);
  const signalsFired = useRef<Set<string>>(new Set());
  const leaveSent = useRef(false);
  const timerIds = useRef<number[]>([]);

  useEffect(() => {
    mountedAt.current = Date.now();

    function fire(signal: string, extra?: Record<string, string | number | boolean | null>) {
      const key = extra ? `${signal}:${JSON.stringify(extra)}` : signal;
      if (signalsFired.current.has(key)) return;
      signalsFired.current.add(key);
      trackVercelEvent(EVENT, { route, signal, ...extra });
    }

    fire("view");

    const schedule = (ms: number, signal: string) => {
      const id = window.setTimeout(() => fire(signal), ms);
      timerIds.current.push(id);
    };
    schedule(5000, "dwell_5s");
    schedule(15000, "dwell_15s");
    schedule(30000, "dwell_30s");

    function scrollPct(): number {
      const el = document.documentElement;
      const total = el.scrollHeight - window.innerHeight;
      if (total <= 0) return 100;
      return (window.scrollY / total) * 100;
    }

    function onScroll() {
      const pct = scrollPct();
      if (pct >= 25) fire("scroll_25");
      if (pct >= 50) fire("scroll_50");
      if (pct >= 75) fire("scroll_75");
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    function sendLeave() {
      if (leaveSent.current) return;
      leaveSent.current = true;
      const dwellS = Math.max(0, Math.round((Date.now() - mountedAt.current) / 1000));
      fire("leave", { dwell_s: dwellS });
    }

    window.addEventListener("pagehide", sendLeave);
    function onVisibility() {
      if (document.visibilityState === "hidden") {
        sendLeave();
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      for (const id of timerIds.current) {
        window.clearTimeout(id);
      }
      timerIds.current = [];
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", sendLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      sendLeave();
    };
  }, [route]);

  return null;
}
