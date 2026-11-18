"use client";
import Link from "next/link";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useBagUI, useCart, cartSubtotal, cartCount } from "@/store/cart";
import { ResponsivePanel } from "@/components/shared/responsive-panel";
import { EmptyBag } from "@/components/shared/empty-bag";
import { ProductThumb } from "@/components/shared/product-thumb";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { buttonClass } from "@/lib/button-class";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/types";

function variantLine(item: CartItem) {
  return [item.color, item.size !== "Standard" ? item.size : null].filter(Boolean).join(" · ");
}

export function CartPanel() {
  const open = useBagUI(s => s.open);
  const setOpen = useBagUI(s => s.setOpen);
  const items = useCart(s => s.items);
  const remove = useCart(s => s.remove);
  const restore = useCart(s => s.restore);
  const updateQuantity = useCart(s => s.updateQuantity);
  const count = cartCount(items);
  const subtotal = cartSubtotal(items);

  function onRemove(item: CartItem) {
    const index = items.findIndex(i => i.key === item.key);
    remove(item.key);
    toast(`Removed ${item.name}`, { action: { label: "Undo", onClick: () => restore(item, index) } });
  }

  const footer = items.length ? (
    <div className="safe-bottom shrink-0 border-t border-hairline bg-white px-5 pt-4 md:px-6">
      <div className="flex items-baseline justify-between">
        <span className="text-[17px] font-semibold text-ink">Subtotal</span>
        <span className="text-[21px] font-semibold tracking-[-0.02em] tabular-nums text-ink">{formatPrice(subtotal)}</span>
      </div>
      <Link href="/checkout" onClick={() => setOpen(false)} className={buttonClass({ size: "lg", className: "mt-4 w-full" })}>
        <Lock className="size-4" aria-hidden /> Check out
      </Link>
    </div>
  ) : null;

  return (
    <ResponsivePanel
      open={open}
      onOpenChange={setOpen}
      title="Your cart"
      meta={count ? `${count} ${count === 1 ? "item" : "items"}` : undefined}
      footer={footer}
    >
      {items.length === 0 ? (
        <EmptyBag onBrowse={() => setOpen(false)} />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 md:px-6">
          <ul role="list">
            {items.map(item => (
              <li key={item.key} className="flex gap-4 border-b border-hairline py-5 last:border-0">
                <Link href={`/product/${item.slug}`} onClick={() => setOpen(false)} aria-label={`View ${item.name}`} className="press">
                  <ProductThumb src={item.image} cutout={item.cutout} alt={item.name} sizes="88px" className="size-[88px] rounded-[14px]" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="text-[15px] font-semibold leading-5 tracking-[-0.01em] text-ink hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="shrink-0 text-[15px] tabular-nums text-ink">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                  {variantLine(item) && <p className="mt-1 text-[13px] text-ink-soft">{variantLine(item)}</p>}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                    <QuantityStepper
                      size="sm"
                      value={item.quantity}
                      max={item.maxStock}
                      onChange={n => updateQuantity(item.key, n)}
                      label={item.name}
                    />
                    <button
                      type="button"
                      onClick={() => onRemove(item)}
                      className="press min-h-11 px-1 text-[13px] text-ink-soft underline decoration-line underline-offset-4 hover:text-ink"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ResponsivePanel>
  );
}
