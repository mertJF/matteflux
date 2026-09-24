// Site-wide settings. Everything in [BRACKETS] still needs a real value.
export const config = {
  siteUrl: "https://matteflux.com",
  siteName: "Matteflux",
  tagline: "Ambient motion for heroes & footers.",
  description:
    "Matching hero and footer video backgrounds for websites. Seamless loops, small files, ready-made code for HTML/CSS, Framer and Webflow. Procedurally crafted, not AI-generated.",

  // Where the videos live. Move them to a CDN or R2 bucket later by
  // changing this one line (no trailing slash).
  mediaBase: "/media",

  // Set shown in the hero and footer on first load.
  defaultSet: "ember-aurora",

  // Polar checkout links, one per product and license (Phase 4).
  checkout: {
    single: { personal: "[POLAR_URL_SINGLE_PERSONAL]", commercial: "[POLAR_URL_SINGLE_COMMERCIAL]" },
    collection: { personal: "[POLAR_URL_COLLECTION_PERSONAL]", commercial: "[POLAR_URL_COLLECTION_COMMERCIAL]" },
    allAccess: { personal: "[POLAR_URL_ALLACCESS_PERSONAL]", commercial: "[POLAR_URL_ALLACCESS_COMMERCIAL]" },
  },
  prices: { single: "[PRICE]", collection: "[PRICE]", allAccess: "[PRICE]", currencyNote: "[CURRENCY]" },

  // Free-set signup form endpoint (Phase 4).
  emailFormAction: "[EMAIL_FORM_ACTION]",

  contactEmail: "[CONTACT_EMAIL]",
  social: { x: "[X_URL]", dribbble: "[DRIBBBLE_URL]", behance: "[BEHANCE_URL]" },
};
