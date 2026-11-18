import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle, Smartphone, Store, Truck } from "lucide-react";
import { categories, categoryHref, editorial } from "@/data/categories";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/shared/product-card";
import { ProductRail } from "@/components/shared/product-rail";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductTile } from "@/components/home/hero";
import { buttonClass } from "@/lib/button-class";
import { minDeliveryFee, site, whatsappHref } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";

export default async function HomePage() {
  const store = (await getProducts("all")).filter(p => p.source !== "demo");
  const bySlug = (slug: string) => store.find(p => p.slug === slug) as Product;

  const hero = bySlug(editorial.hero.slug);
  const tiles = editorial.tiles.map(t => ({ ...t, product: bySlug(t.slug) }));
  const wide = bySlug(editorial.wide.slug);

  // Each product appears once on the page: tiles first, then the new shelf, then the picks.
  const shown = new Set([hero, wide, ...tiles.map(t => t.product)].map(p => p.id));
  const latest = store.filter(p => p.tags.includes("new") && !shown.has(p.id));
  latest.forEach(p => shown.add(p.id));
  const picks = [
    ...store.filter(p => p.tags.includes("featured") && !shown.has(p.id)),
    ...store.filter(p => !p.tags.includes("featured") && !shown.has(p.id)),
  ].slice(0, 8);

  return (
    <>
      <ProductTile product={hero} title={editorial.hero.title} line={editorial.hero.line} tint={editorial.hero.tint} size="hero" preload />

      {/* Shop by shelf: products float on white, Apple Store style. */}
      <nav aria-label="Shop by category" className="pb-4 pt-8 sm:pt-12">
        <ul role="list" className="rail hide-scrollbar flex snap-x gap-2 overflow-x-auto sm:gap-4 lg:justify-center lg:gap-8">
          {categories.map(c => (
            <li key={c.id} className="shrink-0 snap-start">
              <Link href={categoryHref(c.id)} className="press group flex w-[88px] flex-col items-center gap-2 sm:w-[120px]">
                <span className="relative block aspect-square w-full">
                  <Image src={c.image} alt="" fill sizes="120px" className="object-contain p-[8%] transition-transform duration-500 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:scale-[1.06]" />
                </span>
                <span className="text-center text-[13px] font-medium leading-4 tracking-[-0.01em] text-ink sm:text-[14px]">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* The latest */}
      <section className="mt-6 bg-mist pb-8 pt-12 sm:mt-10 sm:pb-12 sm:pt-16">
        <div className="container-shell">
          <SectionHeading title="The latest." tone="New on the shelf." href="/shop?category=new" action="See all" />
        </div>
        <ProductRail products={latest} label="New on the shelf" />
      </section>

      {/* Product tiles: two up, then one wide. Apple's 12px gutters. */}
      <div className="grid gap-3 pt-3 md:grid-cols-2 md:px-3">
        {tiles.map(t => (
          <ProductTile key={t.slug} product={t.product} title={t.title} line={t.line} tint={t.tint} size="half" />
        ))}
        <div className="md:col-span-2">
          <ProductTile product={wide} title={editorial.wide.title} line={editorial.wide.line} tint={editorial.wide.tint} size="wide" />
        </div>
      </div>

      {/* Top picks */}
      <section className="mt-3 bg-mist py-14 sm:py-20">
        <div className="container-shell">
          <SectionHeading title="Top picks." tone="Straight from the shop shelf." href="/shop" action="Shop all" />
          {/* Eight cards: two or four across, so no row is ever left half full. */}
          <ul role="list" className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {picks.map(product => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <Link href="/shop" className={buttonClass({ variant: "outline" })}>
              Shop all {store.length} gadgets
            </Link>
          </div>
        </div>
      </section>

      {/* Two shops, one promise each. Facts only: fees, times and addresses from lib/config. */}
      <section aria-labelledby="shops-title" className="container-shell py-14 sm:py-20">
        <h2 id="shops-title" className="headline text-[28px] text-ink sm:text-[40px]">
          Two shops. <span className="text-ink-soft">And delivery across Ghana.</span>
        </h2>
        <ul role="list" className="mt-8 grid gap-x-6 gap-y-8 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Store, title: "Free pickup", text: "Ready in 2 hours at either shop." },
            { icon: Truck, title: "Delivery nationwide", text: `Same or next day in Koforidua and Kasoa, from ${formatPrice(minDeliveryFee)}.` },
            { icon: Smartphone, title: "Mobile Money or card", text: "MTN MoMo, Telecel Cash, AirtelTigo, Visa and Mastercard." },
            { icon: MessageCircle, title: "Ask a real person", text: `WhatsApp or call ${site.phoneDisplay}.`, href: whatsappHref("Hi Comfy Connects, I have a question about a gadget.") },
          ].map(({ icon: Icon, title, text, href }) => (
            <li key={title} className="flex gap-4 sm:flex-col sm:gap-3">
              <Icon className="size-7 shrink-0 stroke-[1.5] text-brand" aria-hidden />
              <div>
                <h3 className="text-[17px] font-semibold tracking-[-0.015em] text-ink">
                  {href ? (
                    <a href={href} target="_blank" rel="noreferrer" className="hover:underline">{title}</a>
                  ) : title}
                </h3>
                <p className="mt-1 max-w-[32ch] text-[15px] leading-[1.45] text-ink-soft">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <ul role="list" className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-2">
          {site.stores.map(s => (
            <li key={s.id} className="flex items-center gap-4 rounded-[18px] bg-mist p-5 sm:p-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white">
                <MapPin className="size-5 stroke-[1.6] text-ink" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[17px] font-semibold tracking-[-0.015em] text-ink">{s.name}</p>
                <p className="text-[15px] text-ink-soft">{s.address}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
