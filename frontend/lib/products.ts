import type { Product } from "@/lib/api";

export function getProductSelectLabel(product: Pick<Product, "name" | "short_description">) {
  const detail = product.short_description?.trim();
  return detail ? `${product.name} - ${detail}` : product.name;
}
