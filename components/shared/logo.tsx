import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/config";

/**
 * The store's own mark, from `public/logo.jpeg`: the mint tile with the charcoal
 * C and the red dot. Never redrawn — the artwork is the logo.
 *
 * `light` is for dark surfaces: the mint tile already reads there, so it only
 * flips the wordmark to white.
 */
export function Logo({
  className,
  light = false,
  priority = false,
  markOnly = false,
}: {
  className?: string;
  light?: boolean;
  priority?: boolean;
  markOnly?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} home`}
      className={cn("press inline-flex shrink-0 items-center gap-2.5", className)}
    >
      <Image
        src="/logo.jpeg"
        alt=""
        width={120}
        height={120}
        preload={priority}
        sizes="40px"
        className="size-9 shrink-0 rounded-[26%] sm:size-10"
      />
      {!markOnly && (
        <span
          className={cn(
            "whitespace-nowrap text-[16px] font-semibold tracking-[-0.02em]",
            light ? "text-white" : "text-ink"
          )}
        >
          {site.name}
        </span>
      )}
    </Link>
  );
}
