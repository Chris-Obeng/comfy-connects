import { Logo } from "@/components/shared/logo";

/** Minimal sticky chrome for checkout: logo home, plus an optional trailing slot. */
export function ChromeHeader({ trailing }: { trailing?: React.ReactNode }) {
  return (
    <header className="translucent sticky top-0 z-30 border-b border-hairline bg-white/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="container-shell flex h-[52px] items-center justify-between lg:h-14">
        <Logo priority />
        {trailing}
      </div>
    </header>
  );
}
