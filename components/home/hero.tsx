import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { buttonClass } from "@/lib/button-class";
import { BuyButton } from "@/components/shared/buy-button";
import { cn } from "@/lib/utils";

export type TileSize = "hero" | "wide" | "half";

const type = {
  hero: { title: "text-[44px] sm:text-[64px] lg:text-[80px]", line: "text-[19px] sm:text-[24px] lg:text-[28px]", pad: "pt-11 sm:pt-14 lg:pt-12" },
  wide: { title: "text-[36px] sm:text-[52px] lg:text-[64px]", line: "text-[17px] sm:text-[21px] lg:text-[24px]", pad: "pt-11 sm:pt-14 lg:pt-16" },
  half: { title: "text-[32px] sm:text-[40px] lg:text-[44px]", line: "text-[17px] sm:text-[19px]", pad: "pt-10 sm:pt-12" },
};

const media = {
  // Desktop: the whole product stays inside the first screen.
  hero: "aspect-square w-[min(92vw,560px)] lg:w-[clamp(380px,calc(100svh-460px),580px)]",
  wide: "aspect-square w-[min(88vw,520px)]",
  half: "aspect-square w-[min(84vw,440px)] md:w-[min(40vw,440px)]",
};

/**
 * Apple homepage tile: the product's name large, one line under it, the price, then Buy and
 * Learn more, with the studio shot floating on the product's own colour field below.
 * `hero` is the first tile and the page's one authored entrance (copy rises, photo settles).
 */
export function ProductTile({
  product,
  title,
  line,
  tint,
  size = "half",
  image = 0,
  preload = false,
}: {
  product: Product;
  title?: string;
  line: string;
  tint?: string;
  size?: TileSize;
  image?: number;
  preload?: boolean;
}) {
  const href = `/product/${product.slug}`;
  const hero = size === "hero";
  const t = type[size];
  const Heading = hero ? "h1" : "h2";

  return (
    <section
      aria-label={product.name}
      className="tint-media relative isolate flex flex-col items-center overflow-hidden text-center"
      style={{ "--tint": tint ?? product.tint } as React.CSSProperties}
    >
      <div className={cn("flex flex-col items-center px-6", t.pad, hero && "hero-copy")}>
        <Heading className={cn("display text-ink", t.title)}>{title ?? product.name}</Heading>
        <p className={cn("mt-2 max-w-[30ch] leading-[1.2] tracking-[-0.015em] text-ink sm:max-w-[40ch]", t.line)}>{line}</p>
        <p className="mt-3 text-[15px] tabular-nums text-ink-soft sm:text-[17px]">
          {product.compareAtPrice ? (
            <>
              <span className="text-brand">{formatPrice(product.price)}</span>
              <s className="ml-2">{formatPrice(product.compareAtPrice)}</s>
            </>
          ) : (
            formatPrice(product.price)
          )}
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <BuyButton product={product} className="min-w-[96px]" />
          <Link href={href} className={buttonClass({ variant: "outline", className: "min-w-[96px]" })} aria-label={`Learn more about ${product.name}`}>
            Learn more
          </Link>
        </div>
      </div>

      {/* The link carries the tint too: its transform makes a new stacking context, and the
          studio shot can only multiply into a colour inside that context. */}
      <Link href={href} tabIndex={-1} aria-hidden className={cn("tint-media press relative mt-2 block max-w-full", media[size], hero && "hero-media")}>
        <Image
          src={product.images[image] ?? product.images[0]}
          alt=""
          data-studio=""
          fill
          preload={preload}
          quality={85}
          sizes={hero ? "(max-width: 1024px) 92vw, 620px" : size === "wide" ? "(max-width: 640px) 88vw, 520px" : "(max-width: 768px) 84vw, 440px"}
          className="object-contain p-[6%]"
        />
      </Link>
    </section>
  );
}
