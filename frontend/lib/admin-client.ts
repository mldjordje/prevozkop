import type { Project } from "./api";

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
  return adminFetch<{ file: string }>(`/admin/projects/${id}/media`, {
    method: "POST",
    body: form,
  });
}

export { ApiError };
