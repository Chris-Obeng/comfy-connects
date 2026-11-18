import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, Store, Truck } from "lucide-react";
import { categories, categoryHref, editorial } from "@/data/categories";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/shared/product-card";
import { ProductRail } from "@/components/shared/product-rail";
import { ProductThumb } from "@/components/shared/product-thumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { TikTokIcon } from "@/components/shared/social-icons";
import { Hero } from "@/components/home/hero";
import { site, whatsappHref } from "@/lib/config";
import { formatPrice } from "@/lib/format";

/** A promo tile: copy above, the product on its own colour field below. */
function Promo({ eyebrow, title, text, href, action, src, alt, tint }: {
  eyebrow: string; title: string; text: string; href: string; action: string; src: string; alt: string; tint: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-[26px] tint-media" style={{ "--tint": tint } as React.CSSProperties}>
      <div className="flex flex-col items-start px-6 pt-8 sm:px-9 sm:pt-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-brand">{eyebrow}</p>
        <h2 className="headline mt-2 text-[28px] text-ink sm:text-[36px]">{title}</h2>
        <p className="mt-2 max-w-[38ch] text-[15px] leading-6 text-ink/70 sm:text-[16px]">{text}</p>
        <Link href={href} className="press mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-ink underline-offset-4 hover:underline">
          {action}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <Link href={href} aria-label={alt} className="press group relative mt-4 block aspect-[5/4]">
        <Image src={src} alt={alt} data-studio="" fill sizes="(max-width: 1024px) 100vw, 50vw" quality={85} className="media-zoom object-contain p-[6%]" />
      </Link>
    </section>
  );
}

export default async function HomePage() {
  const all = await getProducts("all");
  const store = all.filter(p => p.source !== "demo");

  const newIn = store.filter(p => p.tags.includes("new")).slice(0, 6);
  const newIds = new Set(newIn.map(p => p.id));
  // Keep the second shelf from repeating the first: featured pieces first, then the rest.
  const best = [
    ...store.filter(p => p.tags.includes("featured") && !newIds.has(p.id)),
    ...store.filter(p => !p.tags.includes("featured") && !newIds.has(p.id)),
  ].slice(0, 8);
  const bags = store.filter(p => p.category === "bags" && !newIds.has(p.id)).slice(0, 6);

  return (
    <>
      <Hero
        eyebrow={editorial.hero.eyebrow}
        headline={editorial.hero.headline}
        sub={editorial.hero.sub}
        panels={editorial.hero.panels}
      />

      {/* Shop by shelf */}
      <nav aria-label="Shop by category" className="container-shell pt-8 sm:pt-12">
        <ul role="list" className="hide-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-4 lg:overflow-visible lg:px-0">
          {categories.map(c => (
            <li key={c.id} className="shrink-0 snap-start lg:w-auto">
              <Link href={categoryHref(c.id)} className="press group flex w-[92px] flex-col items-center gap-2.5 lg:w-full">
                <ProductThumb src={c.image} tint={c.tint} cutout={c.cutout} sizes="(max-width: 1024px) 92px, 190px" className="media-zoom aspect-square w-full rounded-[22px]" />
                <span className="text-center text-[13px] font-medium leading-4 text-ink sm:text-[14px]">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* New in */}
      <section className="container-shell pt-12 sm:pt-16">
        <SectionHeading title="New in" href="/shop?category=new" action="See all" />
        <ProductRail products={newIn} />
      </section>

      {/* Two promos */}
      <section className="container-shell grid gap-4 pt-12 sm:pt-16 lg:grid-cols-2">
        {editorial.promos.map(p => <Promo key={p.href} {...p} />)}
      </section>

      {/* Feature band */}
      <section className="mt-12 grid bg-[#22201f] sm:mt-16 md:grid-cols-2">
        <div className="tint-media relative aspect-[4/3] md:aspect-auto md:min-h-[460px]" style={{ "--tint": "#F4EAE3" } as React.CSSProperties}>
          <Image src={editorial.feature.src} alt={editorial.feature.alt} data-studio="" fill sizes="(max-width: 768px) 100vw, 50vw" quality={85} className="object-contain p-[9%]" />
        </div>
        <div className="flex flex-col items-start justify-center px-6 py-11 text-white sm:px-12 md:py-16 lg:px-14">
          <h2 className="display text-[32px] sm:text-[40px] lg:text-[46px]">{editorial.feature.title}</h2>
          <p className="mt-3 max-w-[36ch] text-[16px] leading-7 text-white/70 sm:text-[17px]">{editorial.feature.text}</p>
          <Link href={editorial.feature.href} className="btn btn-light mt-7">
            {editorial.feature.action}
          </Link>
        </div>
      </section>

      {/* Best sellers */}
      <section className="mt-12 bg-mist py-12 sm:mt-16 sm:py-16">
        <div className="container-shell">
          <SectionHeading title="Best sellers" href="/shop" action="Shop all" />
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-y-10">
            {best.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      {/* Bags rail */}
      <section className="container-shell py-12 sm:py-16">
        <SectionHeading title="Bags that carry it all" href="/shop?category=bags" action="Shop bags" />
        <ProductRail products={bags} />
      </section>

      {/* Visit us: the two shops, with the pickup promise */}
      <section className="container-shell pb-12 sm:pb-16">
        <div className="grid gap-4 rounded-[28px] bg-mist p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-10 lg:p-10">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">Two shops</p>
            <h2 className="headline mt-2 text-[28px] text-ink sm:text-[34px]">See it. Hold it. Buy it.</h2>
            <p className="mt-2 max-w-[38ch] text-[15px] leading-6 text-ink/70">
              Every gadget is on the shelf at both shops. Collect in about two hours, or have it delivered.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={whatsappHref("Hi Comfy Connects, I'd like to ask about a gadget.")} target="_blank" rel="noreferrer" className="btn btn-primary">
                <MessageCircle className="size-4" aria-hidden /> Ask on WhatsApp
              </a>
              <a href={site.tiktok} target="_blank" rel="noreferrer" className="btn btn-outline">
                <TikTokIcon className="size-4" aria-hidden /> {site.tiktokFollowers} on TikTok
              </a>
            </div>
            <p className="mt-5 text-[15px] text-ink/70">
              Call or WhatsApp{" "}
              <a href={site.phoneHref} className="font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                {site.phoneDisplay}
              </a>
            </p>
          </div>
          <ul role="list" className="grid gap-3 sm:grid-cols-2">
            {site.stores.map(store2 => (
              <li key={store2.id} className="rounded-[20px] bg-white p-5">
                <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft">
                  <Store className="size-[18px] stroke-[1.7] text-ink" aria-hidden />
                </span>
                <p className="mt-3 text-[17px] font-semibold text-ink">{store2.name}</p>
                <p className="mt-0.5 text-[14px] leading-5 text-ink/70">{store2.address}</p>
                <p className="mt-1 text-[13px] text-ink/50">{store2.area}</p>
                <p className="mt-3 text-[13px] font-medium text-ink">Pickup ready in 2 hours</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reassurance strip */}
      <section aria-label="Shopping with us" className="border-t border-line">
        <div className="container-shell py-10 sm:py-12">
          <ul role="list" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Truck, title: "Delivery nationwide", text: `From ${formatPrice(2000)} in Koforidua and Kasoa.` },
              { icon: Store, title: "Free pickup", text: "Collect from either shop in two hours." },
              { icon: ShieldCheck, title: "Checked before it ships", text: "Every unit is tested in store." },
              { icon: MessageCircle, title: "A real person on WhatsApp", text: `Ask about stock or a fitting on ${site.phoneDisplay}.` },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mist">
                  <Icon className="size-[18px] stroke-[1.7] text-ink" aria-hidden />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-ink">{title}</span>
                  <span className="mt-0.5 block text-[14px] leading-5 text-ink/60">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
