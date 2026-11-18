"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/shared/product-card";
import { cn } from "@/lib/utils";

/**
 * Apple Store shelf: a horizontal row of cards that snaps card by card. Phones swipe and
 * peek the next card; pointer devices also get the two round arrows under the row.
 * The row aligns with the page container but bleeds to the screen edge while scrolling.
 */
export function ProductRail({ products, label }: { products: Product[]; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  function page(dir: 1 | -1) {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    // Move by whole cards so the row always lands on a card edge.
    const cards = Math.max(1, Math.floor((el.clientWidth - 40) / step));
    el.scrollBy({ left: dir * step * cards, behavior: "smooth" });
  }

  return (
    <div>
      <ul
        ref={track}
        role="list"
        aria-label={label}
        onScroll={measure}
        className="rail hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-6 pt-1 sm:gap-5"
      >
        {products.map(product => (
          <li key={product.id} className="w-[64vw] max-w-[300px] shrink-0 snap-start sm:w-[300px]">
            <ProductCard product={product} sizes="(max-width: 640px) 64vw, 300px" />
          </li>
        ))}
      </ul>
      <div className="container-shell hidden justify-end gap-3 [@media(hover:hover)_and_(pointer:fine)]:flex">
        {([
          [-1, "Previous", ChevronLeft, edges.start],
          [1, "Next", ChevronRight, edges.end],
        ] as const).map(([dir, name, Icon, disabled]) => (
          <button
            key={name}
            type="button"
            onClick={() => page(dir)}
            disabled={disabled}
            aria-label={`${name} products`}
            className={cn(
              "press flex size-10 items-center justify-center rounded-full bg-[#e8e8ed] text-ink/80 transition-colors hover:bg-[#dcdce1] hover:text-ink",
              "disabled:cursor-default disabled:opacity-40 disabled:hover:bg-[#e8e8ed]"
            )}
          >
            <Icon className="size-5" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}
