import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs";
  const lastModified = new Date();

  const routes = [
    "/",
    "/porucivanje-betona",
    "/usluge",
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

  return routes.map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}

