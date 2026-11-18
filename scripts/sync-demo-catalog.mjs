#!/usr/bin/env node
/**
 * Refreshes data/demo-catalog.json from DummyJSON — a free, key-less demo/fake
 * product API (https://dummyjson.com). The app reads that snapshot at build time
 * and re-fetches the live API on a one-day revalidate, so the storefront still
 * builds if the API is down.
 *
 *   node scripts/sync-demo-catalog.mjs
 */
import { writeFile } from "node:fs/promises";

const API = "https://dummyjson.com";
const CATEGORIES = ["laptops", "smartphones", "tablets", "mobile-accessories"];
const PER_CATEGORY = 3;

const pick = async url => {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
};

const items = [];
for (const category of CATEGORIES) {
  const data = await pick(`${API}/products/category/${category}?limit=${PER_CATEGORY}&select=id,title,description,category,price,discountPercentage,brand,stock,images,thumbnail,tags`);
  for (const p of data.products ?? []) items.push(p);
}

// A demo shelf still has to look shelf-ready: drop the decade-old phone models.
const SKIP = [/^iphone 5s$/i, /^iphone 6$/i];

const rows = items.filter(p => !SKIP.some(re => re.test(p.title))).map(p => ({
  id: p.id,
  title: p.title,
  description: p.description,
  category: p.category,
  usd: p.price,
  discount: p.discountPercentage ?? 0,
  brand: p.brand ?? null,
  stock: p.stock ?? 10,
  tags: p.tags ?? [],
  images: (p.images ?? []).filter(Boolean).slice(0, 4),
}));

await writeFile(
  new URL("../data/demo-catalog.json", import.meta.url),
  `${JSON.stringify({ syncedAt: new Date().toISOString(), source: API, products: rows }, null, 2)}\n`,
  "utf8"
);

console.log(`Wrote ${rows.length} demo products from ${API}`);
