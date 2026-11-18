# PRODUCT.md

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web (mobile first; almost every shopper arrives from TikTok on a phone)

## Users

Shoppers in Ghana who follow Comfy Connects on TikTok (@comfyconnects, 17.9K followers) and want to buy a gadget they saw in a video. They are price-aware, they compare against other Accra gadget shops, and they want to know one thing fast: is it in stock, what does it cost, and how soon can I have it.

## Product Purpose

The online storefront for Comfy Connects, an electronics and accessories shop with two branches: Koforidua (Antarctic Plaza, Shop 11) and Kasoa (Official Town, near JD). Success: a shopper finds a gadget, understands the price and delivery, and checks out with as few taps as possible — delivered nationwide, or collected free from either shop.

## Positioning

A two-shop Ghanaian gadget dealer with a real TikTok audience, presented with the calm and precision of a global electronics retailer. Real brands (WiWU, LENYES, Phone Planet, S2 Max), real prices in cedis, real stock counts.

## Capabilities and Constraints

- Frontend only. Guest checkout: no accounts, wishlists or reviews. `lib/payments.ts` is the mock Paystack seam; `lib/orders.ts` keeps order history in localStorage.
- Catalogue: `data/core-products.ts` holds the shop's own line-up with per-product stock. Every photo is the manufacturer's own studio shot downloaded into `public/products/<slug>/`.
- A second, clearly labelled demo shelf (`data/demo-catalog.json`, DummyJSON via `lib/catalog/demo-api.ts`, refreshed with `pnpm sync:catalog`) fills the "Laptops & phones" tab only. It never appears on the homepage or in "All".
- Prices are integer pesewas (100 pesewas = GH₵1). Store prices come from the shop's own TikTok captions where a caption quoted one; the rest are set to local retail, editable in one file.
- Delivery: same or next day in Koforidua and Kasoa, 2–4 days by courier elsewhere. Fees live in `lib/config.ts`.
- Keep it simple. No feature ships unless it shortens the path from "I saw this" to "it's in my cart".

## Brand Commitments

- Name: Comfy Connects. Tagline in use: "Your gadget plug."
- Logo: the shop's own mark — mint tile, charcoal C, small red mark — in `public/logo.jpeg` (plus `app/icon.png`, `app/apple-icon.png`, generated from it). Never redraw it.
- Verified channels: TikTok https://www.tiktok.com/@comfyconnects, WhatsApp / call 059 139 1901.
- Two shops, both named on the homepage, footer and checkout pickup step.

## Evidence on Hand

Manufacturer studio photography for every product; the shop's own prices from its TikTok captions for the Warriors X Pro (GH₵850), Hybrid Max (GH₵400), S2 Max glasses (GH₵550) and the phone stand (GH₵250). No reviews, testimonials or press — do not invent them.

## Product Principles

1. Fewer words, bigger pictures.
2. One obvious next action per screen.
3. Thumb first: primary controls at least 44px and within reach on a phone.
4. Trust through clarity: price, stock, delivery fee and pickup point are visible before payment.
