/**
 * Client-friendly product search: tokenised prefix matching with gadget synonyms,
 * ranked so name matches beat category/colour/description matches. Pure functions,
 * shared by the search dialog and the /shop?q= results page.
 */

/** Words that should find each other. Each group is matched in both directions. */
const SYNONYMS: string[][] = [
  ["bag", "bags", "backpack", "backpacks", "rucksack", "tote", "totebag", "crossbody", "sling", "sleeve", "pouch", "laptopbag"],
  ["power", "powerbank", "bank", "charger", "charging", "battery", "adapter", "fastcharge", "mah", "port", "cable"],
  ["glasses", "glass", "eyewear", "sunglasses", "smartglasses", "ai", "camera"],
  ["watch", "watches", "smartwatch", "band", "wearable", "tracker"],
  ["stand", "holder", "mount", "magstand", "desk", "foldable", "magnetic"],
  ["laptop", "laptops", "macbook", "notebook", "computer"],
  ["phone", "phones", "smartphone", "iphone", "android", "samsung", "mobile"],
  ["tablet", "tablets", "ipad", "pad"],
  ["earbuds", "airpods", "headphones", "earphones", "audio", "speaker", "sound"],
  ["wiwu", "warriors"],
  ["accessory", "accessories", "gadget", "gadgets", "tech"],
];

const synonymMap = new Map<string, string[]>();
for (const group of SYNONYMS) for (const word of group) synonymMap.set(word, group);

export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const words = (text: string) => normalize(text).split(" ").filter(Boolean);

/** Expand a product's searchable text with every synonym of the words it contains. */
export function buildKeywords(parts: string[]) {
  const set = new Set<string>();
  for (const w of words(parts.join(" "))) {
    set.add(w);
    synonymMap.get(w)?.forEach(s => set.add(s));
  }
  return [...set].join(" ");
}

export type Searchable = { name: string; categoryName: string; colors: string[]; keywords: string };

/** 0 when the product doesn't match every query token; higher is better. */
export function score(item: Searchable, query: string) {
  const tokens = words(query);
  if (!tokens.length) return 0;
  const name = normalize(item.name);
  const nameWords = name.split(" ");
  const other = words(`${item.categoryName} ${item.colors.join(" ")}`);
  const keys = item.keywords.split(" ");
  let total = 0;
  for (const t of tokens) {
    const alts = synonymMap.get(t) ?? [t];
    let best = 0;
    if (name.startsWith(t)) best = 6;
    else if (nameWords.some(w => w.startsWith(t))) best = 4;
    else if (nameWords.some(w => alts.includes(w))) best = 3;
    else if (other.some(w => w.startsWith(t))) best = 2;
    else if (keys.some(w => w.startsWith(t) || alts.includes(w))) best = 1;
    if (!best) return 0;
    total += best;
  }
  return total;
}

export function search<T extends Searchable>(items: T[], query: string): T[] {
  return items
    .map((item, i) => ({ item, s: score(item, query), i }))
    .filter(r => r.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map(r => r.item);
}

/** Split `text` into [before, match, after]-style parts for highlighting query tokens in names. */
export function highlight(text: string, query: string): { text: string; hit: boolean }[] {
  const tokens = words(query).filter(t => t.length > 0);
  if (!tokens.length) return [{ text, hit: false }];
  const pattern = new RegExp(`\\b(${tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts: { text: string; hit: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    const start = m.index ?? 0;
    if (start > last) parts.push({ text: text.slice(last, start), hit: false });
    parts.push({ text: m[0], hit: true });
    last = start + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), hit: false });
  return parts;
}
