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

const navLinks = [
  { id: "all", name: "Shop", href: "/shop" },
  ...navSections.map(c => ({ id: c.id as string, name: c.name, href: categoryHref(c.id) })),
];

function DesktopNav() {
  const pathname = usePathname();
  const params = useSearchParams();
  const active = pathname === "/shop" ? params.get("category") ?? (params.get("q") ? null : "all") : null;
  return (
    <nav aria-label="Main" className="hidden items-center justify-center gap-7 lg:flex xl:gap-9">
      {navLinks.map(link => (
        <Link
          key={link.id}
          href={link.href}
          aria-current={active === link.id ? "page" : undefined}
          className={cn(
            "relative py-2 text-[13px] tracking-[-0.005em] transition-colors duration-200 hover:text-ink",
            active === link.id ? "text-ink" : "text-ink/75"
          )}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
}

const iconButton =
  "press relative flex size-11 items-center justify-center rounded-full text-ink/85 transition-colors hover:text-ink";

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
      <ShoppingBag className={cn("size-5 stroke-[1.6] transition-transform duration-300 ease-[var(--ease-out)]", bump && "scale-110")} />
      {count > 0 && (
        <span
          className={cn(
            "absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-none text-white tabular-nums ring-2 ring-white",
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
      <header className="translucent sticky top-0 z-40 bg-white/80 backdrop-blur-xl backdrop-saturate-[1.8]">
        <div className="mx-auto grid h-[52px] w-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-1.5 sm:px-6 lg:h-14 lg:grid-cols-[auto_1fr_auto] lg:gap-8 lg:px-10">
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
              <Search className="size-5 stroke-[1.6]" />
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
                <div className="flex h-[60px] items-center justify-between pl-6 pr-4">
                  <Logo />
                  <Drawer.CloseTrigger className="static" />
                </div>
                <nav aria-label="Mobile" className="mt-4 flex flex-col px-7">
                  {([{ id: "all", name: "Shop all" }, ...navSections] as { id: ShopCategoryId; name: string }[]).map(c => (
                    <Link
                      key={c.id}
                      href={categoryHref(c.id)}
                      onClick={() => setMenu(false)}
                      className="press group flex min-h-[52px] items-center gap-3"
                    >
                      <span className="flex-1 text-[26px] font-semibold tracking-[-0.025em] text-ink">{c.name}</span>
                      <ChevronRight className="size-5 text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  ))}
                  <div className="mt-6 border-t border-hairline pt-4">
                    <Link href="/orders" onClick={() => setMenu(false)} className="flex min-h-11 items-center text-[15px] text-ink-soft hover:text-ink">
                      Your orders
                    </Link>
                    <a href={site.phoneHref} className="flex min-h-11 items-center text-[15px] text-ink-soft hover:text-ink">
                      Call {site.phoneDisplay}
                    </a>
                  </div>
                </nav>
                <div className="safe-bottom mt-auto flex gap-2 px-5 pt-8">
                  <a href={whatsappHref()} target="_blank" rel="noreferrer" className="btn btn-soft h-12 flex-1">
                    <WhatsAppIcon className="size-[18px] text-[#25d366]" /> Chat on WhatsApp
                  </a>
                  <a href={site.tiktok} target="_blank" rel="noreferrer" aria-label={`${site.name} on TikTok`} className="press flex size-12 shrink-0 items-center justify-center rounded-full bg-mist text-ink hover:bg-hairline">
                    <TikTokIcon className="size-[17px]" />
                  </a>
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
