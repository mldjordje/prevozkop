import type { Order, OrderNote, OrderOffer, OrderOfferItem, Project, Product } from "./api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.prevozkop.rs/api";

type FetchOptions = RequestInit & { json?: unknown };

class ApiError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function adminFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { json, ...init } = options;
  const body = json !== undefined ? JSON.stringify(json) : init.body;
  const isFormData = body instanceof FormData;

  const headers = new Headers(init.headers as HeadersInit | undefined);
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers,
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }
    throw new ApiError(res.statusText || "API error", res.status, data);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export async function adminLogin(email: string, password: string) {
  return adminFetch<{ ok: boolean }>("/admin/login", {
    method: "POST",
    json: { email, password },
  });
}

export async function adminLogout() {
  return adminFetch<{ ok: boolean }>("/admin/logout", { method: "POST" });
}

export async function adminListProjects(status: string = "all") {
  return adminFetch<{ data: Project[]; meta: { limit: number; offset: number } }>(
    `/admin/projects?status=${status}`,
    { method: "GET" }
  );
}

export async function adminCreateProject(payload: Partial<Project> & { title: string; status?: string }) {
  return adminFetch<Project>("/admin/projects", {
    method: "POST",
    json: payload,
  });
}

export async function adminUpdateProject(id: number, payload: Partial<Project>) {
  return adminFetch<Project>(`/admin/projects/${id}`, {
    method: "PUT",
    json: payload,
  });
}

export async function adminDeleteProject(id: number) {
  return adminFetch<{ ok: boolean }>(`/admin/projects/${id}`, {
    method: "DELETE",
  });
}

export async function adminGetProject(id: number) {
  return adminFetch<Project>(`/admin/projects/${id}`, {
    method: "GET",
  });
}

export async function adminListProducts(params: {
  status?: string;
  category?: string;
  q?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.category) search.set("category", params.category);
  if (params.q) search.set("q", params.q);
  if (params.limit) search.set("limit", String(params.limit));
  if (params.offset) search.set("offset", String(params.offset));
  const qs = search.toString();
  return adminFetch<{ data: Product[]; meta: { limit: number; offset: number } }>(
    qs ? `/admin/products?${qs}` : "/admin/products",
    { method: "GET" }
  );
}

export async function adminCreateProduct(payload: Partial<Product> & { name: string; category: string }) {
  return adminFetch<Product>("/admin/products", {
    method: "POST",
    json: payload,
  });
}

export async function adminUpdateProduct(id: number, payload: Partial<Product>) {
  return adminFetch<Product>(`/admin/products/${id}`, {
    method: "PUT",
    json: payload,
  });
}

export async function adminDeleteProduct(id: number) {
  return adminFetch<{ ok: boolean }>(`/admin/products/${id}`, {
    method: "DELETE",
  });
}

export async function adminGetProduct(id: number) {
  return adminFetch<Product>(`/admin/products/${id}`, {
    method: "GET",
  });
}

export async function uploadProductImage(id: number, file: File) {
  const form = new FormData();
  form.append("file", file);
  return adminFetch<{ image: string }>(`/admin/products/${id}/image`, {
    method: "POST",
    body: form,
  });
}

export async function uploadProductGalleryImage(id: number, file: File, alt?: string) {
  const form = new FormData();
  form.append("file", file);
  if (alt) form.append("alt", alt);
  return adminFetch<{ id: number; file: string; file_path: string }>(`/admin/products/${id}/media`, {
    method: "POST",
    body: form,
  });
}

export async function deleteProductGalleryImage(productId: number, mediaId: number) {
  return adminFetch<{ ok: boolean }>(`/admin/products/${productId}/media/${mediaId}`, {
    method: "DELETE",
  });
}

export async function uploadProductDocument(id: number, file: File) {
  const form = new FormData();
  form.append("file", file);
  return adminFetch<{ document: string }>(`/admin/products/${id}/document`, {
    method: "POST",
    body: form,
  });
}

export async function uploadHeroImage(id: number, file: File) {
  const form = new FormData();
  form.append("file", file);
  return adminFetch<{ hero_image: string }>(`/admin/projects/${id}/hero`, {
    method: "POST",
    body: form,
  });
}

export async function uploadGalleryImage(id: number, file: File, alt?: string) {
  const form = new FormData();
  form.append("file", file);
  if (alt) form.append("alt", alt);
  return adminFetch<{ id: number; file: string; file_path: string }>(`/admin/projects/${id}/media`, {
    method: "POST",
    body: form,
  });
}

export async function deleteGalleryImage(projectId: number, mediaId: number) {
  return adminFetch<{ ok: boolean }>(`/admin/projects/${projectId}/media/${mediaId}`, {
    method: "DELETE",
  });
}

export async function adminListOrders(params: {
  status?: string;
  pipeline_stage?: string;
  service_type?: string;
  city_slug?: string;
  from?: string;
  to?: string;
  q?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.pipeline_stage) search.set("pipeline_stage", params.pipeline_stage);
  if (params.service_type) search.set("service_type", params.service_type);
  if (params.city_slug) search.set("city_slug", params.city_slug);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.q) search.set("q", params.q);
  if (params.limit) search.set("limit", String(params.limit));
  if (params.offset) search.set("offset", String(params.offset));
  const qs = search.toString();
  return adminFetch<{ data: Order[] }>(qs ? `/admin/orders?${qs}` : "/admin/orders", {
    method: "GET",
  });
}

export async function adminUpdateOrder(id: number, payload: {
  status?: Order["status"];
  pipeline_stage?: Order["pipeline_stage"];
  next_follow_up_at?: string | null;
  lost_reason?: string | null;
}) {
  return adminFetch<Order>(`/admin/orders/${id}`, {
    method: "PUT",
    json: payload,
  });
}

export async function adminDeleteOrder(id: number) {
  return adminFetch<{ ok: boolean }>(`/admin/orders/${id}`, {
    method: "DELETE",
  });
}

export async function adminListOrderNotes(orderId: number) {
  return adminFetch<{ data: OrderNote[] }>(`/admin/orders/${orderId}/notes`, {
    method: "GET",
  });
}

export async function adminCreateOrderNote(orderId: number, note: string) {
  return adminFetch<OrderNote>(`/admin/orders/${orderId}/notes`, {
    method: "POST",
    json: { note },
  });
}

export async function adminListOrderOffers(orderId: number) {
  return adminFetch<{ data: OrderOffer[] }>(`/admin/orders/${orderId}/offers`, {
    method: "GET",
  });
}

export async function adminCreateOrderOffer(orderId: number, payload: {
  items: Array<Pick<OrderOfferItem, "description" | "quantity" | "unit" | "unit_price">>;
  tax_rate?: number;
  currency?: string;
  valid_until?: string | null;
  payment_terms?: string | null;
  delivery_terms?: string | null;
  note?: string | null;
}) {
  return adminFetch<OrderOffer>(`/admin/orders/${orderId}/offers`, {
    method: "POST",
    json: payload,
  });
}

export async function adminUpdateOrderOffer(id: number, payload: Pick<OrderOffer, "status">) {
  return adminFetch<OrderOffer>(`/admin/offers/${id}`, {
    method: "PUT",
    json: payload,
  });
}

export function adminOfferPrintUrl(id: number) {
  return `${API_BASE}/admin/offers/${id}/print`;
}

export function adminOfferPdfUrl(id: number) {
  return `${API_BASE}/admin/offers/${id}/pdf`;
}

export { ApiError };
