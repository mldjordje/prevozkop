'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  adminDeliverySummary,
  adminExpenseSummary,
  adminListOrders,
  adminListProducts,
  adminPayrollSummary,
  adminVehicleSummary,
} from "@/lib/admin-client";

const moduleGroups = [
  {
    title: "Prodaja",
    items: [
      { href: "/admin/pregled", title: "Pregled", text: "Analitika, kolicine i rezultat prodaje." },
      { href: "/admin/orders", title: "Porudzbine", text: "Lead CRM, statusi, follow-up i ponude." },
      { href: "/admin/ponude", title: "Rucne ponude", text: "Brze PDF ponude van sajta." },
    ],
  },
  {
    title: "Operativa",
    items: [
      { href: "/admin/kalendar", title: "Kalendar", text: "Nedeljni raspored isporuka." },
      { href: "/admin/vozila", title: "Vozila", text: "Registracije, servisi i troskovi." },
      { href: "/admin/radnici", title: "Radnici", text: "Evidencija i plate." },
      { href: "/admin/troskovi", title: "Troskovi", text: "Mesecni troskovi po kategorijama." },
    ],
  },
  {
    title: "Sajt",
    items: [
      { href: "/admin/projects", title: "Projekti", text: "Reference i galerije." },
      { href: "/admin/products", title: "Behaton", text: "Katalog proizvoda." },
    ],
  },
];

const currentDate = new Date();

function money(value: number | undefined) {
  return `${(value || 0).toLocaleString("sr-RS", { maximumFractionDigits: 0 })} RSD`;
}

function weekRange() {
  const now = new Date();
  const day = now.getDay() || 7;
  const start = new Date(now);
  start.setDate(now.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

export default function AdminDashboardHome() {
  const [stats, setStats] = useState({
    activeOrders: 0,
    products: 0,
    payrollDue: 0,
    expenses: 0,
    vehicleAlerts: 0,
    weekDeliveries: 0,
  });
  const [loading, setLoading] = useState(true);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const range = useMemo(() => weekRange(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoading(true);
      try {
        const [orders, products, payroll, expenses, vehicles, deliveries] = await Promise.all([
          adminListOrders({ status: "new", limit: 300 }),
          adminListProducts({ status: "all", limit: 200 }),
          adminPayrollSummary(month, year),
          adminExpenseSummary(month, year),
          adminVehicleSummary(month, year),
          adminDeliverySummary(range),
        ]);
        if (cancelled) return;
        setStats({
          activeOrders: orders.data.filter((order) => order.status !== "done").length,
          products: products.data.length,
          payrollDue: payroll.remaining,
          expenses: expenses.total,
          vehicleAlerts: vehicles.registration_alerts + vehicles.service_alerts,
          weekDeliveries: deliveries.total,
        });
      } catch {
        if (!cancelled) {
          setStats((prev) => prev);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadStats();
    return () => {
      cancelled = true;
    };
  }, [month, range, year]);

  const statusCards = [
    { label: "Aktivne porudzbine", value: stats.activeOrders, href: "/admin/orders", tone: "bg-gray-950 text-white" },
    { label: "Isporuke ove nedelje", value: stats.weekDeliveries, href: "/admin/kalendar", tone: "bg-sky-100 text-sky-900" },
    { label: "Preostalo za plate", value: money(stats.payrollDue), href: "/admin/radnici", tone: "bg-amber-100 text-amber-900" },
    { label: "Troskovi ovog meseca", value: money(stats.expenses), href: "/admin/troskovi", tone: "bg-white text-gray-900" },
    { label: "Vozila upozorenja", value: stats.vehicleAlerts, href: "/admin/vozila", tone: "bg-rose-100 text-rose-900" },
    { label: "Proizvodi", value: stats.products, href: "/admin/products", tone: "bg-emerald-100 text-emerald-900" },
  ];

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-black/5 bg-gray-950 px-5 py-6 text-white shadow-sm sm:px-7 sm:py-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary">Admin</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Kontrolna tabla</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Operativni centar za prodaju, isporuke, radnike, vozila, troskove i sadrzaj sajta.
            </p>
          </div>
          <Link
            href="/admin/kalendar"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-dark transition hover:bg-white"
          >
            Otvori kalendar
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {statusCards.map((item) => (
          <Link key={item.label} href={item.href} className={`rounded-2xl border border-black/5 px-4 py-4 shadow-sm transition hover:-translate-y-0.5 ${item.tone}`}>
            <span className="block text-xs uppercase tracking-[0.16em] opacity-70">{item.label}</span>
            <span className="mt-2 block break-words text-2xl font-semibold">{loading ? "-" : item.value}</span>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          {moduleGroups.map((group) => (
            <div key={group.title} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-dark">{group.title}</h2>
                <span className="text-xs uppercase tracking-[0.16em] text-gray-400">{group.items.length} modula</span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="min-h-28 rounded-xl border border-black/5 bg-gray-50 px-4 py-4 transition hover:border-primary/40 hover:bg-white"
                  >
                    <span className="block text-base font-semibold text-dark">{item.title}</span>
                    <span className="mt-2 block text-sm leading-5 text-gray-600">{item.text}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-dark">Brzi status</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="font-semibold text-dark">Tekuci mesec</p>
              <p className="mt-1 text-gray-600">Plate i troskovi se racunaju za {month}/{year}.</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="font-semibold text-dark">Tekuca nedelja</p>
              <p className="mt-1 text-gray-600">Kalendar prikazuje period {range.from} - {range.to}.</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="font-semibold text-dark">Fleksibilni unosi</p>
              <p className="mt-1 text-gray-600">Pozicije radnika i vrste troskova mogu da se dodaju direktno u formi.</p>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
