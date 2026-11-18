import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** − 1 + pill. `lg` matches the 52px buy button beside it; `sm` sits inside cart rows. */
export function QuantityStepper({
  value,
  max,
  onChange,
  label,
  size = "lg",
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  size?: "sm" | "lg";
}) {
  const box = size === "lg" ? "h-[52px]" : "h-11";
  const hit = size === "lg" ? "w-11" : "w-10";
  return (
    <div className={cn("inline-flex shrink-0 items-center rounded-full bg-mist", box)} role="group" aria-label={`Quantity for ${label}`}>
      <button
        type="button"
        className={cn("press flex h-full items-center justify-center rounded-full text-ink disabled:opacity-30", hit)}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="w-6 text-center text-[15px] font-medium tabular-nums" aria-live="polite">{value}</span>
      <button
        type="button"
        className={cn("press flex h-full items-center justify-center rounded-full text-ink disabled:opacity-30", hit)}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={value >= max ? "No more in stock" : "Increase quantity"}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
