"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, Menu, Search, ShoppingBag } from "lucide-react";
import { Drawer } from "@heroui/react";
import { SearchDialog, useSearchShortcut } from "@/components/shared/search-dialog";
import { Logo } from "@/components/shared/logo";
import { TikTokIcon, WhatsAppIcon } from "@/components/shared/social-icons";
import { categoryHref, navSections, type ShopCategoryId } from "@/data/categories";
import { useBagUI, useCart, cartCount } from "@/store/cart";
import { site, whatsappHref } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { SearchItem } from "@/types";

const navLinks = navSections.map(c => ({ id: c.id, name: c.name, href: categoryHref(c.id) }));

function DesktopNav() {
  const pathname = usePathname();
  const params = useSearchParams();
  const active = pathname === "/shop" ? params.get("category") : null;
  return (
    <nav aria-label="Main" className="hidden items-center justify-center gap-6 lg:flex xl:gap-8">
      {navLinks.map(link => (
        <Link
          key={link.id}
          href={link.href}
          aria-current={active === link.id ? "page" : undefined}
          className={cn(
            "relative py-2 text-[14px] font-medium transition-colors hover:text-brand xl:text-[15px]",
            active === link.id ? "text-ink" : "text-ink/70"
          )}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
}

const iconButton =
  "press relative flex size-11 items-center justify-center rounded-full text-ink hover:bg-mist";

/** Bag icon whose count gives a small spring "bump" whenever the bag grows. */
function BagButton({ count, onOpen }: { count: number; onOpen: () => void }) {
  const [bump, setBump] = useState(false);
  const prev = useRef(count);
  useEffect(() => {
    if (count > prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      prev.current = count;
      return () => clearTimeout(t);
    }
    prev.current = count;
  }, [count]);

  return (
    <button
      type="button"
      className={iconButton}
      aria-label={`Shopping cart, ${count} ${count === 1 ? "item" : "items"}`}
      onClick={onOpen}
    >
      <ShoppingBag className={cn("size-[22px] stroke-[1.6] transition-transform duration-300 ease-[var(--ease-out)]", bump && "scale-110")} />
      {count > 0 && (
        <span
          className={cn(
            "absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white tabular-nums ring-2 ring-white",
            bump && "badge-bump"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function Header({ searchItems }: { searchItems: SearchItem[] }) {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const count = useCart(s => cartCount(s.items));
  const openBag = useBagUI(s => s.setOpen);

  useSearchShortcut(useCallback(() => setSearch(true), []));

  return (
    <>
      <div className="bg-ink text-white">
        <p className="container-shell flex h-9 items-center justify-center gap-2 text-center text-[13px] font-semibold">
          Koforidua &amp; Kasoa
          <span aria-hidden className="text-white/40">·</span>
          Delivery nationwide
        </p>
      </div>
      <header className="translucent sticky top-0 z-40 border-b border-line/60 bg-white/85 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto grid h-[60px] w-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-2 sm:px-6 lg:h-[68px] lg:grid-cols-[auto_1fr_auto] lg:gap-8 lg:px-10">
          <div className="flex items-center">
            <button type="button" className={cn(iconButton, "lg:hidden")} aria-label="Open menu" onClick={() => setMenu(true)}>
              <Menu className="size-[22px] stroke-[1.6]" />
            </button>
            <Logo priority className="hidden lg:inline-flex" />
          </div>
          <Logo priority className="lg:hidden" />
          <Suspense fallback={<div className="hidden lg:block" />}>
            <DesktopNav />
          </Suspense>
          <div className="flex items-center justify-end">
            <button type="button" className={iconButton} aria-label="Search products" onClick={() => setSearch(true)}>
              <Search className="size-[21px] stroke-[1.6]" />
            </button>
            <BagButton count={count} onOpen={() => openBag(true)} />
          </div>
        </div>
      </header>

      <Drawer isOpen={menu} onOpenChange={setMenu}>
        <Drawer.Backdrop>
          <Drawer.Content placement="left">
            <Drawer.Dialog className="w-full gap-0 bg-white p-0 sm:w-[400px]">
              <Drawer.Body className="m-0 flex min-h-0 flex-1 flex-col overflow-y-auto p-0 text-ink">
                <Drawer.Heading className="sr-only">Menu</Drawer.Heading>
                <div className="flex h-[60px] items-center justify-between px-4">
                  <Logo />
                  <Drawer.CloseTrigger className="static" />
                </div>
                <nav aria-label="Mobile" className="mt-2 flex flex-col px-3">
                  {([{ id: "all", name: "Shop everything" }, ...navSections] as { id: ShopCategoryId; name: string }[]).map(c => (
                    <Link
                      key={c.id}
                      href={categoryHref(c.id)}
                      onClick={() => setMenu(false)}
                      className="press flex min-h-[60px] items-center gap-4 border-b border-line px-2 last:border-0 active:bg-mist"
                    >
                      <span className="flex-1 text-[22px] font-semibold text-ink">{c.name}</span>
                      <ChevronRight className="size-5 text-ink-faint" aria-hidden />
                    </Link>
                  ))}
                  <div className="mx-2 mt-4 pt-1">
                    {[
                      { href: "/orders", label: "Your orders" },
                    ].map(l => (
                      <Link key={l.href} href={l.href} onClick={() => setMenu(false)} className="flex min-h-12 items-center text-[17px] font-medium text-ink">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </nav>
                <div className="safe-bottom mt-auto grid grid-cols-2 gap-2 px-5 pt-8">
                  <a href={whatsappHref()} target="_blank" rel="noreferrer" className="btn btn-soft col-span-2">
                    <WhatsAppIcon className="size-[18px] text-[#25d366]" /> Chat on WhatsApp
                  </a>
                  {[
                    { name: "TikTok", href: site.tiktok, icon: <TikTokIcon className="size-[17px]" /> },
                    { name: "Call", href: site.phoneHref, icon: <span className="text-[13px] font-semibold">Call</span> },
                  ].map(s => (
                    <a key={s.name} href={s.href} target="_blank" rel="noreferrer" aria-label={`${site.name} on ${s.name}`} className="press flex h-12 items-center justify-center rounded-full bg-mist text-ink hover:bg-[#e6e6e6]">
                      {s.icon}
                    </a>
                  ))}
                </div>
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      <SearchDialog open={search} onOpenChange={setSearch} items={searchItems} />
    </>
  );
}
