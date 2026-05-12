import Link from "next/link";

export default function AdminLandingPage() {
  return (
    <div className="content-section py-8 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="rounded-2xl border border-black/5 bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-7">
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Admin</p>
          <h1 className="mt-2 text-3xl font-bold text-dark sm:text-4xl">Kontrolna tabla</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Operativni centar za pregled poslovanja, sadržaj sajta i prodajni tok porudžbina.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/admin/pregled"
            className="rounded-2xl border border-black/5 bg-white px-5 py-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/30"
          >
            <span className="block text-base font-semibold text-dark">Pregled</span>
            <span className="mt-2 block text-sm leading-5 text-gray-600">
              Analitika, količine, follow-up i rezultati prodaje.
            </span>
          </Link>
          <Link
            href="/admin/projects"
            className="rounded-2xl border border-black/5 bg-white px-5 py-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/30"
          >
            <span className="block text-base font-semibold text-dark">Projekti</span>
            <span className="mt-2 block text-sm leading-5 text-gray-600">
              Reference, galerije i sadržaj koji prodaje poverenje.
            </span>
          </Link>
          <Link
            href="/admin/products"
            className="rounded-2xl border border-black/5 bg-white px-5 py-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/30"
          >
            <span className="block text-base font-semibold text-dark">Behaton</span>
            <span className="mt-2 block text-sm leading-5 text-gray-600">
              Katalog proizvoda, slike i dokumentacija.
            </span>
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-2xl border border-black/5 bg-white px-5 py-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/30"
          >
            <span className="block text-base font-semibold text-dark">Porudžbine</span>
            <span className="mt-2 block text-sm leading-5 text-gray-600">
              Lead CRM, ponude, PDF i status naplate.
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
