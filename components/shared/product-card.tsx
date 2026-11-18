import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const soldOut = (p: Product) => p.sizes.every(s => s.stock === 0);

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
  const fit = product.cutout ? "object-contain p-[8%]" : "object-cover object-[50%_20%]";
  return (
    <article className="group relative min-w-0">
      <div
        className="card-media tint-media relative aspect-[4/5] overflow-hidden rounded-[22px] transition-transform duration-200 ease-[var(--ease-out)] group-active:scale-[0.98]"
        style={{ "--tint": product.tint } as React.CSSProperties}
      >
        <Image
          src={product.images[0]}
          alt=""
          data-studio=""
          fill
          preload={preload}
          sizes={sizes}
          className={cn(fit, product.cutout && "transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]")}
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt=""
            data-secondary
            data-studio={product.cutout ? "" : undefined}
            fill
            preload={false}
            sizes={sizes}
            className={cn(fit, "opacity-0")}
          />
        )}
        {(product.compareAtPrice || isSoldOut) && (
          <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-[12px] leading-none text-ink">
            {isSoldOut ? "Sold out" : "Sale"}
          </span>
        )}
      </div>
      <div className="px-1 pt-3.5">
        {isNew && <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.04em] text-brand">New</p>}
        <h3 className="text-[16px] font-semibold leading-5 text-ink">
          <Link href={href} className="after:absolute after:inset-0 after:rounded-[22px] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1.5 text-[15px] tabular-nums">
          {product.compareAtPrice ? (
            <>
              <span className="font-medium text-sale">{formatPrice(product.price)}</span>{" "}
              <s className="text-ink-faint">{formatPrice(product.compareAtPrice)}</s>
            </>
          ) : (
            <span className="text-ink">{formatPrice(product.price)}</span>
          )}
        </p>
      </div>
    </article>
  );
}
