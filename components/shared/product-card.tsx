import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const soldOut = (p: Product) => p.sizes.every(s => s.stock === 0);

/**
 * Apple Store / Beats shelf card: a white tile on the grey field. The studio shot floats on
 * white (its own sweep), with "New" in the logo red, the name, the price and colour dots.
 * The whole tile is one link; hover swaps to the second shot on pointer devices.
 */
export function ProductCard({
  product,
  preload = false,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
}: {
  product: Product;
  preload?: boolean;
  sizes?: string;
}) {
  const isSoldOut = soldOut(product);
  const isNew = product.tags.includes("new");
  const href = `/product/${product.slug}`;
  const fit = product.cutout ? "object-contain p-[10%]" : "object-cover object-[50%_20%]";
  const status = isSoldOut ? "Sold out" : product.compareAtPrice ? "Sale" : isNew ? "New" : null;

  return (
    <article className="product-card group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[18px] bg-white">
      <div className="card-media relative aspect-square">
        <Image
          src={product.images[0]}
          alt=""
          data-studio=""
          fill
          preload={preload}
          sizes={sizes}
          className={cn(fit, "transition-transform duration-700 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:scale-[1.03]")}
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt=""
            data-secondary
            data-studio=""
            fill
            preload={false}
            sizes={sizes}
            className={cn(fit, "bg-white opacity-0")}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-5 pt-1 sm:px-5 sm:pb-6">
        {product.colors.length > 1 && (
          <ul role="list" aria-label={`${product.colors.length} colours`} className="mb-3 flex gap-1.5">
            {product.colors.map(c => (
              <li key={c.name} title={c.name} className="size-2.5 rounded-full ring-1 ring-inset ring-black/15" style={{ backgroundColor: c.hex }} />
            ))}
          </ul>
        )}
        {status && (
          <p className={cn("mb-1 text-[12px] font-medium", isSoldOut ? "text-ink-soft" : "text-brand")}>{status}</p>
        )}
        <h3 className="text-[15px] font-semibold leading-[1.25] tracking-[-0.015em] text-ink sm:text-[16px]">
          <Link
            href={href}
            className="after:absolute after:inset-0 after:rounded-[18px] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1.5 text-[14px] tabular-nums sm:text-[15px]">
          <span className={product.compareAtPrice ? "text-brand" : "text-ink"}>{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <s className="ml-1.5 text-ink-soft">{formatPrice(product.compareAtPrice)}</s>
          )}
        </p>
      </div>
    </article>
  );
}
