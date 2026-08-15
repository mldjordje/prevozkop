const VERCEL_API = "https://api.vercel.com/v1/query/web-analytics";

export function vercelAuthHeaders(): Record<string, string> | null {
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

export function vercelBaseParams(): URLSearchParams | null {
  const projectId = process.env.VERCEL_ANALYTICS_PROJECT_ID;
  if (!projectId) return null;
  const params = new URLSearchParams({ projectId });
  const teamId = process.env.VERCEL_ANALYTICS_TEAM_ID;
  if (teamId) params.set("teamId", teamId);
  return params;
}

export async function vercelAnalyticsFetch(path: string, extraParams: Record<string, string>) {
  const headers = vercelAuthHeaders();
  const base = vercelBaseParams();
  if (!headers || !base) {
    throw new Error("missing_config");
  }

  const params = new URLSearchParams(base);
  Object.entries(extraParams).forEach(([key, value]) => params.set(key, value));

  const res = await fetch(`${VERCEL_API}${path}?${params.toString()}`, {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`vercel_api_${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

export function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export type MonthlySnapshotData = {
  pageviews: number;
  visitors: number;
  top_pages: unknown[];
  top_referrers: unknown[];
  top_countries: unknown[];
  top_devices: unknown[];
};

export async function buildMonthlySnapshot(since: string, until: string): Promise<MonthlySnapshotData> {
  const [count, pages, referrers, countries, devices] = await Promise.all([
    vercelAnalyticsFetch("/visits/count", { since, until }),
    vercelAnalyticsFetch("/visits/aggregate", { since, until, by: "route", limit: "8" }),
    vercelAnalyticsFetch("/visits/aggregate", { since, until, by: "referrerHostname", limit: "8" }),
    vercelAnalyticsFetch("/visits/aggregate", { since, until, by: "country", limit: "8" }),
    vercelAnalyticsFetch("/visits/aggregate", { since, until, by: "deviceType", limit: "6" }),
  ]);

  return {
    pageviews: (count.data?.pageviews as number) || 0,
    visitors: (count.data?.visitors as number) || 0,
    top_pages: pages.data || [],
    top_referrers: referrers.data || [],
    top_countries: countries.data || [],
    top_devices: devices.data || [],
  };
}
