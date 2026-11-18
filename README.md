# Comfy Connects

Storefront for [Comfy Connects](https://www.tiktok.com/@comfyconnects), the gadget shop in Koforidua (Antarctic Plaza, Shop 11) and Kasoa (Official Town, near JD). Next.js 16 (App Router, Turbopack), Tailwind v4, HeroUI, Zustand. Frontend only for now; Supabase and an admin dashboard come next.

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build && pnpm start
```

## Catalogue

Two shelves, merged in `lib/products.ts`:

1. **The shop's own line-up** — `data/core-products.ts`. 24 products with per-product stock, colours and options: the WiWU bags and backpacks the shop posts on TikTok, the LENYES shoulder bag, the S2 Max smart glasses, the Phone Planet Hybrid Max, plus the same brands' power banks, chargers, cables, earbuds, stands and cases. Prices are integer pesewas (100 = GH₵1) and match the shop's own TikTok captions where a caption quoted one.
2. **A labelled demo shelf** — `data/demo-catalog.json`, filled from the free [DummyJSON](https://dummyjson.com) API by `lib/catalog/demo-api.ts`. It only appears under **Shop → Laptops & phones**, and never on the homepage or in "All". Refresh it with `pnpm sync:catalog`.

### Photography

Every image in `public/products/<slug>/` is the manufacturer's own studio shot, downloaded from wiwu.com and lenyes.com (plus saska.ae and coc-tech.com for the S2 Max). Each is trimmed of its white sweep, re-centred on a square canvas and saved at 1100px, so every product sits at a similar scale inside its card. Nothing hotlinks somebody else's CDN.

To add a product:

1. Drop 2–5 photos into `public/products/<slug>/` as `1.jpg`, `2.jpg`, …
2. Add an entry to `data/core-products.ts`. `shots: n` builds the image list; give it a `tint` from the shelf's colour family and a `category` (`bags`, `power`, `audio`, `wearables`, `accessories`).
3. Add a category tile or homepage slot in `data/categories.ts` if the shelf needs one.

Prices and stock are the shop's own numbers; when Supabase lands, swap the readers in `lib/products.ts` and the payment boundary in `lib/payments.ts` (Paystack is mocked).

## Where things live

| Path | What |
| --- | --- |
| `app/(storefront)` | Home, shop, product, orders |
| `app/checkout` | Guest checkout: nationwide delivery, or free pickup from either shop |
| `components/shared` | Header, footer, product card, search |
| `lib/config.ts` | Store identity, both branches, delivery regions and fees, WhatsApp helper |
| `lib/checkout-schema.ts` | Checkout validation, including the pickup branch |
| `lib/search.ts` | Search ranking and gadget synonyms |
| `lib/haptics.ts` | Haptic tick on add-to-bag and order placed |
| `PRODUCT.md` / `DESIGN.md` | Product truth and the visual system |

## Stores

| Shop | Address |
| --- | --- |
| Koforidua | Antarctic Plaza, Shop 11 |
| Kasoa | Official Town, near JD |

WhatsApp and calls: 059 139 1901.
