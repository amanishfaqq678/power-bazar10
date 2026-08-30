import { fetchCategories, fetchProducts } from "@/lib/api";
import type { Product } from "@/lib/types";

/**
 * AI Product Assistant service boundary.
 *
 * The MVP performs catalogue-grounded matching locally: it reads the Power
 * Bazar catalogue from the database and returns product recommendations with a
 * short reason. No AI API is called and no AI response is faked.
 *
 * To connect a real model later, replace `askAssistant` with a call to a
 * server function that receives `buildCatalogueContext()` plus the user's
 * question. The UI contract below does not need to change.
 */

export interface AssistantRecommendation {
  product: Product;
  reason: string;
}

export interface AssistantReply {
  answer: string;
  recommendations: AssistantRecommendation[];
  /** True while running on the local catalogue matcher. */
  offline: boolean;
}

const KEYWORDS: Array<{ terms: string[]; slug: string }> = [
  { terms: ["led", "light", "bulb", "panel", "batten", "lamp", "roshni"], slug: "led-lighting" },
  {
    terms: ["switch", "socket", "board", "plate", "modular", "bedroom", "room"],
    slug: "switches-sockets",
  },
  { terms: ["extension", "strip", "multi", "plug", "adaptor"], slug: "power-extension" },
  {
    terms: ["breaker", "mcb", "protection", "safety", "distribution", "fuse"],
    slug: "electrical-protection",
  },
  { terms: ["wire", "cable", "conduit", "pipe", "wiring"], slug: "wiring-accessories" },
  { terms: ["home", "house", "ceiling", "rose", "holder"], slug: "home-electrical" },
  {
    terms: ["accessory", "accessories", "clip", "connector", "spare"],
    slug: "electrical-accessories",
  },
];

export async function buildCatalogueContext() {
  const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
  return { categories, products };
}

export async function askAssistant(question: string): Promise<AssistantReply> {
  const query = question.toLowerCase();
  const { categories, products } = await buildCatalogueContext();

  const matchedSlugs = KEYWORDS.filter((entry) =>
    entry.terms.some((term) => query.includes(term)),
  ).map((entry) => entry.slug);

  const matchedCategories = categories.filter((category) => matchedSlugs.includes(category.slug));

  const scored = products
    .map((product) => {
      let score = 0;
      const haystack = `${product.name} ${product.description ?? ""} ${
        product.category?.name ?? ""
      }`.toLowerCase();
      for (const word of query.split(/[^a-z0-9]+/).filter((w) => w.length > 2)) {
        if (haystack.includes(word)) score += 2;
      }
      if (product.category_id && matchedCategories.some((c) => c.id === product.category_id)) {
        score += 3;
      }
      if (product.availability === "in_stock") score += 1;
      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const quantityMatch = query.match(/(\d{2,4})/);

  if (scored.length === 0) {
    return {
      answer:
        "I could not match that to the catalogue yet. Try naming a product type — for example switches, sockets, LED lights, extension boards, breakers or wiring — or send a quote request and the Power Bazar team will help directly.",
      recommendations: [],
      offline: true,
    };
  }

  const categoryNames = Array.from(
    new Set(scored.map((entry) => entry.product.category?.name).filter(Boolean)),
  ).join(", ");

  const answer = [
    `Based on the Power Bazar catalogue${categoryNames ? ` (${categoryNames})` : ""}, here are the closest matches.`,
    quantityMatch
      ? `For around ${quantityMatch[1]} units, send a quote request so the team can confirm bulk availability and pricing.`
      : "Pricing is confirmed per enquiry, so use Request Quote for a current price.",
  ].join(" ");

  return {
    answer,
    recommendations: scored.map((entry) => ({
      product: entry.product,
      reason: buildReason(entry.product, matchedCategories.length > 0),
    })),
    offline: true,
  };
}

function buildReason(product: Product, categoryMatched: boolean) {
  const availability =
    product.availability === "in_stock"
      ? "currently in stock"
      : product.availability === "low_stock"
        ? "limited stock"
        : "available on request";
  const base = categoryMatched
    ? `Matches the ${product.category?.name ?? "requested"} category`
    : "Closest match to your description";
  return `${base} and ${availability}.`;
}

export const EXAMPLE_QUESTIONS = [
  "I need switches and sockets for a new bedroom.",
  "I need LED lights for a shop.",
  "Show me affordable switch boards.",
  "I need 20 sockets for a project.",
  "What is the difference between a LED panel and a LED batten?",
];
