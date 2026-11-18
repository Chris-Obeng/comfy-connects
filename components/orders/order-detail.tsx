"use client";
import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { Skeleton } from "@heroui/react";
import { getOrder, subscribeOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { findBranch, site } from "@/lib/config";
import { buttonClass } from "@/lib/button-class";
import { OrderTotals } from "@/components/shared/order-totals";

const emptySubscribe = () => () => {};

/**
 * Shared order page: the post-checkout confirmation (?placed=1 adds the
 * thank-you hero) and the /orders/[id] detail view render the same content.
 */
export function OrderDetail({ id, placed = false }: { id: string; placed?: boolean }) {
  // Server snapshot null → real order once hydrated; updates live when the
  // checkout page saves this same order.
  const order = useSyncExternalStore(subscribeOrders, () => getOrder(id) ?? null, () => null);
  // SSR can't read localStorage — keep the skeleton up until hydration so the
  // "not found" state never flashes for a bookmarked order.
  const hydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const reduce = useReducedMotion();

  const isPickup = order?.delivery.method === "pickup";
  const branch = findBranch(order?.delivery.branch);
  const firstName = order?.customer.name.split(" ")[0] ?? "";

  if (!hydrated) {
    return (
      <div className="container-shell max-w-[640px] py-12">
        <Skeleton className="mx-auto size-14 rounded-full bg-mist" />
        <Skeleton className="mx-auto mt-6 h-10 w-64 rounded-xl bg-mist" />
        <Skeleton className="mt-12 h-64 w-full rounded-2xl bg-mist" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-shell flex flex-1 flex-col items-center justify-center py-24 text-center">
        <h1 className="display text-[32px] text-ink sm:text-[40px]">We couldn’t find that order.</h1>
        <p className="mt-3 max-w-sm text-[15px] leading-7 text-ink-soft">
          Orders placed on this device appear here. Your cart is right where you left it.
        </p>
        <div className="mt-7 flex gap-4">
          <Link href="/shop" className={buttonClass({ className: "px-6" })}>Continue shopping</Link>
          <Link
            href="/orders"
            className="inline-flex min-h-11 items-center text-[15px] font-medium text-ink transition-opacity hover:opacity-70"
          >
            Your orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-shell max-w-[640px] flex-1 py-10 sm:py-14">
      <div className="text-center">
        {placed ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
            className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-soft"
          >
            <Check className="size-6 stroke-[2] text-brand" aria-hidden />
          </motion.div>
        ) : null}
        <h1 className="display mt-6 text-[32px] text-ink sm:text-[40px]">
          {placed ? `Thank you, ${firstName}.` : "Order details"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-ink-soft">
          {placed
            ? "Your order is in. We’ll be in touch shortly to confirm the details."
            : "Placed on this device. We’ll be in touch to confirm the details."}
        </p>
        <p className="mt-4 inline-flex items-center rounded-full bg-mist px-3.5 py-1.5 text-xs text-ink-soft">
          Order {order.id}
        </p>
      </div>

      <section aria-label="Order items" className="mt-10 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <div className="divide-y divide-line">
          {order.items.map(item => (
            <div key={item.key} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <Link
                href={`/product/${item.slug}`}
                className="tint-media relative size-16 shrink-0 overflow-hidden rounded-2xl"
                style={{ "--tint": item.tint } as React.CSSProperties}
                aria-label={`View ${item.name}`}
              >
                <Image src={item.image} alt={item.name} data-studio="" fill preload={false} sizes="64px" className={item.cutout ? "object-contain p-2" : "object-cover"} />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  <Link href={`/product/${item.slug}`} className="transition-opacity hover:opacity-70">
                    {item.name}
                  </Link>
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">{item.color} · {item.size} · Qty {item.quantity}</p>
              </div>
              <p className="text-sm tabular-nums text-ink">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-1 border-t border-line pt-4">
          <OrderTotals
            subtotal={order.subtotal}
            feeLabel={isPickup ? "Pickup" : "Delivery"}
            fee={order.deliveryFee}
            total={order.total}
          />
        </div>
      </section>

      <div className="mt-4 grid gap-x-8 gap-y-5 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <p className="text-xs text-ink-faint">{isPickup ? "Pickup" : "Delivery"}</p>
          <p className="mt-1.5 text-sm font-medium text-ink">
            {isPickup
              ? branch
                ? `${branch.name} · ${branch.address}`
                : `In store, ${site.location}`
              : [order.delivery.address, order.delivery.area, order.delivery.city, order.delivery.region].filter(Boolean).join(", ")}
          </p>
          {order.delivery.eta && <p className="mt-0.5 text-sm text-ink-soft">{isPickup ? order.delivery.eta : `Arrives ${order.delivery.eta.toLowerCase()}`}</p>}
          {order.delivery.notes && <p className="mt-1 text-sm leading-6 text-ink-soft">{order.delivery.notes}</p>}
        </div>
        <div>
          <p className="text-xs text-ink-faint">Contact</p>
          <p className="mt-1.5 text-sm font-medium text-ink">{order.customer.name}</p>
          <p className="mt-0.5 text-sm leading-6 text-ink-soft">
            {order.customer.phone}{order.customer.email ? ` · ${order.customer.email}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link href="/shop" className={buttonClass({ className: "px-7" })}>Continue shopping</Link>
        <Link
          href="/orders"
          className="inline-flex min-h-11 items-center text-sm font-medium text-ink transition-opacity hover:opacity-70"
        >
          View all orders
        </Link>
      </div>
    </div>
  );
}
