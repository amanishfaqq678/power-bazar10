import ledLighting from "@/assets/cat-led-lighting.jpg";
import switchesSockets from "@/assets/cat-switches-sockets.jpg";
import powerExtension from "@/assets/cat-power-extension.jpg";
import electricalProtection from "@/assets/cat-electrical-protection.jpg";
import wiringAccessories from "@/assets/cat-wiring-accessories.jpg";
import homeElectrical from "@/assets/cat-home-electrical.jpg";
import electricalAccessories from "@/assets/cat-electrical-accessories.jpg";
import fallback from "@/assets/hero-products.jpg";

/**
 * Placeholder imagery per category. Admin-uploaded images (products.image_url
 * / categories.image_url) always take priority; these keep the prototype
 * looking complete until real photography is uploaded.
 */
const bySlug: Record<string, string> = {
  "led-lighting": ledLighting,
  "switches-sockets": switchesSockets,
  "power-extension": powerExtension,
  "electrical-protection": electricalProtection,
  "wiring-accessories": wiringAccessories,
  "home-electrical": homeElectrical,
  "electrical-accessories": electricalAccessories,
};

export function categoryImage(slug: string | null | undefined, uploaded?: string | null) {
  if (uploaded) return uploaded;
  return (slug && bySlug[slug]) || fallback;
}
