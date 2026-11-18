"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

type CartState = {
  items: CartItem[];
  /** Returns the line that was added or bumped, or null when stock/variant rules reject it. */
  add: (product: Product, color: string, size: string, quantity: number) => CartItem | null;
  remove: (key: string) => void;
  restore: (item: CartItem, index: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(persist((set, get) => ({
  items: [],
  add: (product, color, size, quantity) => {
    const maxStock = product.sizes.find(s => s.name === size)?.stock ?? 0;
    // Colour is optional on catalogues that ship one finish (most gadgets here).
    if ((product.colors.length > 0 && !product.colors.some(c => c.name === color)) || !Number.isInteger(quantity) || quantity < 1) return null;
    const key = `${product.id}:${color}:${size}`;
    const existing = get().items.find(i => i.key === key);
    if ((existing?.quantity ?? 0) + quantity > maxStock) return null;
    const line: CartItem = existing
      ? { ...existing, quantity: existing.quantity + quantity }
      : {
          key, productId: product.id, slug: product.slug, name: product.name, image: product.images[0],
          tint: product.tint, cutout: product.cutout, price: product.price, color, size, quantity, maxStock,
        };
    set(state => ({ items: existing ? state.items.map(i => (i.key === key ? line : i)) : [...state.items, line] }));
    return line;
  },
  remove: key => set(s => ({ items: s.items.filter(i => i.key !== key) })),
  restore: (item, index) => set(s => {
    if (s.items.some(i => i.key === item.key)) return s;
    const items = [...s.items];
    items.splice(Math.min(index, items.length), 0, item);
    return { items };
  }),
  updateQuantity: (key, quantity) => set(s => ({ items: s.items.map(i => i.key === key ? { ...i, quantity: Math.max(1, Math.min(i.maxStock, Math.floor(quantity) || 1)) } : i) })),
  clear: () => set({ items: [] }),
}), {
  name: "comfy-connects-cart",
  // v4: the catalogue changed completely from the fashion build.
  version: 4,
  migrate: () => ({ items: [] }) as unknown as CartState,
  skipHydration: true,
}));

export const cartSubtotal = (items: CartItem[]) => items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export const cartCount = (items: CartItem[]) => items.reduce((sum, i) => sum + i.quantity, 0);

type BagUI = {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Drives the "Added to bag" confirmation card. `at` re-triggers it for repeat adds. */
  added: { item: CartItem; at: number } | null;
  showAdded: (item: CartItem) => void;
  hideAdded: () => void;
};

export const useBagUI = create<BagUI>(set => ({
  open: false,
  setOpen: open => set(open ? { open, added: null } : { open }),
  added: null,
  showAdded: item => set({ added: { item, at: Date.now() } }),
  hideAdded: () => set({ added: null }),
}));
