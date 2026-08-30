/**
 * Central brand + integration configuration.
 * Values that are not yet verified for the business stay null on purpose —
 * the UI renders a clear placeholder state instead of inventing details.
 */
export const site = {
  name: "Power Bazar",
  tagline: "POWERING YOUR WORLD",
  description:
    "Reliable electrical products for homes, shops and businesses — made easier to find, understand and choose.",
  /** Not yet confirmed by the business. Keep null until provided. */
  phone: null as string | null,
  whatsapp: null as string | null,
  email: null as string | null,
  address: null as string | null,
  social: [
    { label: "Facebook", href: null as string | null },
    { label: "Instagram", href: null as string | null },
    { label: "WhatsApp", href: null as string | null },
    { label: "YouTube", href: null as string | null },
  ],
} as const;

export const CATEGORY_NAV = [
  { name: "LED Lighting", slug: "led-lighting" },
  { name: "Switches & Sockets", slug: "switches-sockets" },
  { name: "Power & Extension", slug: "power-extension" },
  { name: "Electrical Protection", slug: "electrical-protection" },
  { name: "Wiring & Accessories", slug: "wiring-accessories" },
  { name: "Home Electrical", slug: "home-electrical" },
  { name: "Electrical Accessories", slug: "electrical-accessories" },
] as const;

/** Storage bucket used for admin-uploaded product imagery. */
export const PRODUCT_IMAGE_BUCKET = "product-images";
