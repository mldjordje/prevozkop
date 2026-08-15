import { NextRequest, NextResponse } from "next/server";
import { buildMonthlySnapshot, isoDate } from "@/lib/server/vercel-analytics";

export const dynamic = "force-dynamic";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.prevozkop.rs/api";

function previousMonthRange(reference: Date) {
  const year = reference.getUTCFullYear();
  const month = reference.getUTCMonth();
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  const label = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`;
  return { since: isoDate(start), until: isoDate(end), label };
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const snapshotSecret = process.env.ANALYTICS_SNAPSHOT_SECRET;
  if (!snapshotSecret) {
    return NextResponse.json({ error: "missing_snapshot_secret" }, { status: 501 });
  }

  const { since, until, label } = previousMonthRange(new Date());

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
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
