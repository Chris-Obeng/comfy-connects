# Design

Reference pinned by the owner: the Apple Store (apple.com/store, apple.com homepage tiles) and beatsbydre.com. Image-led, generous, very little text. Mobile first.

## Colour

- Ground: white `--canvas`; the Apple grey field `--mist #f5f5f7` for shelves, the shop page, the footer and cart thumbnails; ink `--ink #1d1d1f`; secondary text `--ink-soft #6e6e73` (5.1:1 on white, 4.7:1 on mist); hairlines `--hairline #e8e8ed`, stronger rules `--line #d2d2d7`. `--ink-faint` is for icons only, never text.
- Colour comes from the products. Homepage tiles and the product gallery sit on the product's own pastel `tint` (see `data/core-products.ts` and `editorial` in `data/categories.ts`). Studio shots use `mix-blend-mode: multiply` (`.tint-media img[data-studio]`) so the white sweep melts into the tint. An element with a transform starts a new stacking context, so its parent link must carry `.tint-media` too or the white box shows.
- Product cards are white tiles on the grey field; the studio shot's own white sweep is the card.
- One accent: the logo's deep red `--brand #982427` for "New" and "Sale" labels, sale prices, the cart badge, focus rings and the reassurance icons. Mint `--brand-soft #eefbe8` is the hero field and selection colour. No other accents.

## Type

Hanken Grotesk (next/font, variable). Body 17px / 1.47, tracking -0.012em. Display (`.display`) is semibold, leading 1.05, tracking -0.028em; section titles (`.headline`) semibold, -0.022em. Apple's two-tone title: `SectionHeading title="The latest." tone="New on the shelf."` sets the second sentence in `--ink-soft`. No eyebrows or kickers above headings.

## Layout

- Homepage, top to bottom: hero tile (one product, name, one line, price, Buy + Learn more) → category row (products floating on white) → "The latest." shelf on grey → two half tiles and one wide tile with 12px gutters → "Top picks." grid on grey → two shops and four facts → footer. Each product appears once on the page.
- Shelves (`ProductRail`) scroll card by card, bleed to the screen edge and line up with the container (`.rail`). Pointer devices get round arrows under the row.
- Product page: name above the gallery on phones, beside it from tablet up; price, one-line description, stock; colour circles; option buttons; quantity + Add to cart; pickup, delivery and WhatsApp rows; Overview and Specs disclosures. The phone buy bar appears only while the page's own button is off screen.

## Shape and controls

- Cards 18px radius, tiles full-bleed, gallery 24px, fields 12px, buttons full pills. Touch targets at least 44px; the main buy button is 52px.
- Buttons: `.btn` with `.btn-primary` (ink), `.btn-outline` (ink hairline, fills on hover), `.btn-soft`, `.btn-light`; sizes `.btn-sm` / `.btn-lg`. Sentence case ("Add to cart", "Check out").
- `BuyButton` adds a product straight to the cart when there is nothing to choose; otherwise it opens the product page.
- Icons: lucide-react at 1.5–1.8 stroke. Brand marks (TikTok, WhatsApp) live in `components/shared/social-icons.tsx`.

## Motion

- Response on press: pressables scale to 0.97 (cards 0.98) with a 160ms `--ease-out`.
- One authored entrance: the hero copy rises and the hero photo settles (`hero-copy`, `hero-media`).
- Cards lift with a soft shadow and swap to the second shot on hover (pointer devices only). The buy bar slides on `--ease-drawer`. Added-to-cart drops a card under the header, bumps the badge and ticks a haptic.
- No autoplaying carousels. No keyboard-triggered animation. Reduced motion removes movement and keeps fades.

## Copy

Short, concrete, no hype. Name the price, the shop and the wait. Tile lines come from the product record. Never invent reviews, stock claims or delivery promises.
