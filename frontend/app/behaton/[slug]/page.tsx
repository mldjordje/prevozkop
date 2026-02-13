import type { Metadata } from "next";
import Script from "next/script";
import BehatonProductClient from "./product-client";
import { getProduct, getProducts } from "@/lib/api";
import type { Product } from "@/lib/api";
import { buildMetadata, SITE_URL, srEnLanguages } from "@/lib/seo";

export const revalidate = 300;

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const product = await getProduct(params.slug);
    return buildMetadata({
      title: `${product.name} | Behaton`,
      description:
        product.short_description ||
        product.description ||
        "Detalji o behaton proizvodu i preporuke za ugradnju.",
      path: `/behaton/${product.slug}`,
      image: product.image || "/img/behaton/SLI_4930.JPG",
      languages: srEnLanguages(`/behaton/${product.slug}`, "/en"),
    });
  } catch {
    return buildMetadata({
      title: "Behaton proizvod",
      description: "Detalji o behaton proizvodu i ponudi.",
      path: "/behaton",
      image: "/img/behaton/SLI_4930.JPG",
      languages: srEnLanguages("/behaton", "/en"),
    });
  }
}

export default async function BehatonProductPage({ params }: PageProps) {
  let product: Product | null = null;
  let related: Product[] = [];

  try {
    product = await getProduct(params.slug);
  } catch {
    product = null;
  }

  if (product) {
    try {
      const allProducts = await getProducts({ category: "behaton", limit: 80, offset: 0 });
      related = (allProducts.data || [])
        .filter((item) => item.category?.trim().toLowerCase() === "behaton")
        .filter((item) => item.slug !== product!.slug)
        .slice(0, 3);
    } catch {
      related = [];
    }
  }

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
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Behaton",
              item: `${SITE_URL}/behaton`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: product?.name || "Behaton proizvod",
              item: `${SITE_URL}/behaton/${params.slug}`,
            },
          ],
        })}
      </Script>
      {product && (
        <Script id="behaton-related-itemlist-jsonld" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: related.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              url: `${SITE_URL}/behaton/${item.slug}`,
            })),
          })}
        </Script>
      )}
    </>
  );
}
