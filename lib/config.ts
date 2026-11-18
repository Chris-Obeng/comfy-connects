const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "233591391901").replace(/\D/g, "");

/**
 * Store identity. Everything here was read off the store's own TikTok profile
 * (@comfyconnects) and the captions on its videos.
 */
export const site = {
  name: "Comfy Connects",
  tagline: "Your gadget plug.",
  // Both shops are named in every product caption on the store's TikTok.
  location: "Koforidua · Kasoa",
  city: "Koforidua & Kasoa, Ghana",
  stores: [
    { id: "koforidua", name: "Koforidua", address: "Antarctic Plaza, Shop 11", area: "Eastern Region" },
    { id: "kasoa", name: "Kasoa", address: "Official Town, near JD", area: "Central Region" },
  ],
  tiktok: "https://www.tiktok.com/@comfyconnects",
  tiktokHandle: "@comfyconnects",
  tiktokFollowers: "17.9K",
  whatsapp: whatsappNumber,
  phoneDisplay: "059 139 1901",
  phoneHref: "tel:+233591391901",
};

/** WhatsApp deep link with an optional prefilled message. */
export function whatsappHref(message?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/* ------------------------------------------------------------------------------------------------
 * Delivery across Ghana. The two shops sit in the Eastern and Central regions, so those regions
 * are priced by town with a dispatch rider; every other region ships by courier at a flat rate.
 * All fees are placeholder pesewas — confirm the real rider and courier rates before launch.
 * ---------------------------------------------------------------------------------------------- */
export const LOCAL_REGIONS = ["Eastern", "Central"] as const;
export const isLocalRegion = (region?: string) =>
  !!region && (LOCAL_REGIONS as readonly string[]).includes(region);

export const localAreas: Record<string, { name: string; fee: number }[]> = {
  Eastern: [
    { name: "Koforidua", fee: 2000 },
    { name: "Suhum", fee: 3500 },
    { name: "Nsawam", fee: 3500 },
    { name: "Other town in Eastern", fee: 4500 },
  ],
  Central: [
    { name: "Kasoa", fee: 2000 },
    { name: "Winneba", fee: 3500 },
    { name: "Cape Coast", fee: 4000 },
    { name: "Other town in Central", fee: 4500 },
  ],
};

export const regions = [
  { name: "Greater Accra", fee: 5000 },
  { name: "Eastern", fee: 0 },
  { name: "Central", fee: 0 },
  { name: "Ashanti", fee: 6000 },
  { name: "Volta", fee: 6500 },
  { name: "Western", fee: 7000 },
  { name: "Bono", fee: 8000 },
  { name: "Bono East", fee: 8000 },
  { name: "Ahafo", fee: 8000 },
  { name: "Western North", fee: 8000 },
  { name: "Oti", fee: 9000 },
  { name: "Northern", fee: 9000 },
  { name: "Savannah", fee: 10000 },
  { name: "North East", fee: 10000 },
  { name: "Upper East", fee: 10000 },
  { name: "Upper West", fee: 10000 },
] as const;

export const pickup = {
  label: `Pick up free, ${site.stores.map(s => s.name).join(" or ")}`,
  eta: "Ready in 2 hours",
};

/** The shop a pickup order is collected from. */
export type StoreBranch = (typeof site.stores)[number];
export const storeBranches = site.stores;
export const findBranch = (id?: string) => site.stores.find(s => s.id === id);

/** Fee + ETA for a delivery address. Returns null until enough is known to quote. */
export function deliveryQuote(region?: string, area?: string): { fee: number; eta: string } | null {
  if (!region) return null;
  if (isLocalRegion(region)) {
    const list = localAreas[region] ?? [];
    const a = list.find(x => x.name === area);
    return a ? { fee: a.fee, eta: "Same or next day" } : null;
  }
  const r = regions.find(x => x.name === region);
  return r ? { fee: r.fee, eta: "2–4 working days" } : null;
}

/** Cheapest fee anywhere, for "from GH₵ x" copy. */
export const minDeliveryFee = Math.min(...Object.values(localAreas).flat().map(a => a.fee));
