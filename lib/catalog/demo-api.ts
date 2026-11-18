import type { CategoryId, Product } from "@/types";
import snapshot from "@/data/demo-catalog.json";

/**
 * Demo product API: DummyJSON (https://dummyjson.com) — free, no key, no sign-up.
 *
 * The storefront reads this on a one-day revalidate and falls back to the
 * committed snapshot (data/demo-catalog.json, refreshed with
 * `npm run sync:catalog`) when the API is unreachable, so a build never depends
 * on someone else's uptime. Swap this file for the real supplier feed when the
 * shop goes live.
 */

const API = "https://dummyjson.com";
const CATEGORIES = ["laptops", "smartphones", "tablets", "mobile-accessories"] as const;
const PER_CATEGORY = 3;
const SELECT = "id,title,description,category,price,discountPercentage,brand,stock,images,tags";

/** Demo conversion rate: what the shop would ask in cedis for a dollar-priced gadget. */
const CEDIS_PER_USD = 12.5;

/** Soft colour fields, cycled so the demo shelf still looks like one shop. */
const TINTS = ["#EDEFF2", "#EFEDE8", "#E9F0EE", "#F1EEF4", "#EFEFEA", "#E8EEF5"];

type DemoRow = {
  id: number;
  title: string;
  description: string;
  category: string;
  /** The API ships `price`; the committed snapshot renames it to `usd`. */
  price?: number;
  usd?: number;
  discount: number;
  brand: string | null;
  stock: number;
  tags: string[];
  images: string[];
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Round to the nearest GH₵5 so demo prices read like shelf prices, in pesewas. */
const toPesewas = (usd: number) => Math.max(500, Math.round((usd * CEDIS_PER_USD) / 5) * 5) * 100;

const categoryFor = (raw: string): CategoryId =>
  raw === "mobile-accessories" ? "accessories" : "devices";

function toProduct(row: DemoRow, index: number): Product | null {
  const images = (row.images ?? []).filter(Boolean);
  if (!images.length) return null;
  const usd = row.usd ?? row.price;
  if (typeof usd !== "number" || !Number.isFinite(usd)) return null;
  const price = toPesewas(usd);
  const compareAtPrice = row.discount >= 5 ? Math.round(price / (1 - row.discount / 100) / 500) * 500 : undefined;
  return {
    id: `demo-${row.id}`,
    slug: `demo-${slugify(row.title)}`,
    name: row.title,
    brand: row.brand ?? undefined,
    price,
    ...(compareAtPrice ? { compareAtPrice } : {}),
    description: row.description,
    story: "",
    images,
    // DummyJSON renders sit on a plain background, so they float on the tint like our studio shots.
    cutout: true,
    tint: TINTS[index % TINTS.length],
    category: categoryFor(row.category),
    colors: [],
    sizes: [{ name: "Standard", stock: Math.max(1, Math.min(row.stock, 10)) }],
    tags: [],
    details: [],
    source: "demo",
  };
}

async function fetchLive(): Promise<DemoRow[]> {
  const results = await Promise.all(
    CATEGORIES.map(async category => {
      const res = await fetch(`${API}/products/category/${category}?limit=${PER_CATEGORY}&select=${SELECT}`, {
        // Re-fetch once a day at most; the snapshot covers the first build.
        next: { revalidate: 86_400, tags: ["demo-catalog"] },
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(`DummyJSON ${category} → HTTP ${res.status}`);
      const data = (await res.json()) as { products?: DemoRow[] };
      return data.products ?? [];
    })
  );
  return results.flat();
}

const SKIP = [/^iphone 5s$/i, /^iphone 6$/i];

function normalise(rows: DemoRow[]): Product[] {
  return rows
    .filter(row => row?.title && !SKIP.some(re => re.test(row.title)))
    .map(toProduct)
    .filter((p): p is Product => p !== null);
}

let cached: Product[] | null = null;

/**
 * Products for the demo shelf. Never throws: if the API is down or slow we use
 * the snapshot that ships with the repo.
 */
export async function getDemoProducts(): Promise<Product[]> {
  if (cached) return cached;
  try {
    const live = normalise(await fetchLive());
    if (live.length >= 4) {
      cached = live;
      return cached;
    }
  } catch {
    // fall through to the snapshot
  }
  cached = normalise(snapshot.products as DemoRow[]);
  return cached;
}
