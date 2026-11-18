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

const sortOptions: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
];

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
        {/* Beats-style tabs: bold text, grey until chosen, a 2px underline on the current one, one
            hairline across the page. Centred when they fit; on phones they scroll from the left
            (auto margins on the first and last tab collapse safely when the row overflows). */}
        <nav
          ref={chips}
          aria-label="Categories"
          className="relative hide-scrollbar mt-6 flex overflow-x-auto border-b border-line px-5 sm:mt-8 sm:px-8 [&>:first-child]:ml-auto [&>:last-child]:mr-auto"
        >
          {shopSections.map(section => {
            const current = !query && section.id === category;
            return (
              <Link
                key={section.id}
                href={categoryHref(section.id)}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "press relative flex h-[52px] shrink-0 items-center px-3.5 text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-200 sm:px-4 sm:text-[16px]",
                  "after:absolute after:inset-x-3.5 after:-bottom-px after:h-[2px] after:rounded-full after:bg-ink after:opacity-0 after:transition-opacity after:duration-200 sm:after:inset-x-4",
                  current ? "text-ink after:opacity-100" : "text-ink-soft hover:text-ink"
                )}
              >
                {section.name}
              </Link>
            );
          })}
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
          <Select.Trigger className="h-11 w-fit gap-1.5 rounded-full border-0 bg-white pl-4 pr-10 text-[14px] text-ink shadow-none transition-colors hover:bg-[#ededf0] data-[pressed=true]:scale-[0.98]">
            <span className="text-ink-soft">Sort by</span>
            <Select.Value className="text-[14px] font-medium text-ink" />
            <Select.Indicator className="right-3.5 text-ink" />
          </Select.Trigger>
          <Select.Popover placement="bottom end" offset={8} className="min-w-[250px]! rounded-[18px] p-1.5">
            <ListBox aria-label="Sort products" className="gap-0.5 p-0">
              {sortOptions.map(option => (
                <ListBox.Item key={option.id} id={option.id} textValue={option.label} className="min-h-11 rounded-[12px] px-3 text-[15px] text-ink outline-none focus-visible:outline-none data-[focus-visible=true]:ring-0! data-[focus-visible=true]:ring-offset-0! data-[focus-visible=true]:shadow-none! data-[focused=true]:bg-mist data-[hovered=true]:bg-mist">
                  {option.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
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
