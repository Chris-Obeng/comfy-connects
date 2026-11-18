import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { CartHydrator } from "@/components/shared/cart-hydrator";
import { Toaster } from "@/components/ui/sonner";
import { editorial } from "@/data/categories";
import { site } from "@/lib/config";

// Closest open face to the grotesks Apple and Beats use: geometric, calm at regular weight.
const sans = Hanken_Grotesk({ variable: "--font-sans-face", subsets: ["latin", "latin-ext"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://comfyconnects.shop"),
  title: {
    default: "Comfy Connects · Gadgets in Koforidua & Kasoa",
    template: "%s · Comfy Connects",
  },
  description:
    "Electronic gadgets and accessories from Comfy Connects: bags and sleeves, power banks, smart glasses, watches and stands. Two shops in Ghana, delivered nationwide. Pay with Mobile Money or card.",
  applicationName: site.name,
  openGraph: {
    title: "Comfy Connects",
    description: "Gadgets and accessories, delivered across Ghana.",
    siteName: site.name,
    locale: "en_GH",
    type: "website",
    images: [{ url: editorial.share.src, width: 1100, height: 1100, alt: editorial.share.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Comfy Connects",
    description: "Gadgets and accessories, delivered across Ghana.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  colorScheme: "light",
  themeColor: "#ffffff",
  // Keep pinch-zoom available: never set maximumScale.
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GH" className={`${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <CartHydrator />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
