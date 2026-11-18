import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Square product thumbnail on the product's colour field. Cut-out renders are
 * contained with breathing room; both multiply into the tint so white backdrops vanish.
 */
export function ProductThumb({
  src,
  tint,
  cutout = false,
  alt = "",
  sizes,
  className,
}: {
  src: string;
  tint?: string;
  cutout?: boolean;
  alt?: string;
  sizes: string;
  className?: string;
}) {
  return (
    <span
      className={cn("tint-media relative block shrink-0 overflow-hidden", className)}
      style={{ "--tint": tint } as React.CSSProperties}
    >
      <Image
        src={src}
        alt={alt}
        data-studio=""
        fill
        sizes={sizes}
        className={cutout ? "object-contain p-[9%]" : "object-cover object-[50%_20%]"}
      />
    </span>
  );
}
