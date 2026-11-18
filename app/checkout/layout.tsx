import Link from "next/link";
import { ChromeHeader } from "@/components/shared/chrome-header";
import { site } from "@/lib/config";

export default function CheckoutLayout({ children }: LayoutProps<"/checkout">) {
  return (
    <div className="flex min-h-svh flex-col bg-mist">
      <ChromeHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="container-shell flex flex-wrap items-center justify-between gap-2 py-6 text-[13px] text-ink-soft">
        <p>© {new Date().getFullYear()} {site.name} · {site.city}</p>
        <Link href="/shop" className="font-medium underline decoration-line underline-offset-4 transition-colors hover:text-ink">Continue shopping</Link>
      </footer>
    </div>
  );
}
