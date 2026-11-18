import { Logo } from "@/components/shared/logo";

/** Minimal sticky chrome for checkout: logo home, plus an optional trailing slot. */
export function ChromeHeader({ trailing }: { trailing?: React.ReactNode }) {
  return (
    <header className="translucent sticky top-0 z-30 border-b border-line/60 bg-white/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="container-shell flex h-[60px] items-center justify-between lg:h-[68px]">
        <Logo priority />
        {trailing}
      </div>
    </header>
  );
}
