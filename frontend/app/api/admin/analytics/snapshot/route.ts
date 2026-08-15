import { NextRequest, NextResponse } from "next/server";
import { buildMonthlySnapshot, isoDate } from "@/lib/server/vercel-analytics";

export const dynamic = "force-dynamic";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.prevozkop.rs/api";

function monthRange(monthParam: string | null) {
  const now = new Date();
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth();

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    year = Number(monthParam.slice(0, 4));
    month = Number(monthParam.slice(5, 7)) - 1;
  }

  const start = new Date(Date.UTC(year, month, 1));
  const isCurrentMonth = year === now.getUTCFullYear() && month === now.getUTCMonth();
  const end = isCurrentMonth ? now : new Date(Date.UTC(year, month + 1, 0));
  const label = `${year}-${String(month + 1).padStart(2, "0")}`;
  return { since: isoDate(start), until: isoDate(end), label };
}

export async function POST(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const snapshotSecret = process.env.ANALYTICS_SNAPSHOT_SECRET;
  if (!snapshotSecret) {
    return NextResponse.json({ error: "missing_snapshot_secret" }, { status: 501 });
  }

  const monthParam = request.nextUrl.searchParams.get("month");
  const { since, until, label } = monthRange(monthParam);

  try {
    const snapshot = await buildMonthlySnapshot(since, until);
    const res = await fetch(`${API_BASE}/analytics/snapshot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Snapshot-Key": snapshotSecret,
      },
      body: JSON.stringify({
        month: label,
        pageviews: snapshot.pageviews,
        visitors: snapshot.visitors,
        top_pages: snapshot.top_pages,
        top_referrers: snapshot.top_referrers,
        top_countries: snapshot.top_countries,
        top_devices: snapshot.top_devices,
        captured_at: new Date().toISOString(),
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "backend_save_failed", detail: text.slice(0, 300) },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, month: label });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const status = message === "missing_config" ? 501 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
