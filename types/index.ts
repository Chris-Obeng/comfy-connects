/** Product families used by the shop filters and the category row. */
export type CategoryId = "bags" | "power" | "audio" | "wearables" | "accessories" | "devices";

export type ProductColor = { name: string; hex: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  story: string;
  images: string[];
  /** True when every image is a cut-out or white-background studio shot, shown contained on the tint. */
  cutout: boolean;
  /** Soft colour field the product sits on (cards, gallery, thumbnails). */
  tint: string;
  category: CategoryId;
  colors: ProductColor[];
  /** The one choice a buyer makes: capacity, size, fit. A single "Standard" value hides the picker. */
  sizes: { name: string; stock: number }[];
  /** What that choice is called in the UI. Defaults to "Size". */
  variantLabel?: string;
  /** "new" drives the New badges, "featured" the home rails, "deal" marks a marked-down price. */
  tags: ("new" | "featured" | "deal")[];
  details: string[];
  /** Where the record came from: the store's own shelf, or the demo product API. */
  source?: "store" | "demo";
  /** Brand line shown on the product page (WiWU, LENYES, Phone Planet…). */
  brand?: string;
};

// All amounts are integer pesewas (100 pesewas = GH₵1).
export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** Optional so bags saved before these fields existed still render. */
  tint?: string;
  cutout?: boolean;
  price: number;
  color: string;
  size: string;
  quantity: number;
  maxStock: number;
};

export type DeliveryMethod = "delivery" | "pickup";
export type PaymentMethod = "momo" | "card";

export type Order = {
  id: string; /** Epoch ms, set when the order is saved. */
  createdAt?: number;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customer: { name: string; phone: string; email?: string };
  delivery: { method: DeliveryMethod; /** Shop id for pickup orders. */ branch?: string; region?: string; city?: string; area?: string; address?: string; notes?: string; eta?: string };
  payment?: PaymentMethod;
};

// Minimal product shape for client-side search over the catalog.
export type SearchItem = {
  slug: string;
  name: string;
  price: number;
  category: string;
  categoryName: string;
  image: string;
  tint: string;
  cutout: boolean;
  soldOut: boolean;
  isNew: boolean;
  colors: string[];
  keywords: string;
};
