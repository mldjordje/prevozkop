import Link from "next/link";
import { company } from "@/content/site";

const footerLinks = [
  { href: "/beton", label: "Beton" },
  { href: "/porucivanje-betona", label: "Porucivanje betona" },
  { href: "/beton/grad/nis", label: "Beton Nis" },
  { href: "/behaton", label: "Behaton" },
  { href: "/behaton/grad/nis", label: "Behaton Nis" },
  { href: "/usluge", label: "Usluge" },
  { href: "/o-nama", label: "O nama" },
  { href: "/projekti", label: "Projekti" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-16 text-white"
      style={{ background: "var(--c-dark)" }}
    >
      {/* Gold top border */}
      <div
        className="h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(244,161,0,0.6) 30%, rgba(244,161,0,0.6) 70%, transparent 100%)",
        }}
      />

      <div className="content-section py-14 sm:py-18">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand column */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <img src="/img/logo.webp" alt="Prevoz Kop" className="h-12 w-auto" />
              <div>
                <p className="font-body text-xs uppercase tracking-[0.22em] text-primary">
                  {company.tagline}
                </p>
                <p className="font-display text-lg font-bold text-white">{company.name}</p>
              </div>
            </div>
            <p className="max-w-sm font-body text-sm leading-relaxed text-white/55">
              Prevozkop je gradjevinska podrska iz Nisa: isporuka gotovog betona, beton pumpe,
              behaton za Srbiju i zemljani radovi za stambenu i poslovnu gradnju.
            </p>
            {/* CTA */}
            <a
              href="/porucivanje-betona#forma"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-dark shadow-[0_8px_28px_rgba(244,161,0,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(244,161,0,0.42)]"
            >
              Posalji upit
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Links column */}
          <div className="space-y-4">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Brzi linkovi
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm md:grid-cols-1">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-white/55 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div className="space-y-4">
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Kontakt
            </h3>
            <ul className="space-y-3 font-body text-sm">
              <li className="flex items-start gap-3">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <a href="tel:+381605887471" className="text-white/70 transition-colors hover:text-primary">
                  {company.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a href={`mailto:${company.email}`} className="break-all text-white/70 transition-colors hover:text-primary">
                  {company.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-white/70">{company.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-white/70">{company.workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/8 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-xs text-white/30">
            © {year} {company.name}. Sva prava zadrzana.
          </p>
          <p className="font-body text-xs text-white/25">
            Izradio{" "}
            <span className="text-primary/60">Prevoz Kop tim</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
