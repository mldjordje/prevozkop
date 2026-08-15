'use client';

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { ApiError, adminAnalyticsOverview, type AnalyticsOverview } from "@/lib/admin-client";

const ranges = [
  { key: 7, label: "7 dana" },
  { key: 30, label: "30 dana" },
  { key: 90, label: "90 dana" },
] as const;

function formatNumber(value: number | undefined) {
  return new Intl.NumberFormat("sr-RS").format(value || 0);
}

function formatChange(current: number, previous: number) {
  if (!previous) return current > 0 ? "novo" : "0%";
  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(0)}%`;
}

function formatDay(timestamp: string) {
  return new Date(timestamp).toLocaleDateString("sr-RS", { day: "2-digit", month: "2-digit" });
}

function BarList({
  rows,
  labelKey,
  emptyLabel,
}: {
  rows: { pageviews: number; visitors: number; [key: string]: unknown }[];
  labelKey: string;
  emptyLabel: string;
}) {
  if (!rows.length) {
    return <p className="text-sm text-gray-500">Nema podataka za izabrani period.</p>;
  }
  const max = Math.max(1, ...rows.map((row) => row.pageviews));
  return (
    <div className="space-y-2">
      {rows.map((row, index) => {
        const rawLabel = row[labelKey];
        const label = typeof rawLabel === "string" && rawLabel.trim() ? rawLabel : emptyLabel;
        const width = Math.max(4, Math.round((row.pageviews / max) * 100));
        return (
          <div key={`${label}-${index}`} className="text-sm">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="truncate text-dark" title={label}>
                {label}
              </span>
              <span className="shrink-0 font-semibold text-gray-600">
                {formatNumber(row.pageviews)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorStatus(null);
      try {
        const res = await adminAnalyticsOverview(days);
        if (!cancelled) setData(res);
      } catch (error) {
        if (cancelled) return;
        setErrorStatus(error instanceof ApiError ? error.status : 500);
        setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (errorStatus === 501) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-dark">Analitika nije povezana</h2>
        <p className="mt-2 text-sm text-gray-600">
          Nedostaju Vercel Analytics podesavanja na serveru. Na Vercel projektu (Settings → Environment
          Variables) potrebno je dodati:
        </p>
        <ul className="mt-3 space-y-1 text-sm text-gray-700">
          <li>
            <code className="rounded bg-gray-100 px-1.5 py-0.5">VERCEL_ANALYTICS_TOKEN</code> — licni
            pristupni token (Vercel → Account Settings → Tokens)
          </li>
          <li>
            <code className="rounded bg-gray-100 px-1.5 py-0.5">VERCEL_ANALYTICS_PROJECT_ID</code> — ID
            ovog projekta (Project Settings → General)
          </li>
          <li>
            <code className="rounded bg-gray-100 px-1.5 py-0.5">VERCEL_ANALYTICS_TEAM_ID</code> — opciono,
            samo ako je projekat pod timom
          </li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          Nakon dodavanja promenljivih potreban je novi deploy da bi se ucitale.
        </p>
      </div>
    );
  }

  if (errorStatus && errorStatus !== 501) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-dark">Greska pri ucitavanju analitike</h2>
        <p className="mt-2 text-sm text-gray-600">
          Pokusajte ponovo. Ako se greska ponavlja, proverite da li je Vercel token vazeci.
        </p>
        <Button className="mt-3" color="primary" variant="flat" onPress={() => setDays((d) => d)}>
          Pokusaj ponovo
        </Button>
      </div>
    );
  }

  const current = data?.current;
  const previous = data?.previous;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="bg-gray-950 p-4 text-white sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Vercel Analytics
              </p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Analitika sajta</h2>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                Posete, izvori saobracaja i najposecenije stranice prevozkop.rs.
              </p>
            </div>
            <div className="flex gap-2">
              {ranges.map((range) => (
                <Button
                  key={range.key}
                  size="sm"
                  variant={days === range.key ? "solid" : "flat"}
                  color="primary"
                  onPress={() => setDays(range.key)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-0 border-y border-black/5 bg-white sm:grid-cols-2">
          <div className="border-b border-black/5 px-4 py-3 sm:border-b-0 sm:border-r">
            <p className="text-xs font-semibold uppercase text-gray-500">Ukupno poseta</p>
            <p className="mt-1 text-2xl font-bold text-dark">
              {loading ? "-" : formatNumber(current?.pageviews)}
            </p>
            {!loading && current && previous && (
              <p className="mt-1 text-xs text-gray-500">
                {formatChange(current.pageviews, previous.pageviews)} u odnosu na prethodni period
              </p>
            )}
          </div>
          <div className="px-4 py-3">
            <p className="text-xs font-semibold uppercase text-gray-500">Jedinstveni posetioci</p>
            <p className="mt-1 text-2xl font-bold text-dark">
              {loading ? "-" : formatNumber(current?.visitors)}
            </p>
            {!loading && current && previous && (
              <p className="mt-1 text-xs text-gray-500">
                {formatChange(current.visitors, previous.visitors)} u odnosu na prethodni period
              </p>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <p className="mb-3 text-xs font-semibold uppercase text-gray-500">Poseta po danima</p>
          {loading || !data ? (
            <p className="text-sm text-gray-500">Ucitavanje...</p>
          ) : data.trend.length === 0 ? (
            <p className="text-sm text-gray-500">Nema podataka za izabrani period.</p>
          ) : (
            <div className="flex h-32 items-end gap-1">
              {data.trend.map((point) => {
                const max = Math.max(1, ...data.trend.map((p) => p.pageviews));
                const height = Math.max(2, Math.round((point.pageviews / max) * 100));
                return (
                  <div key={point.timestamp} className="flex-1" title={`${formatDay(point.timestamp)}: ${point.pageviews}`}>
                    <div
                      className="rounded-t bg-primary transition-all"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-sm font-semibold uppercase text-gray-500">Najposecenije stranice</h3>
          <div className="mt-3">
            {loading || !data ? (
              <p className="text-sm text-gray-500">Ucitavanje...</p>
            ) : (
              <BarList rows={data.pages} labelKey="route" emptyLabel="Nepoznata ruta" />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-sm font-semibold uppercase text-gray-500">Izvori saobracaja</h3>
          <div className="mt-3">
            {loading || !data ? (
              <p className="text-sm text-gray-500">Ucitavanje...</p>
            ) : (
              <BarList rows={data.referrers} labelKey="referrerHostname" emptyLabel="Direktno / bez izvora" />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-sm font-semibold uppercase text-gray-500">Zemlje posetilaca</h3>
          <div className="mt-3">
            {loading || !data ? (
              <p className="text-sm text-gray-500">Ucitavanje...</p>
            ) : (
              <BarList rows={data.countries} labelKey="country" emptyLabel="Nepoznato" />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-sm font-semibold uppercase text-gray-500">Uredjaji</h3>
          <div className="mt-3">
            {loading || !data ? (
              <p className="text-sm text-gray-500">Ucitavanje...</p>
            ) : (
              <BarList rows={data.devices} labelKey="deviceType" emptyLabel="Nepoznato" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
