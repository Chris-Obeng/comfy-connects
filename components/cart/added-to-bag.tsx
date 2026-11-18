"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { Check, X } from "lucide-react";
import { useBagUI, useCart, cartCount } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import { ProductThumb } from "@/components/shared/product-thumb";

const VISIBLE_MS = 4500;

/**
 * "Added to bag" confirmation. Drops in under the header (anchored under the bag
 * icon on desktop), shows exactly what was added, and offers the two next steps.
 * Swipe up or tap × to dismiss; the timer pauses while a finger or pointer is on it.
 */
export function AddedToBag() {
  const added = useBagUI(s => s.added);
  const hide = useBagUI(s => s.hideAdded);
  const openBag = useBagUI(s => s.setOpen);
  const count = useCart(s => cartCount(s.items));
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restart the countdown for every new add; hold it while the user is touching the card.
  useEffect(() => {
    if (!added || paused) return;
    timer.current = setTimeout(hide, VISIBLE_MS);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [added, paused, hide]);

  // A route change means the user moved on.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) hide();
    lastPath.current = pathname;
  }, [pathname, hide]);

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y < -30 || info.velocity.y < -300) hide();
  }

  const item = added?.item;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+60px)] z-50 flex justify-center px-3 sm:justify-end sm:px-6 lg:top-[64px] lg:px-10">
      <div className="w-full max-w-[1280px] sm:flex sm:justify-end">
        <AnimatePresence>
          {item && (
            <motion.div
              key={added.at}
              role="status"
              aria-live="polite"
              drag={reduce ? false : "y"}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.6, bottom: 0.08 }}
              onDragEnd={onDragEnd}
              onPointerEnter={() => setPaused(true)}
              onPointerLeave={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.97, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] } }}
              transition={{ type: "spring", duration: 0.42, bounce: 0.12 }}
              className="pointer-events-auto w-full touch-pan-x overflow-hidden rounded-[22px] bg-white/95 p-4 shadow-[0_18px_50px_-12px_rgb(17_17_17/0.28),0_2px_8px_rgb(17_17_17/0.06)] ring-1 ring-black/5 backdrop-blur-xl sm:w-[380px]"
            >
              <div className="flex items-start gap-3.5">
                <ProductThumb src={item.image} tint={item.tint} cutout={item.cutout} sizes="64px" className="size-16 rounded-2xl" />
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="flex items-center gap-1.5 text-[13px] font-semibold text-brand">
                    <span className="flex size-4 items-center justify-center rounded-full bg-brand">
                      <Check className="size-2.5 stroke-[3.5] text-white" aria-hidden />
                    </span>
                    Added to cart
                  </p>
                  <p className="mt-1 truncate text-[15px] font-semibold text-ink">{item.name}</p>
                  <p className="mt-0.5 text-[13px] text-ink-soft">
                    {[item.color, item.size !== "Standard" ? item.size : null].filter(Boolean).join(" · ")} · {formatPrice(item.price)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={hide}
                  aria-label="Dismiss"
                  className="press -mr-1.5 -mt-1.5 flex size-9 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-mist hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => openBag(true)}
                  className="press h-11 rounded-full bg-mist text-[14px] font-semibold text-ink hover:bg-[#e6e6e6]"
                >
                  View cart ({count})
                </button>
                <Link
                  href="/checkout"
                  onClick={hide}
                  className="press flex h-11 items-center justify-center rounded-full bg-ink text-[14px] font-semibold text-white hover:bg-[#2b2b2b]"
                >
                  Check out
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
