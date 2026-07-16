import type { Product } from "@/lib/api";

type ProductMediaItem = NonNullable<Product["gallery"]>[number];

type ProductMediaOverride = {
  detailImage?: string;
  listingImage?: string;
  gallery?: string[];
};

const behatonProductMedia: Record<string, ProductMediaOverride> = {
  "ploca-behaton-16-5x20-d-6-cm": {
    detailImage: "/img/behaton/products/behaton-16-5x20-d-6-katalog.jpg",
    listingImage: "/img/behaton/products/behaton-16-5x20-d-6-katalog.jpg",
  },
  "ploca-behaton-16-5x20-d-8-cm": {
    detailImage: "/img/behaton/products/behaton-16-5x20-d-8-katalog.jpg",
    listingImage: "/img/behaton/products/behaton-16-5x20-d-8-katalog.jpg",
  },
  "ploca-classic-dimenzija-30x30-d-6-cm": {
    detailImage: "/img/behaton/products/classic-30x30-katalog.jpg",
    listingImage: "/img/behaton/products/classic-30x30-katalog.jpg",
    gallery: [
      "/img/behaton/products/classic-30x30-katalog.jpg",
      "/img/behaton/products/classic-30x30-removebg.png",
      "/img/behaton/products/classic-30x30-multicolor.jpg",
      "/img/behaton/products/classic-30x30-multicolor-2.jpg",
      "/img/behaton/products/classic-30x30-multicolor-removebg.png",
    ],
  },
  "ploca-elegance-dimenzija-20x20-d-6-cm": {
    detailImage: "/img/behaton/products/elegance-20x20-d-6-katalog.jpg",
    listingImage: "/img/behaton/products/elegance-20x20-d-6-katalog.jpg",
  },
  "ploca-elegance-dimenzija-20x20-d-8-cm": {
    detailImage: "/img/behaton/products/elegance-20x20-d-8-katalog.jpg",
    listingImage: "/img/behaton/products/elegance-20x20-d-8-katalog.jpg",
    gallery: [
      "/img/behaton/products/elegance-20x20-d-8-katalog.jpg",
      "/img/behaton/products/elegance-20x20-d-8-removebg.png",
    ],
  },
  "ploca-uni-elegance-dimenzija-20x10-d-6-cm": {
    detailImage: "/img/behaton/products/uni-elegance-20x10-katalog.jpg",
    listingImage: "/img/behaton/products/uni-elegance-20x10-katalog.jpg",
  },
  "ploca-mini-elegance-dimenzija-10x10-d-6-cm": {
    detailImage: "/img/behaton/products/mini-elegance-10x10-katalog.jpg",
    listingImage: "/img/behaton/products/mini-elegance-10x10-katalog.jpg",
  },
  "ploca-city-line-ravna-ivica-dimenzija-24x16-d-6-cm": {
    detailImage: "/img/behaton/products/city-line-24x16-katalog.jpg",
    listingImage: "/img/behaton/products/city-line-24x16-katalog.jpg",
  },
  "ploca-combo-ravna-ivica-60x40-d-6-cm-1-kom-m-40x40-d-6-cm-2-kom-m-40x20-d-6-cm-3-kom-m-20x20-d-6-cm-4-kom-m": {
    detailImage: "/img/behaton/products/combo-katalog.jpg",
    listingImage: "/img/behaton/products/combo-katalog.jpg",
  },
  "ploca-vodilja-taktilna-dimenzija-30x30-d-6-cm": {
    detailImage: "/img/behaton/products/vodilja-taktilna.jpg",
    listingImage: "/img/behaton/products/vodilja-taktilna-removebg.png",
    gallery: [
      "/img/behaton/products/vodilja-taktilna-removebg.png",
      "/img/behaton/products/vodilja-taktilna-2.jpg",
      "/img/behaton/products/vodilja-taktilna-2-removebg.png",
    ],
  },
  "ploca-raster-dimenzija-60x40-d-10-cm": {
    detailImage: "/img/behaton/products/raster-60x40-katalog.jpg",
    listingImage: "/img/behaton/products/raster-60x40-katalog.jpg",
    gallery: [
      "/img/behaton/products/raster-60x40-katalog.jpg",
      "/img/behaton/products/raster-60x40-removebg.png",
      "/img/behaton/products/raster-60x40-2.jpg",
    ],
  },
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
    gallery: dedupeMedia([...overrideGallery, ...existingGallery]),
  };
}
