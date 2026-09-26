import type { Product } from "@/lib/api";
import { getBehatonProductListingImage } from "@/lib/behaton-media";

export type CatalogItem = {
  id: number;
  slug: string;
  name: string;
  /** "Elegance", "City Line" … — product name without the "Ploča" prefix. */
  model: string;
  /** "20x20 · d=8 cm" style spec line. */
  spec: string;
  thickness: number | null;
  image: string;
  isPackshot: boolean;
};

const titleCase = (value: string) =>
  value
    .toLowerCase()
    .replace(/(^|[\s(-])(\p{L})/gu, (_, pre: string, ch: string) => pre + ch.toUpperCase());

export function toCatalogItem(product: Product): CatalogItem {
  const raw = `${product.name} ${product.short_description ?? ""}`;
  const thicknessMatch = raw.match(/d\s*=\s*(\d+)\s*cm/i);
  const model = titleCase(
    product.name
      .replace(/^plo[cč]a\s+/i, "")
      .replace(/\(ravna ivica\)/i, "")
      .replace(/dimenzija.*$/i, "")
      .replace(/\d.*$/, "")
      .trim(),
  ) || titleCase(product.name);

  const spec = (product.short_description || product.name)
    .replace(/^dimenzija\s*/i, "")
    .replace(/^taktilna\s*dimenzija\s*/i, "")
    .trim();

  const image = getBehatonProductListingImage(product) || "/img/napolje1.webp";

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    model,
    spec,
    thickness: thicknessMatch ? Number(thicknessMatch[1]) : null,
    image,
    isPackshot: /\.png$/i.test(image) || /removebg|packshot|studio/i.test(image),
  };
}

/** Drops placeholder rows (e.g. products literally named "1" / "2"). */
export function isRealBehatonProduct(product: Product) {
  return product.name.trim().length > 2 && !/^\d+$/.test(product.name.trim());
}
