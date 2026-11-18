import { coreProducts } from "./core-products";
import type { CategoryId } from "@/types";

const bySlug = (slug: string) => coreProducts.find(p => p.slug === slug);

/** A product shot shown inside a soft colour field, Apple-style. */
const panel = (slug: string, overrides: Partial<{ label: string; tint: string }> = {}) => {
  const p = bySlug(slug);
  return {
    src: p?.images[0] ?? "",
    alt: p?.name ?? "",
    tint: overrides.tint ?? p?.tint ?? "#f5f5f7",
    label: overrides.label ?? p?.name ?? "",
    href: `/product/${slug}`,
  };
};

/**
 * Homepage tiles, Apple-style: one product per tile, its name, one line, Buy and Learn more.
 * Every image is the manufacturer's studio shot on a white sweep, so it floats on the tint.
 * Lines are facts from the product record, never claims we can't back.
 */
export const editorial = {
  hero: {
    slug: "wiwu-warriors-backpack-x-pro",
    title: "Warriors X Pro",
    line: "Waterproof, with a shockproof laptop bay.",
    tint: "#eefbe8",
  },
  tiles: [
    {
      slug: "wiwu-t33-anc-earbuds",
      title: "T33 ANC Pro",
      line: "Noise cancelling, with four mics for calls.",
      tint: "#e9eef4",
    },
    {
      slug: "s2-max-ai-smart-glasses",
      title: "S2 Max",
      line: "Photos, music and calls, hands free.",
      tint: "#eeecf3",
    },
  ],
  wide: {
    slug: "phone-planet-hybrid-max",
    title: "Hybrid Max",
    line: "A power bank with its own wall plug.",
    tint: "#f5ede5",
  },
  /** Open Graph image for the whole site. */
  share: panel("wiwu-warriors-backpack-x-pro"),
};

/**
 * The single source of truth for shop categories. "new" and "deals" are
 * pseudo-categories (tag filters) but are surfaced where a real one is.
 */
const tile = (id: CategoryId | "new" | "deals", name: string, slug: string) => {
  const p = bySlug(slug);
  return { id, name, image: p?.images[0] ?? "", tint: p?.tint ?? "#f5f5f7", cutout: p?.cutout ?? false };
};

export const categories = [
  tile("new", "New in", "wiwu-t33-anc-earbuds"),
  tile("bags", "Bags & sleeves", "wiwu-warriors-backpack-x-pro"),
  tile("power", "Power & charging", "wiwu-chg500-gan-charger"),
  tile("audio", "Audio", "wiwu-go-fun-speaker"),
  tile("wearables", "Wearables", "wiwu-smart-watch-sw06"),
  tile("accessories", "Accessories", "wiwu-hubble-tablet-stand"),
] as const;

export type ShopCategoryId = (typeof categories)[number]["id"] | "all" | "devices";

/** Category filter pills in display order. Nav, shop pills and validation all read from this. */
export const shopSections: { id: ShopCategoryId; name: string }[] = [
  { id: "all", name: "All" },
  ...categories.map(c => ({ id: c.id as ShopCategoryId, name: c.name })),
  { id: "devices", name: "Devices & audio" },
];

/** Header nav: five real shelves, no "All" (the logo goes home). */
export const navSections = categories.filter(c => c.id !== "new");

export function categoryHref(id: ShopCategoryId) {
  return id === "all" ? "/shop" : `/shop?category=${id}`;
}

export const categoryName = (id: string) => shopSections.find(c => c.id === id)?.name ?? id;
