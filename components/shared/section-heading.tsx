import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Apple's two-tone section title: "The latest." in ink, the line after it in grey,
 * with an optional quiet link on the right.
 */
export function SectionHeading({ title, tone, href, action }: { title: string; tone?: string; href?: string; action?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-6 sm:mb-7">
      <h2 className="headline min-w-0 text-[28px] text-ink sm:text-[40px]">
        {title}
        {tone && <span className="tone"> {tone}</span>}
      </h2>
      {href && (
        <Link
          href={href}
          className="press group -mb-2 inline-flex min-h-11 shrink-0 items-center gap-0.5 text-[15px] text-ink hover:underline"
        >
          {action ?? "Shop all"}
          <ChevronRight className="size-4 transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
