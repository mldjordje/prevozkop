import type { Metadata } from "next";

const defaultSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs";

export const SITE_URL = defaultSiteUrl;

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  locale?: string;
  type?: "website" | "article";
  image?: string;
  noIndex?: boolean;
  languages?: Record<string, string>;
};

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  locale = "sr_RS",
  type = "website",
  image = "/img/napolje1.webp",
  noIndex = false,
  languages,
}: BuildMetadataInput): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
      languages,
    },
    openGraph: {
      type,
      locale,
      url: path,
      siteName: "Prevozkop",
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

export function srEnLanguages(srPath: string, enPath: string) {
  return {
    "sr-Latn-RS": srPath,
    "en-US": enPath,
    "x-default": srPath,
  };
}
