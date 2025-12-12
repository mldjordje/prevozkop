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
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    body: json !== undefined ? JSON.stringify(json) : init.body,
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

export { ApiError };
