import Link from "next/link";
import { categories, categoryHref } from "@/data/categories";
import { site, whatsappHref } from "@/lib/config";
import { Logo } from "@/components/shared/logo";
import { TikTokIcon, WhatsAppIcon } from "@/components/shared/social-icons";

const shopLinks = [{ name: "Shop all", href: "/shop" }, ...categories.map(c => ({ name: c.name, href: categoryHref(c.id) }))];

const linkClass = "inline-flex min-h-9 items-center text-[13px] text-ink-soft transition-colors hover:text-ink hover:underline sm:min-h-8";

/** Apple-style footer: quiet grey field, small type, three short columns. */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-line/70 bg-mist text-ink">
      <div className="container-shell pb-8 pt-10 sm:pt-12">
        <div className="grid gap-8 border-b border-line pb-8 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-[28ch] text-[13px] leading-5 text-ink-soft">{site.tagline} Gadgets and accessories from two shops in Ghana.</p>
            <ul role="list" className="mt-4 flex gap-2">
              {[
                { name: "TikTok", href: site.tiktok, icon: <TikTokIcon className="size-[17px]" /> },
                { name: "WhatsApp", href: whatsappHref(), icon: <WhatsAppIcon className="size-[18px]" /> },
              ].map(s => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${site.name} on ${s.name}`}
                    className="press flex size-11 items-center justify-center rounded-full bg-white text-ink transition-colors hover:bg-ink hover:text-white"
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:contents">
            <nav aria-label="Shop">
              <h2 className="text-[13px] font-semibold text-ink">Shop</h2>
              <ul role="list" className="mt-2">
                {shopLinks.map(link => (
                  <li key={link.name}>
                    <Link href={link.href} className={linkClass}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="text-[13px] font-semibold text-ink">Visit</h2>
              <ul role="list" className="mt-2 space-y-3">
                {site.stores.map(store => (
                  <li key={store.id} className="text-[13px] leading-5 text-ink-soft">
                    <span className="block text-ink">{store.name}</span>
                    {store.address}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-[13px] font-semibold text-ink">Help</h2>
              <ul role="list" className="mt-2">
                <li><a href={whatsappHref()} target="_blank" rel="noreferrer" className={linkClass}>Chat on WhatsApp</a></li>
                <li><a href={site.phoneHref} className={linkClass}>Call {site.phoneDisplay}</a></li>
                <li><Link href="/orders" className={linkClass}>Your orders</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 pt-5 text-[12px] leading-5 text-ink-soft sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. {site.city}.</p>
          <p>Pay with Mobile Money or card. Delivery nationwide.</p>
        </div>
      </div>
    </footer>
  );
}
