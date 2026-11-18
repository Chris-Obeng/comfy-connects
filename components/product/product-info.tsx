"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, MessageCircle, Store, Truck } from "lucide-react";
import { toast } from "sonner";
import { useBagUI, useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { pickup, site, whatsappHref } from "@/lib/config";
import { cn } from "@/lib/utils";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import type { Product } from "@/types";

const oneSize = (p: Product) => p.sizes.length === 1;
/** "Size" by default; power banks say Capacity, cases say Model. */
const variantLabel = (p: Product) => p.variantLabel ?? "Size";

/** Title block. Above the gallery on phones (as Beats does), beside it from tablet up. */
export function ProductTitle({ product, className }: { product: Product; className?: string }) {
  const status = product.compareAtPrice ? "Sale" : product.tags.includes("new") ? "New" : null;
  return (
    <div className={className}>
      {status && <p className="text-[14px] font-medium text-brand">{status}</p>}
      <h1 className="display mt-0.5 text-[32px] text-ink sm:text-[40px] lg:text-[44px]">{product.name}</h1>
    </div>
  );
}

function Price({ product, className }: { product: Product; className?: string }) {
  return (
    <p className={cn("tabular-nums", className)}>
      <span className={product.compareAtPrice ? "text-brand" : "text-ink"}>{formatPrice(product.price)}</span>
      {product.compareAtPrice && <s className="ml-2 text-[0.8em] text-ink-soft">{formatPrice(product.compareAtPrice)}</s>}
    </p>
  );
}

export function ProductInfo({ product }: { product: Product }) {
  const single = oneSize(product);
  const label = variantLabel(product);
  const labelLower = label.toLowerCase();
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  // With more than one option, nothing is preselected: a wrong default is worse than one extra tap.
  const [size, setSize] = useState(single ? product.sizes[0]?.name ?? "" : "");
  const [needSize, setNeedSize] = useState(false);
  const [nudge, setNudge] = useState(0);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [ctaVisible, setCtaVisible] = useState(true);
  const items = useCart(s => s.items);
  const add = useCart(s => s.add);
  const showAdded = useBagUI(s => s.showAdded);
  const sizesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // The phone buy bar only shows while the page's own button is off screen, so there is never two.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting), { rootMargin: "0px 0px -40px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const allSoldOut = product.sizes.every(s => s.stock === 0);
  const selectedSize = product.sizes.find(s => s.name === size);
  // Quantity is capped by what's left in the chosen option after what's already in the cart.
  const inCart = (name: string) => items.find(i => i.key === `${product.id}:${color}:${name}`)?.quantity ?? 0;
  const maxQty = Math.max(1, selectedSize ? selectedSize.stock - inCart(selectedSize.name) : Math.max(...product.sizes.map(s => s.stock)));
  const qty = Math.min(quantity, maxQty);
  const lowStock = selectedSize && selectedSize.stock > 0 && selectedSize.stock <= 3 ? selectedSize.stock : null;

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
    <span className="flex items-center gap-2"><Check className="size-5" aria-hidden /> Added</span>
  ) : !selectedSize ? `Choose ${labelLower === "size" ? "a size" : `a ${labelLower}`}` : "Add to cart";

  const ask = whatsappHref(`Hi Comfy Connects, I'm asking about the ${product.name}.`);

  return (
    <>
      <div className="min-w-0 md:sticky md:top-20 md:self-start md:pt-2">
        <ProductTitle product={product} className="hidden md:block" />
        <Price product={product} className="text-[21px] md:mt-3 md:text-[24px]" />
        <p className="mt-2 max-w-[44ch] text-[15px] leading-[1.45] text-ink-soft sm:text-[17px]">{product.description}</p>
        <p className="mt-3 flex items-center gap-1.5 text-[14px]">
          {allSoldOut ? (
            <span className="text-ink-soft">Sold out. Ask us about the next delivery.</span>
          ) : lowStock ? (
            <span className="font-medium text-brand">Only {lowStock} left</span>
          ) : (
            <>
              <Check className="size-4 text-ink" strokeWidth={2.2} aria-hidden />
              <span className="text-ink">In stock</span>
              <span className="text-ink-soft">· pickup {pickup.eta.toLowerCase()}</span>
            </>
          )}
        </p>

        {product.colors.length > 0 && (
          <div className="mt-7 border-t border-hairline pt-6">
            <p className="text-[14px]" id="colour-label">
              <span className="text-ink-soft">Colour</span> <span className="ml-1 font-medium text-ink">{color}</span>
            </p>
            <div role="radiogroup" aria-labelledby="colour-label" className="mt-3 flex flex-wrap gap-3">
              {product.colors.map(c => {
                const selected = color === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={c.name}
                    onClick={() => setColor(c.name)}
                    className={cn(
                      "press flex size-11 items-center justify-center rounded-full ring-offset-2 transition-shadow",
                      selected ? "ring-2 ring-ink" : "ring-1 ring-transparent hover:ring-line"
                    )}
                  >
                    <span className="size-8 rounded-full ring-1 ring-inset ring-black/15" style={{ backgroundColor: c.hex }} aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!single && (
          <div ref={sizesRef} className="mt-6 scroll-mt-24">
            <p className="text-[14px]" id="size-label">
              <span className="text-ink-soft">{label}</span>{" "}
              <span className={cn("ml-1 font-medium", needSize ? "text-brand" : "text-ink")}>{size || (needSize ? `Choose a ${labelLower}` : "")}</span>
            </p>
            <div
              key={nudge}
              role="radiogroup"
              aria-labelledby="size-label"
              className={cn("mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3", nudge > 0 && needSize && "size-nudge")}
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
                    "press h-12 rounded-[12px] border px-3 text-[15px] tabular-nums transition-colors",
                    size === s.name ? "border-ink bg-white font-medium text-ink ring-1 ring-ink" : needSize ? "border-brand/60 bg-white text-ink" : "border-line bg-white text-ink hover:border-ink/60",
                    s.stock === 0 && "cursor-not-allowed border-dashed bg-soft text-ink-soft line-through hover:border-line"
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={ctaRef} className={cn("flex gap-3", product.colors.length > 0 || !single ? "mt-7" : "mt-7 border-t border-hairline pt-6")}>
          {!allSoldOut && (
            <QuantityStepper value={qty} max={maxQty} onChange={n => setQuantity(Math.max(1, Math.min(maxQty, n)))} label={product.name} />
          )}
          <button type="button" onClick={addToBag} disabled={allSoldOut} className="btn btn-primary btn-lg min-w-0 flex-1 px-4">
            {ctaLabel}
          </button>
        </div>

        <ul role="list" className="mt-8 space-y-5 border-t border-hairline pt-6">
          {[
            { icon: Store, title: "Free pickup", text: `${pickup.eta} at ${site.stores.map(x => x.name).join(" or ")}.` },
            { icon: Truck, title: "Delivery nationwide", text: "Same or next day in Koforidua and Kasoa. 2–4 days elsewhere." },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3.5">
              <Icon className="mt-0.5 size-[22px] shrink-0 stroke-[1.5] text-ink" aria-hidden />
              <p className="text-[14px] leading-5">
                <span className="block font-semibold text-ink">{title}</span>
                <span className="text-ink-soft">{text}</span>
              </p>
            </li>
          ))}
          <li className="flex gap-3.5">
            <MessageCircle className="mt-0.5 size-[22px] shrink-0 stroke-[1.5] text-ink" aria-hidden />
            <p className="text-[14px] leading-5">
              <span className="block font-semibold text-ink">Questions?</span>
              <a href={ask} target="_blank" rel="noreferrer" className="text-ink-soft underline decoration-line underline-offset-4 hover:text-ink hover:decoration-ink">
                WhatsApp us about this one
              </a>
            </p>
          </li>
        </ul>

        <div className="mt-8 border-t border-hairline">
          {[
            { title: "Overview", body: <p className="text-[15px] leading-[1.55] text-ink-soft">{product.story}</p> },
            {
              title: "Specs",
              body: (
                <ul role="list" className="space-y-2 text-[15px] leading-[1.45] text-ink-soft">
                  {product.details.map(d => (
                    <li key={d} className="flex gap-2.5">
                      <span className="mt-[0.6em] size-1 shrink-0 rounded-full bg-ink-soft" aria-hidden />
                      {d}
                    </li>
                  ))}
                </ul>
              ),
            },
          ].map(({ title, body }) => (
            <details key={title} className="disclosure group border-b border-hairline">
              <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 text-[17px] font-semibold tracking-[-0.015em] text-ink">
                {title}
                <ChevronDown className="size-5 text-ink-soft" aria-hidden />
              </summary>
              <div className="pb-6">{body}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Phones: buy bar, only while the button above is off screen. */}
      <div
        data-sticky-cta
        data-show={!ctaVisible}
        inert={ctaVisible}
        aria-hidden={ctaVisible}
        className="buy-bar translucent safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-white/85 px-4 pt-3 backdrop-blur-xl backdrop-saturate-[1.8] md:hidden"
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-ink">{product.name}</p>
            <Price product={product} className="text-[14px]" />
          </div>
          <button type="button" onClick={addToBag} disabled={allSoldOut} className="btn btn-primary min-w-[150px]">
            {ctaLabel}
          </button>
        </div>
      </div>
    </>
  );
}
