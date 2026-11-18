import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts, getRelated } from "@/lib/products";
import { categoryHref, categoryName } from "@/data/categories";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo, ProductTitle } from "@/components/product/product-info";
import { ProductRail } from "@/components/shared/product-rail";
import { SectionHeading } from "@/components/shared/section-heading";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Gadget not found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      type: "website",
      images: [{ url: product.images[0], width: 1024, height: 1024, alt: product.name }],
    },
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getRelated(product);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="container-shell hidden pt-6 md:block">
        <ol className="flex items-center gap-1.5 text-[13px] text-ink-soft">
          <li><Link href="/shop" className="hover:text-ink">Shop</Link></li>
          <li aria-hidden><ChevronRight className="size-3.5" /></li>
          <li><Link href={categoryHref(product.category)} className="hover:text-ink">{categoryName(product.category)}</Link></li>
        </ol>
      </nav>
      <div className="container-shell grid gap-6 pb-28 md:grid-cols-[1.15fr_.85fr] md:gap-12 md:pb-0 md:pt-5 lg:gap-16">
        <ProductTitle product={product} className="pt-5 md:hidden" />
        <ProductGallery images={product.images} name={product.name} tint={product.tint} cutout={product.cutout} />
        <ProductInfo product={product} />
      </div>
      <section className="mt-16 bg-mist py-14 sm:mt-24 sm:py-20">
        <div className="container-shell">
          <SectionHeading title="You may also like" href={categoryHref(product.category)} action="See more" />
          <ProductRail products={related} />
        </div>
      </section>
    </div>
  );
}
