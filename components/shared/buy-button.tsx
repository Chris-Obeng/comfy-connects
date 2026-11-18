"use client";
import Link from "next/link";
import { toast } from "sonner";
import { useBagUI, useCart } from "@/store/cart";
import { haptic } from "@/lib/haptics";
import { buttonClass, type ButtonSize, type ButtonVariant } from "@/lib/button-class";
import type { Product } from "@/types";

/** A product the shopper can buy without choosing anything: one colour (or none), one option, in stock. */
export const buysInOneTap = (p: Product) =>
  p.colors.length <= 1 && p.sizes.length === 1 && p.sizes[0].stock > 0;

/**
 * "Buy" on a homepage tile. When there is nothing to choose, it puts the product straight
 * in the cart and shows the added card; otherwise it opens the product page to choose.
 */
export function BuyButton({
  product,
  label = "Buy",
  variant = "primary",
  size = "md",
  className,
}: {
  product: Product;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const add = useCart(s => s.add);
  const showAdded = useBagUI(s => s.showAdded);
  const classes = buttonClass({ variant, size, className });

  if (!buysInOneTap(product)) {
    return (
      <Link href={`/product/${product.slug}`} className={classes}>
        {label}
      </Link>
    );
  }

  function buy() {
    const line = add(product, product.colors[0]?.name ?? "", product.sizes[0].name, 1);
    if (!line) {
      toast.error("That’s all we have", { description: "Your cart already holds every unit we have." });
      return;
    }
    haptic("tap");
    showAdded({ ...line, quantity: 1 });
  }

  return (
    <button type="button" onClick={buy} className={classes} aria-label={`${label} ${product.name}`}>
      {label}
    </button>
  );
}
