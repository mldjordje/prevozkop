import Link from "next/link";
import AdminAuthGate from "@/components/admin/admin-auth-gate";

const adminLinks = [
  {
    href: "/admin/pregled",
    title: "Pregled",
    text: "Analitika, kolicine, follow-up i rezultati prodaje.",
  },
  {
    href: "/admin/projects",
    title: "Projekti",
    text: "Reference, galerije i sadrzaj koji prodaje poverenje.",
  },
  {
    href: "/admin/products",
    title: "Behaton",
    text: "Katalog proizvoda, slike i dokumentacija.",
  },
  {
    href: "/admin/orders",
    title: "Porudzbine",
    text: "Lead CRM, ponude, PDF i status naplate.",
  },
  {
    href: "/admin/ponude",
    title: "Rucne ponude",
    text: "Kreiranje PDF ponuda za kupce van sajta.",
  },
];

export default function AdminLandingPage() {
  return (
    <AdminAuthGate>
      <div className="rounded-2xl border border-black/5 bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-7">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-dark sm:text-4xl">Kontrolna tabla</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Operativni centar za pregled poslovanja, sadrzaj sajta i prodajni tok porudzbina.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {adminLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-black/5 bg-white px-5 py-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/30"
          >
            <span className="block text-base font-semibold text-dark">{item.title}</span>
            <span className="mt-2 block text-sm leading-5 text-gray-600">{item.text}</span>
          </Link>
        ))}
      </div>
    </AdminAuthGate>
  );
}
