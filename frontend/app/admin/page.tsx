import Link from "next/link";

export default function AdminLandingPage() {
  return (
    <div className="content-section py-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Admin</p>
          <h1 className="text-3xl font-bold text-dark">Kontrolna tabla</h1>
          <p className="mt-2 text-sm text-gray-600">
            Izaberite deo administracije.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/admin/projects"
            className="rounded-2xl border border-black/5 bg-white px-5 py-6 text-center text-sm font-semibold text-dark shadow-sm transition hover:-translate-y-1"
          >
            Projekti
          </Link>
          <Link
            href="/admin/products"
            className="rounded-2xl border border-black/5 bg-white px-5 py-6 text-center text-sm font-semibold text-dark shadow-sm transition hover:-translate-y-1"
          >
            Behaton
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-2xl border border-black/5 bg-white px-5 py-6 text-center text-sm font-semibold text-dark shadow-sm transition hover:-translate-y-1"
          >
            Porudzbine
          </Link>
        </div>
      </div>
    </div>
  );
}
