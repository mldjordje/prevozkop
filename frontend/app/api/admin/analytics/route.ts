import { NextRequest, NextResponse } from "next/server";
import { vercelAnalyticsFetch, isoDate } from "@/lib/server/vercel-analytics";

export const dynamic = "force-dynamic";

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
      vercelAnalyticsFetch("/visits/count", range),
      vercelAnalyticsFetch("/visits/count", prevRange),
      vercelAnalyticsFetch("/visits/aggregate", { ...range, by: "day" }),
      vercelAnalyticsFetch("/visits/aggregate", { ...range, by: "route", limit: "8" }),
      vercelAnalyticsFetch("/visits/aggregate", { ...range, by: "referrerHostname", limit: "8" }),
      vercelAnalyticsFetch("/visits/aggregate", { ...range, by: "country", limit: "8" }),
      vercelAnalyticsFetch("/visits/aggregate", { ...range, by: "deviceType", limit: "6" }),
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
