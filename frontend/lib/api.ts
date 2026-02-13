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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.prevozkop.rs/api";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    // Revalidate every 5 minutes by default for SSG pages
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getProjects(limit = 20, offset = 0) {
  return fetchJson<{ data: Project[]; meta: { limit: number; offset: number } }>(
    `/projects?limit=${limit}&offset=${offset}`
  );
}

export async function getProject(slug: string) {
  return fetchJson<Project>(`/projects/${encodeURIComponent(slug)}`);
}

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
  return fetchJson<{ data: Product[]; meta: { limit: number; offset: number } }>(
    qs ? `/products?${qs}` : "/products"
  );
}

export async function getProduct(slug: string) {
  return fetchJson<Product>(`/products/${encodeURIComponent(slug)}`);
}
