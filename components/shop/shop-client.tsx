"use client";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ListBox, Select } from "@heroui/react";
import { shopSections, categoryHref } from "@/data/categories";
import type { Product } from "@/types";
import { ProductCard } from "@/components/shared/product-card";
import { cn } from "@/lib/utils";

type Sort = "featured" | "price-asc" | "price-desc";

export function ShopClient({ products, category, query }: { products: Product[]; category: string; query?: string }) {
  const [sort, setSort] = useState<Sort>("featured");
  const chips = useRef<HTMLElement>(null);

  // Phones: keep the chosen category chip in view instead of off the right edge.
  useEffect(() => {
    const row = chips.current;
    const active = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !active) return;
    const overflow = active.offsetLeft + active.offsetWidth - (row.scrollLeft + row.clientWidth);
    if (overflow > 0) row.scrollLeft += overflow + 24;
  }, [category]);
  const visible = useMemo(() => {
    if (sort === "featured") return products;
    return [...products].sort((a, b) => (sort === "price-asc" ? a.price - b.price : b.price - a.price));
  }, [products, sort]);

  const title = query
    ? `“${query}”`
    : category === "all" ? "Shop all" : shopSections.find(s => s.id === category)?.name ?? "Shop all";

  return (
    <div className="flex-1 bg-mist">
      <header className="pt-8 sm:pt-14">
        <div className="container-shell">
          {query && <p className="text-[15px] text-ink-soft">Results for</p>}
          <h1 className="display text-[40px] text-ink sm:text-[56px]">{title}</h1>
          {query && (
            <Link href="/shop" className="btn btn-light btn-sm mt-4">
              <X className="size-4" aria-hidden /> Clear search
            </Link>
          )}
        </div>
        <nav ref={chips} aria-label="Categories" className="relative rail hide-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1 sm:mt-7">
          {shopSections.map(section => (
            <Link
              key={section.id}
              href={categoryHref(section.id)}
              aria-current={!query && section.id === category ? "page" : undefined}
              className={cn(
                "press flex h-10 shrink-0 items-center rounded-full px-4 text-[14px] transition-colors",
                !query && section.id === category ? "bg-ink text-white" : "bg-white text-ink hover:bg-[#e8e8ed]"
              )}
            >
              {section.name}
            </Link>
          ))}
        </nav>
      </header>

      <div className="container-shell mt-5 flex items-center justify-between sm:mt-7">
        <p className="text-[14px] text-ink-soft" aria-live="polite">
          {visible.length} {visible.length === 1 ? "gadget" : "gadgets"}
        </p>
        <Select
          aria-label="Sort products"
          selectedKey={sort}
          onSelectionChange={key => setSort((key as Sort) ?? "featured")}
        >
          <Select.Trigger className="h-11 w-fit gap-2 rounded-full border-0 bg-transparent pl-3 pr-9 text-[14px] font-medium text-ink shadow-none">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="featured" textValue="Featured">
                Featured
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="price-asc" textValue="Price: low to high">
                Price: low to high
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="price-desc" textValue="Price: high to low">
                Price: high to low
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      <div className="container-shell pb-16 pt-3 sm:pb-24">
        {visible.length === 0 && (
          <div className="rounded-[18px] bg-white px-6 py-16 text-center">
            <p className="text-[21px] font-semibold tracking-[-0.02em] text-ink">Nothing matches that yet</p>
            <p className="mx-auto mt-2 max-w-[34ch] text-[15px] text-ink-soft">Try a shorter word like “bag” or “charger”, or ask us on WhatsApp and we’ll find it for you.</p>
            <Link href="/shop" className="btn btn-primary mt-6">Shop all</Link>
          </div>
        )}
        <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {visible.map((product, i) => (
            <li key={product.id}>
              <ProductCard product={product} preload={i < 4} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
