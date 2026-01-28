import Link from "next/link";
import { company } from "@/content/site";

const footerLinks = [
  { href: "/o-nama", label: "O nama" },
  { href: "/usluge", label: "Usluge" },
  { href: "/behaton", label: "Behaton" },
  { href: "/projekti", label: "Projekti" },
  { href: "/projekti-video", label: "Video" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-black/5 bg-gradient-to-br from-dark via-[#0f172a] to-[#0b1224] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src="/img/logo.webp" alt="Prevoz Kop" className="h-12 w-auto" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                  {company.tagline}
                </p>
                <p className="text-lg font-semibold text-white">{company.name}</p>
              </div>
            </div>
            <p className="max-w-md text-sm text-gray-300">
              Prevozkop (Prevoz Kop) je građevinska podrška iz Niša: isporuka gotovog betona,
              visinske pumpe za beton i zemljani radovi (iskopi, ravnanje terena, priprema
              gradilišta) za stambenu i poslovnu gradnju u Nišu i regionu.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
              Brzi linkovi
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm text-gray-200 md:grid-cols-1">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link className="hover:text-primary" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
              Kontakt
            </h3>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>
                <span className="text-gray-400">Telefon: </span>
                <a className="hover:text-primary" href="tel:+381605887471">
                  {company.phone}
                </a>
              </li>
              <li>
                <span className="text-gray-400">Email: </span>
                <a className="hover:text-primary" href={`mailto:${company.email}`}>
                  {company.email}
                </a>
              </li>
              <li>
                <span className="text-gray-400">Adresa: </span>
                <span>{company.address}</span>
              </li>
              <li>
                <span className="text-gray-400">Radno vreme: </span>
                <span>{company.workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} {company.name}. Sva prava zadržana.
          </p>
          <div className="text-xs text-gray-500">
            Izradio <span className="text-primary">Prevoz Kop tim</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
