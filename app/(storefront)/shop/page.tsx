import type { Metadata } from "next";
import { getProducts, searchProducts } from "@/lib/products";
import { shopSections, type ShopCategoryId } from "@/data/categories";
import { ShopClient } from "@/components/shop/shop-client";

export const metadata: Metadata = {
  title: "Shop all gadgets",
  description:
    "Shop backpacks, totes, crossbody bags, laptop sleeves, power banks, smart glasses, watches, stands and devices from Comfy Connects. Delivered across Ghana.",
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const { category, q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 80) : "";
  if (query) {
    const results = await searchProducts(query);
    return <ShopClient products={results} category="all" query={query} />;
  }
  const active: ShopCategoryId = shopSections.some(s => s.id === category)
    ? (category as ShopCategoryId)
    : "all";
  const products = await getProducts(active);
  return <ShopClient products={products} category={active} />;
}
