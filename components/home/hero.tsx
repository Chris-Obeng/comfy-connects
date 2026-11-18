import Image from "next/image";
import Link from "next/link";
import { MapPin, Truck } from "lucide-react";

export type HeroPanel = { src: string; alt: string; tint: string; label: string; href: string };

/**
 * Apple-style hero. The copy sits on the store's own mint field and three pieces
 * from the current line-up float below on their product colours. No carousel and
 * no autoplay: phones scroll the three panels with a snap, desktop shows them all.
 */
export function Hero({ eyebrow, headline, sub, panels }: { eyebrow: string; headline: string; sub: string; panels: HeroPanel[] }) {
  return (
    <section aria-label="Featured gadgets" className="relative isolate overflow-hidden bg-[#eefbe8]">
      <div className="container-shell pb-6 pt-10 sm:pb-8 sm:pt-14 lg:pb-10 lg:pt-16">
        <div className="mx-auto flex max-w-[780px] flex-col items-center text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">{eyebrow}</p>
          <h1 className="display mt-3 text-[46px] text-ink sm:text-[64px] lg:text-[80px]">{headline}</h1>
          <p className="mt-4 max-w-[44ch] text-[17px] leading-7 text-ink/70 sm:text-[20px] sm:leading-8">{sub}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/shop" className="btn btn-primary btn-lg">
              Shop all gadgets
            </Link>
            <Link href="/shop?category=power" className="btn btn-outline btn-lg">
              Power banks
            </Link>
          </div>
          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[13px] font-medium text-ink/60">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 stroke-[1.8]" aria-hidden /> Pick up free in Koforidua or Kasoa
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="size-4 stroke-[1.8]" aria-hidden /> Delivery nationwide
            </span>
          </p>
        </div>
      </div>

      <div className="container-shell pb-10 sm:pb-12 lg:pb-16">
        <ul
          role="list"
          className="hide-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0"
        >
          {panels.map(panel => (
            <li key={panel.src} className="w-[76%] shrink-0 snap-center sm:w-[52%] lg:w-auto">
              <Link
                href={panel.href}
                className="press group relative block aspect-square overflow-hidden rounded-[26px] tint-media"
                style={{ "--tint": panel.tint } as React.CSSProperties}
              >
                <Image
                  src={panel.src}
                  alt={panel.alt}
                  data-studio=""
                  fill
                  preload
                  quality={85}
                  sizes="(max-width: 1024px) 76vw, 33vw"
                  className="media-zoom object-contain p-[7%]"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
