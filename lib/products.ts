import { coreProducts } from "@/data/core-products";
import { getDemoProducts } from "@/lib/catalog/demo-api";
import { categoryName } from "@/data/categories";
import { buildKeywords, search } from "@/lib/search";
import type { Product, SearchItem } from "@/types";

/**
 * The catalogue the storefront reads. Two shelves:
 *   1. the shop's own line-up (data/core-products.ts)
 *   2. the demo product API (lib/catalog/demo-api.ts, DummyJSON)
 * Both are plain arrays, so swapping in Supabase later means changing only what
 * `allProducts()` returns.
 */
export async function allProducts(): Promise<Product[]> {
  const demo = await getDemoProducts();
  return [...coreProducts, ...demo];
}

export async function getProducts(category?: string): Promise<Product[]> {
  const products = await allProducts();
  return products.filter(p => {
    // The demo shelf lives behind its own tab so the real catalogue stays clean.
    if (!category || category === "all") return p.source !== "demo";
    if (category === "devices") return p.source === "demo";
    if (p.source === "demo") return false;
    if (category === "new") return p.tags.includes("new");
    if (category === "deals") return Boolean(p.compareAtPrice);
    return p.category === category;
  });
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await allProducts();
  return products.find(p => p.slug === slug);
}

export async function getRelated(product: Product, limit = 8): Promise<Product[]> {
  const products = await allProducts();
  return products
    .filter(p => p.id !== product.id && p.source !== "demo")
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, limit);
}

export function toSearchItem(p: Product): SearchItem {
  const catName = categoryName(p.category);
  return {
    slug: p.slug,
    name: p.name,
    price: p.price,
    category: p.category,
    categoryName: catName,
    image: p.images[0],
    tint: p.tint,
    cutout: p.cutout,
    soldOut: p.sizes.every(s => s.stock === 0),
    isNew: p.tags.includes("new"),
    colors: p.colors.map(c => c.name),
    keywords: buildKeywords([p.name, p.brand ?? "", catName, p.category, ...p.colors.map(c => c.name), p.description]),
  };
}

export async function searchProducts(query: string): Promise<Product[]> {
  const products = await allProducts();
  const items = products.map(p => ({ product: p, ...toSearchItem(p) }));
  return search(items, query).map(i => i.product);
}
