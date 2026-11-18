"use client";
import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@heroui/react";
import { formatOrderDate, getOrders, subscribeOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { buttonClass } from "@/lib/button-class";

const EMPTY_ORDERS: never[] = [];
const emptySubscribe = () => () => {};

export function OrdersList() {
  const orders = useSyncExternalStore(subscribeOrders, getOrders, () => EMPTY_ORDERS);
  const hydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!hydrated) {
    return (
      <div className="mt-8 space-y-4">
        <Skeleton className="h-36 w-full rounded-2xl bg-mist" />
        <Skeleton className="h-36 w-full rounded-2xl bg-mist" />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <h2 className="display text-[24px] text-ink">No orders yet.</h2>
        <p className="mt-2 max-w-[280px] text-sm leading-6 text-ink-soft">
          Orders you place on this device will show up here.
        </p>
        <Link href="/shop" className={buttonClass({ className: "mt-6 px-6" })}>
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <ul role="list" className="mt-8 space-y-4">
      {orders.map(order => (
        <li key={order.id}>
          <Link
            href={`/orders/${order.id}`}
            className="group block rounded-2xl border border-line bg-white p-5 transition-colors hover:border-ink/40 sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-baseline gap-3">
                <p className="truncate text-sm font-medium text-ink">Order {order.id}</p>
                {order.createdAt ? (
                  <p className="shrink-0 text-xs text-ink-faint">{formatOrderDate(order.createdAt)}</p>
                ) : null}
              </div>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-mist px-3 py-1 text-xs text-ink-soft">
                Processing
                <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex -space-x-3">
                {order.items.slice(0, 4).map(item => (
                  <span
                    key={item.key}
                    className="tint-media relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-white"
                    style={{ "--tint": item.tint } as React.CSSProperties}
                    aria-hidden
                  >
                    <Image src={item.image} alt="" data-studio="" fill preload={false} sizes="48px" className={item.cutout ? "object-contain p-1.5" : "object-cover"} />
                  </span>
                ))}
                {order.items.length > 4 && (
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-white bg-mist text-[11px] font-medium text-ink-soft">
                    +{order.items.length - 4}
                  </span>
                )}
              </div>
              <p className="shrink-0 text-[15px] font-medium tabular-nums text-ink">
                {formatPrice(order.total)}
                <span className="ml-2 block text-right text-[11px] font-normal text-ink-faint sm:hidden">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </span>
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
