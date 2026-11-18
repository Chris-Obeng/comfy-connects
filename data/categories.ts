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
 * Editorial slots for the homepage. Every image is the shop's own stock on the
 * brand's white sweep, so it floats on its colour field.
 */
export const editorial = {
  hero: {
    eyebrow: "Koforidua & Kasoa",
    headline: "Your gadget plug.",
    sub: "Bags, power and smart gear. Free pickup in Koforidua or Kasoa.",
    panels: [
      panel("wiwu-warriors-backpack-x-pro", { tint: "#E8EFE4" }),
      panel("phone-planet-hybrid-max", { tint: "#F4EBE3", label: "Hybrid Max Power Bank" }),
      panel("s2-max-ai-smart-glasses", { tint: "#ECEAF1", label: "S2 Max AI Smart Glasses" }),
    ],
  },
  promos: [
    {
      ...panel("wiwu-t33-anc-earbuds", { tint: "#E6ECF2" }),
      eyebrow: "New in",
      title: "Quiet, on purpose.",
      text: "T33 ANC Pro earbuds cut 42 dB of trotro and shop noise. GH₵420.",
      href: "/product/wiwu-t33-anc-earbuds",
      action: "See the earbuds",
      panel: "#E6ECF2",
    },
    {
      ...panel("wiwu-warriors-backpack-x-pro", { tint: "#E8EFE4" }),
      eyebrow: "Best seller",
      title: "Warriors X Pro.",
      text: "A 15.6-inch laptop backpack that survives the trotro. GH₵850.",
      href: "/product/wiwu-warriors-backpack-x-pro",
      action: "See the backpack",
      panel: "#E8EFE4",
    },
  ],
  feature: {
    ...panel("phone-planet-hybrid-max", { tint: "#22201f" }),
    title: "Power that refills itself.",
    text: "The Hybrid Max is a 10,000mAh power bank with its own wall plug. Charge it in any socket, and the only cable you carry is for your phone.",
    href: "/product/phone-planet-hybrid-max",
    action: "Shop the Hybrid Max",
    panel: "#22201f",
  },
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
