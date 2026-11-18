# DESIGN.md

# Design

Reference pinned by the owner: apple.com and beatsbydre.com. Image-led, generous, very little text. Mobile first.

## Colour

- Ground: white `--canvas`; large quiet fields in `--mist #f5f5f7`; ink `#111`; secondary text `--ink-soft #595959`; hairlines `--line #e2e2e2`.
- Colour comes from the products. Every product carries one tint from a small family per shelf — sage for bags, warm sand for power, cool grey for audio, lavender-grey for wearables, stone for accessories (see `data/core-products.ts`). Cards, gallery, thumbnails and hero panels all sit on that tint.
- Studio shots use `mix-blend-mode: multiply` (`.tint-media img[data-studio]`) so white sweeps melt into the tint. All product images are trimmed and re-centred on a square canvas (`scripts` note in README) so every product sits at a similar scale.
- Hero field: the logo's mint `#eefbe8`. Feature bands are near-black `#22201f` with white copy.
- One accent: the logo's deep red `--brand #982427` — "New" labels, the bag badge, focus rings, sale prices, the eyebrow in the hero. Mint `--brand-soft` for soft callouts. No other accents.

## Type

Hanken Grotesk (next/font, variable) for everything. Display: regular weight, tight tracking, `1.06` leading (`.display`) — weight comes from size. Section titles use `.headline` (semibold, `-0.01em`). Body 15–17px; supporting text never below 12px and never lighter than 60% ink on white.

## Shape and controls

- Product tiles 20–22px radius, big panels 26–28px, buttons full pills, minimum touch target 44px.
- Buttons: `.btn` with `.btn-primary` (ink), `.btn-outline` (ink hairline, fills on hover), `.btn-soft`, `.btn-light`; sizes `.btn-sm` / `.btn-lg`; commerce actions add `.btn-caps`.
- Icons: lucide-react at 1.6–1.8 stroke. Brand marks (TikTok, WhatsApp) live in `components/shared/social-icons.tsx`.

## Motion

- Response on press, never after release: everything pressable scales to 0.97 with a 160ms `--ease-out`.
- One authored entrance: the hero copy and panels settle in once (`hero-settle`, `rise-in`).
- Card hover swaps to the second photo (pointer devices only). Added-to-cart drops a card under the header, bumps the bag badge, and ticks a haptic on phones.
- No autoplaying carousels. No keyboard-triggered animation. Reduced motion removes movement and delays, keeps cross-fades.

## Copy

Short, concrete, no hype. Name the price, the shop and the wait. Never invent reviews, stock claims or delivery promises.
