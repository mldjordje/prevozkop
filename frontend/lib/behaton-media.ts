import type { Product } from "@/lib/api";

type ProductMediaItem = NonNullable<Product["gallery"]>[number];

type ProductMediaOverride = {
  detailImage?: string;
  listingImage?: string;
  gallery?: string[];
};

function generatedMedia(slug: string): ProductMediaOverride {
  const base = `/img/behaton/products/generated/${slug}`;
  const main = `${base}-main.webp`;

  return {
    detailImage: main,
    listingImage: main,
    gallery: [main, `${base}-group.webp`],
  };
}

const behatonProductMedia: Record<string, ProductMediaOverride> = {
  "ploca-behaton-16-5x20-d-6-cm": generatedMedia("ploca-behaton-16-5x20-d-6-cm"),
  "ploca-behaton-16-5x20-d-8-cm": generatedMedia("ploca-behaton-16-5x20-d-8-cm"),
  "ploca-behaton-ravna-ivica-16-5x20-d-10-cm": generatedMedia("ploca-behaton-ravna-ivica-16-5x20-d-10-cm"),
  "ploca-classic-dimenzija-30x30-d-6-cm": generatedMedia("ploca-classic-dimenzija-30x30-d-6-cm"),
  "ploca-elegance-dimenzija-20x20-d-6-cm": generatedMedia("ploca-elegance-dimenzija-20x20-d-6-cm"),
  "ploca-elegance-dimenzija-20x20-d-8-cm": generatedMedia("ploca-elegance-dimenzija-20x20-d-8-cm"),
  "ploca-uni-elegance-dimenzija-20x10-d-6-cm": generatedMedia("ploca-uni-elegance-dimenzija-20x10-d-6-cm"),
  "ploca-mini-elegance-dimenzija-10x10-d-6-cm": generatedMedia("ploca-mini-elegance-dimenzija-10x10-d-6-cm"),
  "ploca-uni-profil-dimenzija-24x12-d-6-cm": generatedMedia("ploca-uni-profil-dimenzija-24x12-d-6-cm"),
  "ploca-sace-dimenzija-22x22-d-6-cm": generatedMedia("ploca-sace-dimenzija-22x22-d-6-cm"),
  "ploca-city-line-ravna-ivica-dimenzija-24x16-d-6-cm": generatedMedia("ploca-city-line-ravna-ivica-dimenzija-24x16-d-6-cm"),
  "ploca-antica-dimenzija-7-50-x-11-50-x-10-d-6-cm": generatedMedia("ploca-antica-dimenzija-7-50-x-11-50-x-10-d-6-cm"),
  "ploca-combo-ravna-ivica-60x40-d-6-cm-1-kom-m-40x40-d-6-cm-2-kom-m-40x20-d-6-cm-3-kom-m-20x20-d-6-cm-4-kom-m": generatedMedia("ploca-combo-ravna-ivica-60x40-d-6-cm-1-kom-m-40x40-d-6-cm-2-kom-m-40x20-d-6-cm-3-kom-m-20x20-d-6-cm-4-kom-m"),
  "ploca-city-park-ravna-ivica-7x14-d-6-cm-12-kom-m-14x14-d-6-cm-18-kom-m-21x14-d-6-cm-18-kom-m": generatedMedia("ploca-city-park-ravna-ivica-7x14-d-6-cm-12-kom-m-14x14-d-6-cm-18-kom-m-21x14-d-6-cm-18-kom-m"),
  "ploca-vodilja-taktilna-dimenzija-30x30-d-6-cm": generatedMedia("ploca-vodilja-taktilna-dimenzija-30x30-d-6-cm"),
  "ploca-eco-dimenzija-20x20-d-8-cm": generatedMedia("ploca-eco-dimenzija-20x20-d-8-cm"),
  "ploca-raster-dimenzija-60x40-d-10-cm": generatedMedia("ploca-raster-dimenzija-60x40-d-10-cm"),
  "1": generatedMedia("1"),
  "2": generatedMedia("2"),
};

function dedupeMedia(items: ProductMediaItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.src.trim();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function toMediaItems(paths: string[], productName: string): ProductMediaItem[] {
  return paths.map((src, index) => ({
    src,
    alt: `${productName} ${index + 1}`,
    sort_order: index,
  }));
}

export function getBehatonProductListingImage(product: Pick<Product, "slug" | "image">) {
  const override = behatonProductMedia[product.slug];
  return override?.listingImage || override?.detailImage || product.image || null;
}

export function applyBehatonProductMedia(product: Product): Product {
  const override = behatonProductMedia[product.slug];
  if (!override) {
    return product;
  }

  const detailImage = override.detailImage || override.listingImage || product.image || null;
  const existingGallery = product.gallery || [];
  const overrideGallery = toMediaItems(override.gallery || [], product.name);

  return {
    ...product,
    image: detailImage,
    gallery: overrideGallery.length > 0 ? dedupeMedia(overrideGallery) : existingGallery,
  };
}
