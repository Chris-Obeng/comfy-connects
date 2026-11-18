"use client";
import { useEffect, useRef, useState } from "react";
import { Check, MapPin, Truck } from "lucide-react";
import { toast } from "sonner";
import { useBagUI, useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { pickup, site } from "@/lib/config";
import { categoryName } from "@/data/categories";
import { cn } from "@/lib/utils";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import type { Product } from "@/types";

/** Check-icon contrast derived from swatch luminance. */
function swatchTextColor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.6 ? "#ffffff" : "#111111";
}

const oneSize = (p: Product) => p.sizes.length === 1;
/** "Size" by default; bags say Size, power banks say Capacity, straps say Strap. */
const variantLabel = (p: Product) => p.variantLabel ?? "Size";

/** Title block. Rendered above the gallery on phones (as Beats does), beside it on desktop. */
export function ProductTitle({ product, className }: { product: Product; className?: string }) {
  const isNew = product.tags.includes("new");
  return (
    <div className={className}>
      <p className="text-[13px]">
        {isNew && <span className="font-bold uppercase tracking-[0.04em] text-brand">New</span>}
        {isNew && <span className="text-ink-faint"> · </span>}
        <span className="text-ink-soft">{categoryName(product.category)}</span>
      </p>
      <h1 className="display mt-1 text-[32px] text-ink sm:text-[40px]">{product.name}</h1>
    </div>
  );
}

export function ProductInfo({ product }: { product: Product }) {
  const single = oneSize(product);
  const label = variantLabel(product);
  const labelLower = label.toLowerCase();
  const hasColors = product.colors.length > 0;
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  // Garments and shoes start unselected: a wrong default size is worse than one extra tap.
  const [size, setSize] = useState(single ? product.sizes[0]?.name ?? "" : "");
  const [needSize, setNeedSize] = useState(false);
  const [nudge, setNudge] = useState(0);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const items = useCart(s => s.items);
  const add = useCart(s => s.add);
  const showAdded = useBagUI(s => s.showAdded);
  const sizesRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const allSoldOut = product.sizes.every(s => s.stock === 0);
  const selectedSize = product.sizes.find(s => s.name === size);
  // Quantity is chosen here, capped by what's left in the chosen size after what's already in the cart.
  const inCart = (name: string) => items.find(i => i.key === `${product.id}:${color}:${name}`)?.quantity ?? 0;
  const maxQty = Math.max(1, selectedSize ? selectedSize.stock - inCart(selectedSize.name) : Math.max(...product.sizes.map(s => s.stock)));
  const qty = Math.min(quantity, maxQty);

  function addToBag() {
    if (allSoldOut) return;
    if (!selectedSize) {
      setNeedSize(true);
      setNudge(n => n + 1);
      sizesRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    const line = add(product, color, size, qty);
    if (!line) {
      toast.error("That’s all we have", { description: "Your cart already holds every unit we have in this option." });
      return;
    }
    haptic("tap");
    showAdded({ ...line, quantity: qty });
    setQuantity(1);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  }

  const ctaLabel = allSoldOut ? "Sold out" : added ? (
    <span className="flex items-center gap-2"><Check className="size-5" /> Added</span>
  ) : !selectedSize ? `Select ${labelLower === "size" ? "a size" : labelLower}` : "Add to cart";


  return (
    <>
      <div className="min-w-0 md:sticky md:top-24 md:self-start">
        <ProductTitle product={product} className="hidden md:block" />
        <div className="flex items-baseline gap-2.5 md:mt-3">
          <p className={cn("text-[22px] tabular-nums", product.compareAtPrice ? "text-sale" : "text-ink")}>
            {formatPrice(product.price)}
          </p>
          {product.compareAtPrice && <s className="text-[15px] tabular-nums text-ink-faint">{formatPrice(product.compareAtPrice)}</s>}
          {product.compareAtPrice && (
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[12px] font-semibold text-ink">
              Save {formatPrice(product.compareAtPrice - product.price)}
            </span>
          )}
        </div>
        {allSoldOut && (
          <p className="mt-3 flex items-center gap-1.5 text-[14px] font-medium text-ink-soft">
            <span className="size-2 rounded-full bg-ink-faint" aria-hidden />
            Sold out — ask us about the next delivery
          </p>
        )}

        {hasColors && (
          <div className="mt-7">
            <p className="text-[14px] text-ink-soft" id="colour-label">Colour:</p>
            <div role="group" aria-labelledby="colour-label" className="mt-2.5 flex flex-wrap gap-2.5">
              {product.colors.map(c => {
                const selected = color === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.name)}
                    aria-pressed={selected}
                    className={cn(
                      "press flex h-11 items-center gap-2.5 rounded-full border pr-3.5 pl-2 text-[14px]",
                      selected
                        ? "border-ink bg-mist font-semibold text-ink"
                        : "border-line text-ink hover:border-ink/40"
                    )}
                  >
                    <span
                      className="flex size-6 items-center justify-center rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: c.hex }}
                      aria-hidden
                    >
                      {selected && <Check className="size-3.5" strokeWidth={3} style={{ color: swatchTextColor(c.hex) }} />}
                    </span>
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!single && (
          <div ref={sizesRef} className="mt-7 scroll-mt-24">
            <p className="text-[14px]" id="size-label">
              <span className="text-ink-soft">{label}:</span>{" "}
              <span className={cn("font-semibold", needSize ? "text-brand" : "text-ink")}>{size || (needSize ? `Choose your ${labelLower}` : "Choose")}</span>
            </p>
            <div
              key={nudge}
              role="radiogroup"
              aria-labelledby="size-label"
              className={cn("mt-2 grid grid-cols-5 gap-2", nudge > 0 && needSize && "size-nudge")}
            >
              {product.sizes.map(s => (
                <button
                  key={s.name}
                  type="button"
                  role="radio"
                  aria-checked={size === s.name}
                  disabled={s.stock === 0}
                  onClick={() => { setSize(s.name); setNeedSize(false); }}
                  aria-label={s.stock === 0 ? `${s.name}, sold out` : s.name}
                  className={cn(
                    "press relative h-12 rounded-2xl border text-[15px] font-medium tabular-nums",
                    size === s.name ? "border-ink bg-ink text-white" : needSize ? "border-brand/50 bg-white text-ink" : "border-line bg-white text-ink hover:border-ink",
                    s.stock === 0 && "cursor-not-allowed border-dashed bg-soft text-ink-faint line-through decoration-ink-faint/60 hover:border-line"
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
            {selectedSize && selectedSize.stock > 0 && selectedSize.stock <= 3 && (
              <p className="mt-3 text-[13px] font-medium text-brand">Only {selectedSize.stock} left in {selectedSize.name}</p>
            )}
          </div>
        )}

        {!allSoldOut && (
          <div className="mt-7">
            <p className="text-[14px] text-ink-soft" id="qty-label">Quantity</p>
            <div className="mt-2">
              <QuantityStepper value={qty} max={maxQty} onChange={n => setQuantity(Math.max(1, Math.min(maxQty, n)))} label={product.name} />
            </div>
          </div>
        )}

        <div className="mt-8 hidden md:block">
          <button type="button" onClick={addToBag} disabled={allSoldOut} className="btn btn-primary btn-caps w-full">
            {ctaLabel}
          </button>
        </div>

        <ul role="list" className="mt-8 grid gap-3 rounded-[20px] bg-mist p-4">
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-[18px] shrink-0 text-ink" aria-hidden />
            <span className="text-[14px] leading-6 text-ink/75">
              <strong className="font-semibold text-ink">Free pickup.</strong> {pickup.eta} in {site.stores.map(x => x.name).join(" or ")}.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Truck className="mt-0.5 size-[18px] shrink-0 text-ink" aria-hidden />
            <span className="text-[14px] leading-6 text-ink/75">
              <strong className="font-semibold text-ink">Delivery nationwide.</strong> Same or next day in Koforidua and Kasoa, 2–4 days elsewhere.
            </span>
          </li>
        </ul>
      </div>

      {/* Phones: Beats-style floating buy bar */}
      <div data-sticky-cta className="translucent safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-white/90 px-4 pt-3 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-ink-soft">{[color, !single && size ? `${label} ${size}` : null].filter(Boolean).join(" · ") || product.name}</p>
            <p className={cn("text-[18px] tabular-nums", product.compareAtPrice ? "text-sale" : "text-ink")}>{formatPrice(product.price)}</p>
          </div>
          <button type="button" onClick={addToBag} disabled={allSoldOut} className="btn btn-primary btn-caps min-w-[176px]">
            {ctaLabel}
          </button>
        </div>
      </div>
    </>
  );
}
