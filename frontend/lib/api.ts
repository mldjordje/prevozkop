import { cache } from "react";

export type Project = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  hero_image?: string | null;
  gallery?: { id?: number; src: string; alt?: string | null; sort_order?: number }[];
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  status?: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  category: string;
  product_type?: string | null;
  short_description?: string | null;
  description?: string | null;
  applications?: string | null;
  specs?: Record<string, string | string[] | number> | string[] | null;
  image?: string | null;
  document?: string | null;
  gallery?: { id?: number; src: string; alt?: string | null; sort_order?: number }[];
  status?: string | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Order = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  concrete_type?: string | null;
  service_type?: "beton" | "behaton" | "other" | null;
  quantity?: string | null;
  quantity_unit?: string | null;
  city_slug?: string | null;
  message: string;
  status: "new" | "in_progress" | "done";
  pipeline_stage?: "new" | "qualified" | "offered" | "negotiation" | "won" | "lost";
  lead_score?: number | null;
  next_follow_up_at?: string | null;
  lost_reason?: string | null;
  source_page?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  created_at: string;
};

export type OrderNote = {
  id: number;
  order_id: number;
  note: string;
  created_by?: number | null;
  created_at: string;
};

export type OrderOfferItem = {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  line_total: number;
};

export type OrderOffer = {
  id: number;
  order_id: number;
  offer_number: string;
  status: "draft" | "sent" | "accepted" | "paid" | "rejected";
  items: OrderOfferItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  valid_until?: string | null;
  payment_terms?: string | null;
  delivery_terms?: string | null;
  note?: string | null;
  created_by?: number | null;
  created_at: string;
  updated_at?: string | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.prevozkop.rs/api";
export const PUBLIC_REVALIDATE_SECONDS = 300;

type PublicFetchOptions = RequestInit & {
  revalidate?: number;
  tags?: string[];
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

async function fetchJson<T>(path: string, init: PublicFetchOptions = {}): Promise<T> {
  const { revalidate = PUBLIC_REVALIDATE_SECONDS, tags = [], next, ...requestInit } = init;
  const headers = new Headers(requestInit.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...requestInit,
    headers,
    next: {
      revalidate,
      ...(tags.length > 0 ? { tags } : {}),
      ...(next || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const getProjectsCached = cache(async (limit: number, offset: number) =>
  fetchJson<{ data: Project[]; meta: { limit: number; offset: number } }>(
    `/projects?limit=${limit}&offset=${offset}`,
    {
      tags: ["projects", `projects:list:${limit}:${offset}`],
    }
  )
);

export async function getProjects(limit = 20, offset = 0) {
  return getProjectsCached(limit, offset);
}

const getProjectCached = cache(async (slug: string) =>
  fetchJson<Project>(`/projects/${encodeURIComponent(slug)}`, {
    tags: ["projects", `projects:${slug}`],
  })
);

export async function getProject(slug: string) {
  return getProjectCached(slug);
}

const getProductsCached = cache(async (query: string) =>
  fetchJson<{ data: Product[]; meta: { limit: number; offset: number } }>(
    query ? `/products?${query}` : "/products",
    {
      tags: ["products", `products:query:${query || "all"}`],
    }
  )
);

export async function getProducts(params: {
  limit?: number;
  offset?: number;
  category?: string;
  q?: string;
  status?: string;
} = {}) {
  const search = new URLSearchParams();
  if (params.limit) search.set("limit", String(params.limit));
  if (params.offset) search.set("offset", String(params.offset));
  if (params.category) search.set("category", params.category);
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  const qs = search.toString();
  return getProductsCached(qs);
}

const getProductCached = cache(async (slug: string) =>
  fetchJson<Product>(`/products/${encodeURIComponent(slug)}`, {
    tags: ["products", `products:${slug}`],
  })
);

export async function getProduct(slug: string) {
  return getProductCached(slug);
}
