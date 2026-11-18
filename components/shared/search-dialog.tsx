"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ArrowUpLeft, Clock, Search, X } from "lucide-react";
import { categories, categoryHref } from "@/data/categories";
import { formatPrice } from "@/lib/format";
import { highlight, search } from "@/lib/search";
import { cn } from "@/lib/utils";
import { ProductThumb } from "@/components/shared/product-thumb";
import type { SearchItem } from "@/types";

const MAX_RESULTS = 6;
const POPULAR = ["Power bank", "Backpack", "Smart glasses", "Watch", "Charger", "Laptop"];

/* Recent searches: a few terms in localStorage, read through a stable snapshot. */
const RECENT_KEY = "comfy-connects-recent-searches";
const recentListeners = new Set<() => void>();
let recentCache: { raw: string | null; list: string[] } = { raw: null, list: [] };
function readRecent(): string[] {
  const raw = typeof window === "undefined" ? null : localStorage.getItem(RECENT_KEY);
  if (raw !== recentCache.raw) {
    let list: string[] = [];
    try { list = raw ? JSON.parse(raw) : []; } catch { list = []; }
    recentCache = { raw, list: Array.isArray(list) ? list.slice(0, 5) : [] };
  }
  return recentCache.list;
}
function writeRecent(list: string[]) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5))); } catch {}
  recentListeners.forEach(l => l());
}
function rememberSearch(term: string) {
  const t = term.trim();
  if (t.length < 2) return;
  writeRecent([t, ...readRecent().filter(r => r.toLowerCase() !== t.toLowerCase())]);
}
const subscribeRecent = (cb: () => void) => { recentListeners.add(cb); return () => recentListeners.delete(cb); };
const EMPTY: string[] = [];

/**
 * Product search. Full-screen sheet on phones (input pinned at the top, Cancel on
 * the right, like iOS); floating panel under the header from tablet up.
 * Portal + controlled open state; entry animated with @starting-style.
 */
export function SearchDialog({
  open,
  onOpenChange,
  items,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SearchItem[];
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Search products">
      <div className="search-backdrop absolute inset-0 hidden sm:block" onClick={() => onOpenChange(false)} aria-hidden />
      <div className="search-panel absolute inset-0 flex flex-col bg-white sm:inset-x-0 sm:bottom-auto sm:top-[76px] sm:mx-auto sm:max-h-[min(720px,calc(100dvh-110px))] sm:w-[min(92vw,680px)] sm:overflow-hidden sm:rounded-[28px] sm:shadow-[0_30px_90px_-20px_rgb(17_17_17/0.35)]">
        <SearchPanel items={items} onClose={() => onOpenChange(false)} />
      </div>
    </div>,
    document.body
  );
}

function SearchPanel({ items, onClose }: { items: SearchItem[]; onClose: () => void }) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const recent = useSyncExternalStore(subscribeRecent, readRecent, () => EMPTY);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const q = query.trim();
  const all = useMemo(() => (q ? search(items, q) : []), [items, q]);
  const results = all.slice(0, MAX_RESULTS);
  const matchingCategories = useMemo(
    () => (q ? categories.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || all.some(i => i.category === c.id)).slice(0, 4) : []),
    [q, all]
  );

  function setQ(value: string) { setQuery(value); setActive(-1); }

  function openProduct(slug: string) {
    rememberSearch(q);
    onClose();
    router.push(`/product/${slug}`);
  }

  function seeAll(term = q) {
    if (!term) return;
    rememberSearch(term);
    onClose();
    router.push(`/shop?q=${encodeURIComponent(term)}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
    if (e.key === "ArrowDown" && results.length) { e.preventDefault(); setActive(i => (i + 1) % results.length); }
    else if (e.key === "ArrowUp" && results.length) { e.preventDefault(); setActive(i => (i <= 0 ? results.length - 1 : i - 1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[active];
      if (item) openProduct(item.slug); else seeAll();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" onKeyDown={onKeyDown}>
      {/* Input row */}
      <div className="flex shrink-0 items-center gap-2 px-3 pb-2 pt-[max(10px,env(safe-area-inset-top))] sm:p-4">
        <div className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-full bg-mist px-4 focus-within:ring-2 focus-within:ring-ink">
          <Search className="size-[18px] shrink-0 text-ink-soft" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQ(e.target.value)}
            placeholder="Search power banks, bags, glasses…"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
            aria-label="Search products"
            enterKeyHint="search"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-soft"
          />
          {query && (
            <button type="button" onClick={() => { setQ(""); inputRef.current?.focus(); }} aria-label="Clear search" className="press -mr-2 flex size-8 items-center justify-center rounded-full bg-ink/10 text-ink">
              <X className="size-3.5" aria-hidden />
            </button>
          )}
        </div>
        <button type="button" onClick={onClose} className="press h-12 shrink-0 px-2 text-[15px] font-medium text-ink">
          Cancel
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(24px,env(safe-area-inset-bottom))] sm:px-5 sm:pb-5">
        {!q ? (
          <div className="space-y-7 pt-3">
            {recent.length > 0 && (
              <section>
                <div className="flex items-center justify-between">
                  <h2 className="text-[13px] font-semibold text-ink-soft">Recent</h2>
                  <button type="button" onClick={() => writeRecent([])} className="press min-h-9 text-[13px] font-medium text-ink-soft hover:text-ink">Clear</button>
                </div>
                <ul className="mt-1">
                  {recent.map(r => (
                    <li key={r}>
                      <button type="button" onClick={() => setQ(r)} className="press flex min-h-11 w-full items-center gap-3 text-left text-[16px] text-ink">
                        <Clock className="size-4 text-ink-faint" aria-hidden />
                        <span className="flex-1 truncate">{r}</span>
                        <ArrowUpLeft className="size-4 text-ink-faint" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section>
              <h2 className="text-[13px] font-semibold text-ink-soft">Popular</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {POPULAR.map(term => (
                  <button key={term} type="button" onClick={() => setQ(term)} className="btn btn-soft btn-sm">{term}</button>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-[13px] font-semibold text-ink-soft">Browse</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map(c => (
                  <Link key={c.id} href={categoryHref(c.id)} onClick={onClose} className="btn btn-soft btn-sm">
                    {c.name}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        ) : results.length ? (
          <div className="pt-2">
            {matchingCategories.length > 0 && (
              <div className="hide-scrollbar -mx-4 mb-2 flex gap-2 overflow-x-auto px-4 sm:-mx-5 sm:px-5">
                {matchingCategories.map(c => (
                  <Link key={c.id} href={categoryHref(c.id)} onClick={onClose} className="btn btn-soft btn-sm shrink-0">{c.name}</Link>
                ))}
              </div>
            )}
            <ul id={listId} role="listbox" aria-label="Products">
              {results.map((item, i) => (
                <li key={item.slug} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onClick={() => openProduct(item.slug)}
                    onMouseEnter={() => setActive(i)}
                    className={cn("flex min-h-[76px] w-full items-center gap-3.5 rounded-2xl px-2 text-left transition-colors", i === active && "bg-mist")}
                  >
                    <ProductThumb src={item.image} tint={item.tint} cutout={item.cutout} sizes="60px" className="size-[60px] rounded-[14px]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[16px] text-ink">
                        {highlight(item.name, q).map((part, k) =>
                          part.hit ? <strong key={k} className="font-semibold">{part.text}</strong> : <span key={k} className="text-ink-soft">{part.text}</span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-ink-soft">{item.categoryName}</span>
                    </span>
                    <span className="shrink-0 text-[14px] font-medium tabular-nums text-ink">
                      {item.soldOut ? <span className="text-ink-soft">Sold out</span> : formatPrice(item.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => seeAll()} className="btn btn-outline mt-4 w-full">
              See all {all.length} {all.length === 1 ? "result" : "results"} <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        ) : (
          <div className="px-2 py-12 text-center">
            <p className="text-[17px] font-semibold text-ink">No results for “{q}”</p>
            <p className="mt-1.5 text-[15px] text-ink-soft">Check the spelling, or try one of these.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {POPULAR.map(term => (
                <button key={term} type="button" onClick={() => setQ(term)} className="btn btn-soft btn-sm">{term}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Global ⌘K / Ctrl+K and "/" shortcuts, bound next to the dialog that owns them. */
export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") || (e.key === "/" && !typing)) {
        e.preventDefault();
        onOpen();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onOpen]);
}
