"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { images: string[]; name: string; tint: string; cutout: boolean };

// Photos are framed 4:5 with the focal point high, so heads stay in frame; renders sit square on the tint.
const fitFor = (cutout: boolean) => (cutout ? "object-contain p-[7%]" : "object-cover object-[50%_20%]");
const frame = (cutout: boolean) => (cutout ? "aspect-square" : "aspect-[4/5]");
// Studio shots and renders multiply into the tint (white haze disappears); lifestyle photos stay as shot.
const studio = (cutout: boolean, i: number) => (cutout || i === 0 ? "" : undefined);

/** Full-screen swipe viewer. Opens on the tapped image; Esc, × or the arrows to move. */
function Lightbox({ images, name, tint, cutout, start, onClose }: Props & { start: number; onClose: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(start);

  useEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: start * track.clientWidth });
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [start]);

  const go = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.max(0, Math.min(images.length - 1, i));
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  }, [images.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, go, onClose]);

  return createPortal(
    <div
      className="lightbox fixed inset-0 z-[70] flex flex-col tint-media"
      style={{ "--tint": tint } as React.CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} images`}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 pt-[max(16px,env(safe-area-inset-top))]">
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-[13px] font-semibold tabular-nums text-ink backdrop-blur-md">
          {index + 1} / {images.length}
        </span>
        <button type="button" onClick={onClose} aria-label="Close" autoFocus className="press flex size-11 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur-md">
          <X className="size-5" />
        </button>
      </div>
      <div
        ref={trackRef}
        onScroll={e => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="hide-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-contain"
      >
        {images.map((src, i) => (
          <div key={src} className="relative h-full w-full shrink-0 snap-center">
            {/* Inset clear of the counter, close button and arrows so nothing covers the top or bottom of the photo. */}
            <div className="absolute inset-x-0 top-[max(72px,calc(env(safe-area-inset-top)+64px))] bottom-[max(24px,env(safe-area-inset-bottom))] md:bottom-24">
              <Image src={src} alt={`${name}, image ${i + 1} of ${images.length}`} data-studio={studio(cutout, i)} fill sizes="100vw" quality={85} className="object-contain" />
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-[max(20px,env(safe-area-inset-bottom))] hidden justify-between px-6 md:flex">
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous image" className="press pointer-events-auto flex size-12 items-center justify-center rounded-full bg-white text-ink shadow-md disabled:opacity-30">
          <ChevronLeft className="size-5" />
        </button>
        <button type="button" onClick={() => go(index + 1)} disabled={index === images.length - 1} aria-label="Next image" className="press pointer-events-auto flex size-12 items-center justify-center rounded-full bg-white text-ink shadow-md disabled:opacity-30">
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>,
    document.body
  );
}

export function ProductGallery({ images, name, tint, cutout }: Props) {
  const [active, setActive] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const style = { "--tint": tint } as React.CSSProperties;

  function onScroll() {
    const track = trackRef.current;
    if (track) setActive(Math.round(track.scrollLeft / track.clientWidth));
  }

  function goTo(i: number) {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="min-w-0">
      {/* Phones: edge-to-edge swipe gallery; tap to open full screen */}
      <div className="relative -mx-5 sm:-mx-8 md:hidden">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="tint-media hide-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          style={style}
          aria-label={`${name} images`}
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setViewer(i)}
              aria-label={`Open image ${i + 1} of ${images.length} full screen`}
              className={cn("relative w-full shrink-0 snap-center", frame(cutout))}
            >
              <Image src={src} alt={`${name}, image ${i + 1} of ${images.length}`} data-studio={studio(cutout, i)} fill preload={i === 0} sizes="100vw" className={fitFor(cutout)} />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-2" aria-hidden>
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                onClick={() => goTo(i)}
                className={cn("size-2 rounded-full transition-colors duration-300", active === i ? "bg-ink" : "bg-ink/20")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tablet & desktop: main image + thumbnail strip */}
      <div className="hidden md:block">
        <button
          type="button"
          onClick={() => setViewer(active)}
          aria-label="Open image full screen"
          className={cn("tint-media group relative block w-full cursor-zoom-in overflow-hidden rounded-[24px]", frame(cutout))}
          style={style}
        >
          <Image
            key={images[active]}
            src={images[active]}
            alt={`${name}, image ${active + 1} of ${images.length}`}
            data-studio={studio(cutout, active)}
            fill
            preload
            sizes="(max-width: 1280px) 55vw, 700px"
            className={fitFor(cutout)}
          />
          <span className="absolute bottom-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
            <Expand className="size-4" aria-hidden />
          </span>
        </button>
        {images.length > 1 && <div className="mt-4 flex flex-wrap justify-center gap-2.5">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-pressed={active === i}
              className={cn(
                "tint-media press relative size-16 shrink-0 overflow-hidden rounded-[12px] transition-opacity duration-200",
                active === i ? "ring-[1.5px] ring-ink ring-offset-2" : "opacity-60 hover:opacity-100"
              )}
              style={style}
            >
              <Image src={src} alt="" data-studio={studio(cutout, i)} fill loading="eager" sizes="64px" className={cutout ? "object-contain p-1.5" : "object-cover object-[50%_20%]"} />
            </button>
          ))}
        </div>}
      </div>

      {viewer !== null && (
        <Lightbox images={images} name={name} tint={tint} cutout={cutout} start={viewer} onClose={() => setViewer(null)} />
      )}
    </div>
  );
}
