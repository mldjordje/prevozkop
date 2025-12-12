export type Project = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  hero_image?: string | null;
  gallery?: { src: string; alt?: string | null; sort_order?: number }[];
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  status?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.prevozkop.rs/api";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    // Revalidate every 60s by default for SSG pages
    next: { revalidate: 60 },
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
  return fetchJson<Project>(`/projects/${slug}`);
}
