"use client";
import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type FieldErrors, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skeleton } from "@heroui/react";
import { AlertCircle, ChevronDown, CreditCard, Loader2, Lock, MapPin, Smartphone, Store, Truck } from "lucide-react";
import { toast } from "sonner";
import { checkoutSchema, normalizeGhanaPhone, type CheckoutValues } from "@/lib/checkout-schema";
import { deliveryQuote, findBranch, isLocalRegion, localAreas, pickup, regions, storeBranches } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { initiatePayment } from "@/lib/payments";
import { saveOrder } from "@/lib/orders";
import { useCart, cartSubtotal, cartCount } from "@/store/cart";
import { useCartHydrated } from "@/components/cart/use-cart-hydrated";
import { EmptyBag } from "@/components/shared/empty-bag";
import { ProductThumb } from "@/components/shared/product-thumb";
import { cn } from "@/lib/utils";
import type { CartItem, Order } from "@/types";

/* ------------------------------------------------------------------------------------------------
 * Field primitives: one look for every input. 52px tall, 16px text (no iOS zoom), label above,
 * error below with an icon, aria wired.
 * ---------------------------------------------------------------------------------------------- */
const fieldBase =
  "scroll-mt-28 h-[52px] w-full rounded-[12px] border bg-white px-4 text-[16px] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-faint focus:border-ink focus:ring-4 focus:ring-ink/8";

function Field({
  label,
  optional,
  hint,
  error,
  children,
  id,
}: {
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string; className: string }) => React.ReactNode;
  id?: string;
}) {
  const auto = useId();
  const fieldId = id ?? auto;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={fieldId} className="text-[14px] font-medium text-ink">
        {label} {optional && <span className="font-normal text-ink-soft">(optional)</span>}
      </label>
      {children({
        id: fieldId,
        "aria-invalid": !!error,
        "aria-describedby": describedBy,
        className: cn(fieldBase, error ? "border-sale focus:border-sale focus:ring-sale/10" : "border-[#d4d4d4]"),
      })}
      {error ? (
        <p id={`${fieldId}-error`} className="flex items-center gap-1.5 text-[13px] font-medium text-sale">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden /> {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-[13px] text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}

function SelectField({ register, options, placeholder, ...props }: { register: UseFormRegisterReturn; options: { value: string; label: string }[]; placeholder: string } & Omit<React.ComponentProps<typeof Field>, "children">) {
  return (
    <Field {...props}>
      {p => (
        <div className="relative">
          <select {...register} {...p} className={cn(p.className, "appearance-none pr-11")} defaultValue="">
            <option value="" disabled>{placeholder}</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-[18px] -translate-y-1/2 text-ink-soft" aria-hidden />
        </div>
      )}
    </Field>
  );
}

/** Large tappable radio card built on a real (visually hidden) radio input. */
function ChoiceCard({ register, value, icon: Icon, title, text, aside }: { register: UseFormRegisterReturn; value: string; icon: React.ElementType; title: string; text: string; aside?: React.ReactNode }) {
  return (
    <label className="press group relative flex cursor-pointer items-center gap-3.5 rounded-[20px] border-[1.5px] border-line bg-white p-4 transition-colors has-[:checked]:border-ink has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand has-[:focus-visible]:ring-offset-2">
      <input type="radio" value={value} {...register} className="peer sr-only" />
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-mist text-ink transition-colors group-has-[:checked]:bg-ink group-has-[:checked]:text-white">
        <Icon className="size-5 stroke-[1.6]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-[13px] leading-5 text-ink-soft">{text}</span>
      </span>
      {aside}
      <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#c4c4c4] transition-colors group-has-[:checked]:border-ink group-has-[:checked]:bg-ink">
        <span className="size-2 rounded-full bg-white opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
      </span>
    </label>
  );
}

/** Pickup branch card: shop name, street address and a radio dot. */
function BranchCard({ register, id, name, address, area }: { register: UseFormRegisterReturn; id: string; name: string; address: string; area: string }) {
  return (
    <label className="press group relative flex cursor-pointer items-start gap-3.5 rounded-[20px] border-[1.5px] border-line bg-white p-4 transition-colors has-[:checked]:border-ink has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand has-[:focus-visible]:ring-offset-2">
      <input type="radio" value={id} {...register} className="peer sr-only" />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink">{name}</span>
        <span className="mt-0.5 block text-[14px] leading-5 text-ink-soft">{address}</span>
        <span className="mt-0.5 block text-[13px] text-ink-faint">{area}</span>
      </span>
      <span className="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#c4c4c4] transition-colors group-has-[:checked]:border-ink group-has-[:checked]:bg-ink">
        <span className="size-2 rounded-full bg-white opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
      </span>
    </label>
  );
}

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="rounded-[20px] bg-white p-5 sm:p-7">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 id={id} className="text-[21px] font-semibold tracking-[-0.022em] text-ink">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Order summary: sticky card on desktop, collapsible bar on phones.
 * ---------------------------------------------------------------------------------------------- */
function SummaryItems({ items }: { items: CartItem[] }) {
  return (
    <ul role="list" className="divide-y divide-line">
      {items.map(item => (
        <li key={item.key} className="flex items-center gap-3.5 py-3.5 first:pt-0">
          <span className="relative">
            <ProductThumb src={item.image} tint={item.tint} cutout={item.cutout} alt={item.name} sizes="64px" className="size-16 rounded-2xl" />
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-semibold text-white ring-2 ring-white">
              {item.quantity}
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-ink">{item.name}</p>
            <p className="mt-0.5 text-[13px] text-ink-soft">{[item.color, item.size !== "Standard" ? item.size : null].filter(Boolean).join(" · ")}</p>
          </div>
          <p className="text-[15px] font-medium tabular-nums text-ink">{formatPrice(item.price * item.quantity)}</p>
        </li>
      ))}
    </ul>
  );
}

function Totals({ subtotal, fee, feeLabel, total, eta }: { subtotal: number; fee: number | null; feeLabel: string; total: number; eta?: string }) {
  return (
    <dl className="space-y-2.5 text-[15px]">
      <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd className="tabular-nums text-ink">{formatPrice(subtotal)}</dd></div>
      <div className="flex justify-between gap-4">
        <dt className="text-ink-soft">{feeLabel}{eta && <span className="block text-[13px]">{eta}</span>}</dt>
        <dd className="text-right tabular-nums text-ink">{fee === null ? <span className="text-ink-soft">Choose your town</span> : fee === 0 ? "Free" : formatPrice(fee)}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-line pt-3.5">
        <dt className="text-[17px] font-semibold text-ink">Total</dt>
        <dd className="text-[22px] font-semibold tracking-[-0.01em] tabular-nums text-ink">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const items = useCart(s => s.items);
  const clear = useCart(s => s.clear);
  const [processing, setProcessing] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const subtotal = cartSubtotal(items);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { fullName: "", phone: "", email: "", method: "delivery", branch: "", region: "", area: "", city: "", address: "", gps: "", notes: "", payment: "momo" },
    mode: "onTouched",
    shouldFocusError: true,
  });
  const [method, branch, region, area] = useWatch({ control, name: ["method", "branch", "region", "area"] });

  // Changing region invalidates the town list of the previous one.
  useEffect(() => { if (!isLocalRegion(region)) setValue("area", ""); }, [region, setValue]);
  const towns = isLocalRegion(region) ? (localAreas[region!] ?? []) : [];

  const branchName = findBranch(branch)?.name;
  const quote = method === "pickup" ? { fee: 0, eta: branchName ? `${branchName} · ${pickup.eta}` : "Choose a shop" } : deliveryQuote(region, area);
  const fee = quote?.fee ?? null;
  const total = subtotal + (fee ?? 0);

  async function onSubmit(values: CheckoutValues) {
    setProcessing(true);
    const delivery: Order["delivery"] =
      values.method === "pickup"
        ? { method: "pickup", branch: values.branch, eta: pickup.eta }
        : {
            method: "delivery",
            region: values.region,
            area: isLocalRegion(values.region) ? values.area : undefined,
            city: isLocalRegion(values.region) ? values.area : values.city?.trim(),
            address: [values.address?.trim(), values.gps?.trim().toUpperCase()].filter(Boolean).join(" · "),
            notes: values.notes?.trim() || undefined,
            eta: quote?.eta,
          };
    const order: Order = {
      id: "pending",
      items,
      subtotal,
      deliveryFee: fee ?? 0,
      total,
      customer: { name: values.fullName.trim(), phone: normalizeGhanaPhone(values.phone), email: values.email?.trim() || undefined },
      delivery,
      payment: values.payment,
    };
    try {
      // Mock payment boundary: lib/payments.ts. Replace with Paystack there.
      const result = await initiatePayment(order);
      if (!result.success) throw new Error("Payment could not be started.");
      const confirmed = { ...order, id: result.reference };
      saveOrder(confirmed);
      toast.dismiss();
      haptic("success");
      // Navigate first, then clear, so the empty-bag state never flashes.
      await router.push(`/orders/${confirmed.id}?placed=1`);
      clear();
    } catch {
      setProcessing(false);
      toast.error("We couldn’t start the payment", { description: "Check your connection and try again." });
    }
  }

  function onInvalid(errs: FieldErrors<CheckoutValues>) {
    const n = Object.keys(errs).length;
    toast.error(n === 1 ? "One detail needs attention" : `${n} details need attention`, { description: "They’re highlighted in red." });
  }

  if (!hydrated) {
    return (
      <div className="container-shell flex-1 py-8">
        <div className="mx-auto grid max-w-[1080px] gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            <Skeleton className="h-10 w-48 rounded-xl bg-white" />
            <Skeleton className="h-64 w-full rounded-[20px] bg-white" />
            <Skeleton className="h-80 w-full rounded-[20px] bg-white" />
          </div>
          <Skeleton className="hidden h-96 w-full rounded-[20px] bg-white lg:block" />
        </div>
      </div>
    );
  }

  if (!items.length) {
    if (processing) {
      return (
        <div className="container-shell flex flex-1 flex-col items-center justify-center py-24">
          <Loader2 className="size-7 animate-spin text-ink-soft" aria-hidden />
          <p className="mt-4 text-[15px] text-ink-soft">Placing your order…</p>
        </div>
      );
    }
    return (
      <div className="container-shell flex flex-1 flex-col py-10">
        <h1 className="sr-only">Checkout</h1>
        <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col rounded-[20px] bg-white">
          <EmptyBag />
        </div>
      </div>
    );
  }

  const feeLabel = method === "pickup" ? "Pickup" : "Delivery";
  const payLabel = processing ? (
    <span className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Processing…</span>
  ) : (
    <span className="flex items-center gap-2"><Lock className="size-4" /> Pay {formatPrice(total)}</span>
  );

  return (
    <div className="container-shell flex-1 pb-36 pt-6 sm:pt-10 lg:pb-16">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex items-end justify-between gap-4">
          <h1 className="display text-[36px] text-ink sm:text-[48px]">Checkout</h1>
          <Link href="/shop" className="mb-1.5 hidden text-[14px] font-medium text-ink-soft hover:text-ink sm:block">Continue shopping</Link>
        </div>

        {/* Phones: collapsible order summary */}
        <div className="mt-5 overflow-hidden rounded-[20px] bg-white lg:hidden">
          <button
            type="button"
            onClick={() => setSummaryOpen(o => !o)}
            aria-expanded={summaryOpen}
            aria-controls="mobile-summary"
            className="flex min-h-[60px] w-full items-center justify-between gap-3 px-5 text-left"
          >
            <span className="flex items-center gap-2 text-[15px] font-medium text-ink">
              {summaryOpen ? "Hide" : "Show"} order summary
              <span className="text-ink-soft">({cartCount(items)})</span>
              <ChevronDown className={cn("size-4 transition-transform duration-200", summaryOpen && "rotate-180")} aria-hidden />
            </span>
            <span className="text-[17px] font-semibold tabular-nums text-ink">{formatPrice(total)}</span>
          </button>
          <div
            id="mobile-summary"
            className="grid transition-[grid-template-rows] duration-300 ease-[var(--ease-out)]"
            style={{ gridTemplateRows: summaryOpen ? "1fr" : "0fr" }}
          >
            <div className={cn("overflow-hidden", !summaryOpen && "invisible")}>
              <div className="border-t border-line px-5 pb-5 pt-4">
                <SummaryItems items={items} />
                <div className="mt-2 border-t border-line pt-4">
                  <Totals subtotal={subtotal} fee={fee} feeLabel={feeLabel} total={total} eta={quote?.eta} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid items-start gap-4 sm:mt-6 lg:grid-cols-[1fr_400px] lg:gap-6">
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate aria-busy={processing} className="grid gap-4">
            <Section title="Contact">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" error={errors.fullName?.message} id="fullName">
                  {p => <input {...p} {...register("fullName")} autoComplete="name" placeholder="Ama Mensah" />}
                </Field>
                <Field label="Phone" error={errors.phone?.message} id="phone">
                  {p => <input {...p} {...register("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="024 123 4567" />}
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Email" optional error={errors.email?.message} id="email">
                    {p => <input {...p} {...register("email")} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" />}
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="Delivery">
              <fieldset>
                <legend className="sr-only">How would you like to get your order?</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ChoiceCard register={register("method")} value="delivery" icon={Truck} title="Deliver to me" text="Anywhere in Ghana" />
                  <ChoiceCard register={register("method")} value="pickup" icon={Store} title="Pick up in store" text={`Koforidua or Kasoa · ${pickup.eta}`} />
                </div>
              </fieldset>

              {method === "delivery" ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <SelectField
                    id="region"
                    label="Region"
                    error={errors.region?.message}
                    register={register("region")}
                    placeholder="Choose your region"
                    options={regions.map(r => ({ value: r.name, label: r.name }))}
                  />
                  {isLocalRegion(region) ? (
                    <SelectField
                      id="area"
                      label="Town"
                      error={errors.area?.message}
                      register={register("area")}
                      placeholder="Choose your town"
                      options={towns.map(a => ({ value: a.name, label: `${a.name} · ${formatPrice(a.fee)}` }))}
                    />
                  ) : (
                    <Field label="Town or city" error={errors.city?.message} id="city">
                      {p => <input {...p} {...register("city")} autoComplete="address-level2" placeholder={region ? "e.g. Kumasi" : "Choose a region first"} disabled={!region} />}
                    </Field>
                  )}
                  <div className="sm:col-span-2">
                    <Field label="Address or landmark" error={errors.address?.message} id="address">
                      {p => <input {...p} {...register("address")} autoComplete="street-address" placeholder="House number, street, nearby landmark" />}
                    </Field>
                  </div>
                  <Field label="Ghana Post GPS" optional error={errors.gps?.message} id="gps">
                    {p => <input {...p} {...register("gps")} autoCapitalize="characters" placeholder="GA-123-4567" />}
                  </Field>
                  <Field label="Note for the rider" optional error={errors.notes?.message} id="notes">
                    {p => <input {...p} {...register("notes")} placeholder="Call when you arrive" />}
                  </Field>
                  {quote && (
                    <p className="flex items-center gap-2.5 rounded-2xl bg-brand-soft px-4 py-3 text-[14px] text-ink sm:col-span-2" aria-live="polite">
                      <Truck className="size-[18px] shrink-0 text-brand" aria-hidden />
                      <span><strong className="font-semibold">{formatPrice(quote.fee)}</strong> · arrives {quote.eta.toLowerCase()}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-6">
                  <fieldset aria-describedby={errors.branch ? "branch-error" : undefined}>
                    <legend className="mb-2.5 text-[14px] font-medium text-ink">Which shop will you collect from?</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {storeBranches.map(b => (
                        <BranchCard key={b.id} register={register("branch")} id={b.id} name={b.name} address={b.address} area={b.area} />
                      ))}
                    </div>
                    {errors.branch && (
                      <p id="branch-error" className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-sale">
                        <AlertCircle className="size-3.5 shrink-0" aria-hidden /> {errors.branch.message}
                      </p>
                    )}
                  </fieldset>
                  <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-brand-soft px-4 py-3 text-[14px] leading-6 text-ink">
                    <MapPin className="mt-0.5 size-[18px] shrink-0 text-brand" aria-hidden />
                    <span>
                      {branchName ? `${branchName} · ` : ""}{pickup.eta}. We’ll WhatsApp you when it’s ready to collect.
                    </span>
                  </p>
                </div>
              )}
            </Section>

            <Section title="Payment" aside={<span className="flex items-center gap-1.5 text-[13px] text-ink-soft"><Lock className="size-3.5" aria-hidden /> Paystack</span>}>
              <fieldset>
                <legend className="sr-only">Payment method</legend>
                <div className="grid gap-3">
                  <ChoiceCard register={register("payment")} value="momo" icon={Smartphone} title="Mobile Money" text="MTN MoMo, Telecel Cash, AirtelTigo Money" />
                  <ChoiceCard register={register("payment")} value="card" icon={CreditCard} title="Card" text="Visa, Mastercard and Verve" />
                </div>
              </fieldset>
              <button type="submit" disabled={processing} className="btn btn-primary btn-caps mt-6 hidden w-full lg:flex">
                {payLabel}
              </button>
            </Section>
          </form>

          {/* Desktop: sticky summary */}
          <aside aria-label="Order summary" className="sticky top-[76px] hidden rounded-[20px] bg-white p-7 lg:block">
            <h2 className="text-[21px] font-semibold tracking-[-0.022em] text-ink">Your order</h2>
            <div className="-mx-2 mt-3 max-h-[360px] overflow-y-auto px-2 pt-2">
              <SummaryItems items={items} />
            </div>
            <div className="mt-2 border-t border-line pt-5">
              <Totals subtotal={subtotal} fee={fee} feeLabel={feeLabel} total={total} eta={quote?.eta} />
            </div>
          </aside>
        </div>
      </div>

      {/* Phones: pay bar stays in reach of the thumb */}
      <div data-sticky-cta className="translucent safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-white/90 px-4 pt-3 backdrop-blur-xl lg:hidden">
        <button type="submit" form="checkout-form" disabled={processing} className="btn btn-primary btn-lg btn-caps w-full">
          {payLabel}
        </button>
      </div>
    </div>
  );
}
