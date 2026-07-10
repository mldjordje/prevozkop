import type { MetadataRoute } from "next";
import { behatonCities, betonCities } from "@/content/behaton";
import { getProducts, getProjects } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const priorityRoutes: Record<string, number> = {
    "/": 1,
    "/porucivanje-betona": 0.95,
    "/beton": 0.95,
    "/behaton": 0.95,
    "/usluge": 0.9,
    "/kontakt": 0.8,
    "/behaton/grad/nis": 0.85,
    "/beton/grad/nis": 0.85,
  };

  const staticRoutes = [
    "/",
    "/porucivanje-betona",
    "/beton",
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
  ];

  const cityRoutes = behatonCities.map((city) => `/behaton/grad/${city.slug}`);
  const betonCityRoutes = betonCities.map((city) => `/beton/grad/${city.slug}`);

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts({ category: "behaton", limit: 300, offset: 0 });
    productEntries = products.data.map((product) => ({
      url: `${SITE_URL}/behaton/${product.slug}`,
      lastModified: new Date(product.updated_at || product.created_at || Date.now()),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    productEntries = [];
  }

  let projectEntries: MetadataRoute.Sitemap = [];
  try {
    const projects = await getProjects(300, 0);
    projectEntries = projects.data.map((project) => ({
      url: `${SITE_URL}/projekti/${project.slug}`,
      lastModified: new Date(project.updated_at || project.published_at || project.created_at || Date.now()),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch {
    projectEntries = [];
  }

  const staticEntries: MetadataRoute.Sitemap = [...staticRoutes, ...cityRoutes, ...betonCityRoutes].map(
    (route) => ({
      url: `${SITE_URL}${route === "/" ? "" : route}`,
      lastModified: new Date(),
      changeFrequency: route === "/" ? "weekly" : "monthly",
      priority: priorityRoutes[route] ?? 0.7,
    })
  );

  return [...staticEntries, ...productEntries, ...projectEntries];
}
