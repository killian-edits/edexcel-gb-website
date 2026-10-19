/**
 * Central site identity configuration.
 *
 * The displayed site name is controlled from this single file.
 * Changing `name` here updates the header, footer, page titles,
 * auth screens, and every other user-facing reference.
 *
 * Keep the independent-service disclaimer separate and intact —
 * it is not derived from this config.
 */
export const siteConfig = {
  name: "Edexify",
  description:
    "Explore Edexcel International GCSE historical grade boundaries, calculate practice outcomes using verified data, and understand trends.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /** Independent-service disclaimer (not editable via site name) */
  disclaimer:
    "Edexify is an independent educational utility. It is not affiliated with, endorsed by, or an official product of Pearson Education Ltd. Edexcel and Pearson are registered trademarks of Pearson Education Ltd.",

  /** Navigation links */
  nav: [
    { label: "Home", href: "/" },
    { label: "Calculator", href: "/calculator" },
    { label: "Dashboard", href: "/dashboard", auth: true },
    { label: "Resources", href: "/resources" },
  ] as const,
} as const;

export type SiteConfig = typeof siteConfig;
