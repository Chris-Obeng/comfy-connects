import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Square product thumbnail (cart, checkout, search). Small thumbs sit on the neutral grey
 * field, Apple-style, so a list of mixed products reads as one calm column. The studio
 * shot multiplies into the grey, so its white sweep disappears.
 * `tint` is accepted for older callers and ignored on purpose.
 */
export function ProductThumb({
  src,
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
    <span className={cn("tint-media relative block shrink-0 overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        data-studio=""
        fill
        sizes={sizes}
        className={cutout ? "object-contain p-[10%]" : "object-cover object-[50%_20%]"}
      />
    </span>
  );
}
