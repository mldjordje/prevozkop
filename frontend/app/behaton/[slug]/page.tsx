import type { Metadata } from "next";
import Script from "next/script";
import BehatonProductClient from "./product-client";
import { getProduct } from "@/lib/api";
import type { Product } from "@/lib/api";

export const revalidate = 300;
export const dynamic = "force-dynamic";

type PageProps = {
  params: { slug: string };
};

async function fetchProductDirect(slug: string) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.prevozkop.rs/api";
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as Product;
}

async function fetchProductsDirect(limit: number) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.prevozkop.rs/api";
  const res = await fetch(`${API_BASE}/products?limit=${limit}&offset=0`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { data?: Product[] };
  return data.data || [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const product = await getProduct(params.slug);
    return {
      title: `${product.name} | Behaton`,
      description:
        product.short_description ||
        product.description ||
        "Detalji o behaton proizvodu i preporuke za ugradnju.",
      alternates: { canonical: `/behaton/${product.slug}` },
    };
  } catch {
    return {
      title: "Behaton proizvod",
      description: "Detalji o behaton proizvodu i ponudi.",
      alternates: { canonical: "/behaton" },
    };
  }
}

export default async function BehatonProductPage({ params }: PageProps) {
  let product: Product | null = null;
  let related: Product[] = [];

  try {
    product = await fetchProductDirect(params.slug);
  } catch {
    product = null;
  }

  if (product) {
    try {
      const allProducts = await fetchProductsDirect(60);
      related = (allProducts || [])
        .filter((item) => item.category?.trim().toLowerCase() === "behaton")
        .filter((item) => item.slug !== product!.slug)
        .slice(0, 3);
    } catch {
      related = [];
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs";

  return (
    <>
      <BehatonProductClient slug={params.slug} initialProduct={product} initialRelated={related} />
      <Script id="behaton-product-breadcrumbs" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Pocetna",
              item: `${siteUrl}`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Behaton",
              item: `${siteUrl}/behaton`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: product?.name || "Behaton proizvod",
              item: `${siteUrl}/behaton/${params.slug}`,
            },
          ],
        })}
      </Script>
    </>
  );
}
