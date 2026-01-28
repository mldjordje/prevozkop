import type { MetadataRoute } from "next";
import { behatonCities } from "@/content/behaton";
import { getProducts } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs";
  const lastModified = new Date();

  let productRoutes: string[] = [];
  try {
    const res = await getProducts({ category: "behaton", limit: 200, offset: 0 });
    productRoutes = res.data.map((product) => `/behaton/${product.slug}`);
  } catch {
    productRoutes = [];
  }

  const cityRoutes = behatonCities.map((city) => `/behaton/grad/${city.slug}`);

  const routes = [
    "/",
    "/porucivanje-betona",
    "/usluge",
    "/behaton",
    "/kontakt",
    "/o-nama",
    "/projekti",
    "/projekti-video",
    "/en",
    "/en/order-concrete",
    "/en/services",
    "/en/projects",
    "/en/about",
    "/en/contact",
    ...cityRoutes,
    ...productRoutes,
  ];

  return routes.map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
