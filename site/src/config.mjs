// Site-wide settings. Everything in [BRACKETS] still needs a real value.
export const config = {
  siteUrl: "https://matteflux.com",
  siteName: "Matteflux",
  tagline: "Ambient motion for heroes & footers.",
  description:
    "Matching hero and footer video backgrounds for websites. Seamless loops, small files, ready-made code for HTML/CSS, Framer and Webflow. Code-generated motion.",

  // Where the videos live. Move them to a CDN or R2 bucket later by
  // changing this one line (no trailing slash).
  mediaBase: "/media",

  // Set shown in the hero and footer on first load.
  defaultSet: "ember-aurora",

  // GitHub repo — used for star CTA and download links.
  githubRepo: "https://github.com/mertJF/matteflux",
  releaseTag: "v1.0",
  downloadUrl: (set) =>
    `https://github.com/mertJF/matteflux/releases/download/v1.0/matteflux-${set.num}-${set.slug}.zip`,

  contactEmail: "[CONTACT_EMAIL]",
  social: { x: "[X_URL]", dribbble: "[DRIBBBLE_URL]", behance: "[BEHANCE_URL]" },
};
