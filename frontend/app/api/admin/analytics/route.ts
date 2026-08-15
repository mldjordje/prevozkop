import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VERCEL_API = "https://api.vercel.com/v1/query/web-analytics";

function authHeaders(): Record<string, string> | null {
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

function baseParams(): URLSearchParams | null {
  const projectId = process.env.VERCEL_ANALYTICS_PROJECT_ID;
  if (!projectId) return null;
  const params = new URLSearchParams({ projectId });
  const teamId = process.env.VERCEL_ANALYTICS_TEAM_ID;
  if (teamId) params.set("teamId", teamId);
  return params;
}

async function vercelFetch(path: string, extraParams: Record<string, string>) {
  const headers = authHeaders();
  const base = baseParams();
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

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const requestedDays = Number(request.nextUrl.searchParams.get("days") || 30);
  const days = [7, 14, 30, 90].includes(requestedDays) ? requestedDays : 30;

  const now = new Date();
  const since = new Date(now);
  since.setDate(now.getDate() - (days - 1));
  const prevUntil = new Date(since);
  prevUntil.setDate(since.getDate() - 1);
  const prevSince = new Date(prevUntil);
  prevSince.setDate(prevUntil.getDate() - (days - 1));

  const range = { since: isoDate(since), until: isoDate(now) };
  const prevRange = { since: isoDate(prevSince), until: isoDate(prevUntil) };

  try {
    const [current, previous, trend, pages, referrers, countries, devices] = await Promise.all([
      vercelFetch("/visits/count", range),
      vercelFetch("/visits/count", prevRange),
      vercelFetch("/visits/aggregate", { ...range, by: "day" }),
      vercelFetch("/visits/aggregate", { ...range, by: "route", limit: "8" }),
      vercelFetch("/visits/aggregate", { ...range, by: "referrerHostname", limit: "8" }),
      vercelFetch("/visits/aggregate", { ...range, by: "country", limit: "8" }),
      vercelFetch("/visits/aggregate", { ...range, by: "deviceType", limit: "6" }),
    ]);

    return NextResponse.json({
      range: { days, ...range },
      current: current.data,
      previous: previous.data,
      trend: trend.data,
      pages: pages.data,
      referrers: referrers.data,
      countries: countries.data,
      devices: devices.data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const status = message === "missing_config" ? 501 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
