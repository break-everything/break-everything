/** Shared strings and defaults for <meta>, Open Graph, and Twitter Cards. */

export const SITE_NAME = "Break Everything";

export const SITE_TAGLINE = "Free Tools for Students";

export const DEFAULT_DESCRIPTION =
  "A curated, open-source tool directory for students — build-ready listings with source links and clear details.";

export const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

/** 16:9 hero banner for link previews; dimensions match `public/og-hero.png`. */
export const DEFAULT_OG_IMAGE = {
  url: "/og-hero.png",
  width: 1024,
  height: 576,
  alt: `${SITE_NAME} — free, open-source tools for students`,
  type: "image/png",
} as const;
