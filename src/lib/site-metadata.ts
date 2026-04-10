/** Shared strings and defaults for <meta>, Open Graph, and Twitter Cards. */

export const SITE_NAME = "Break Everything";

export const SITE_TAGLINE = "Free Tools for Students";

export const DEFAULT_DESCRIPTION =
  "A curated, open-source tool directory for students — build-ready listings with source links and clear details.";

export const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

/** Square brand lockup; dimensions match `public/logo-lockup.png`. */
export const DEFAULT_OG_IMAGE = {
  url: "/logo-lockup.png",
  width: 1024,
  height: 1024,
  alt: `${SITE_NAME} — BE wordmark`,
  type: "image/png",
} as const;
