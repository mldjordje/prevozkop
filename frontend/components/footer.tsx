import Link from "next/link";
import { company } from "@/content/site";

const footerLinks = [
  { href: "/beton", label: "Beton" },
  { href: "/porucivanje-betona", label: "Poručivanje betona" },
  { href: "/beton/grad/nis", label: "Beton Niš" },
  { href: "/behaton", label: "Behaton" },
  { href: "/behaton/grad/nis", label: "Behaton Niš" },
  { href: "/usluge", label: "Usluge" },
  { href: "/o-nama", label: "O nama" },
  { href: "/projekti", label: "Projekti" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      {/* Closing CTA */}
      <div className="content-section border-b border-white/10 pb-16 pt-24 sm:pb-24 sm:pt-32">
        <p className="section-label mb-6">Imate gradilište?</p>
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <h2 className="font-display text-[15vw] font-black uppercase leading-[0.84] [font-stretch:62%] sm:text-[11vw] lg:text-[8.5vw]">
            Mi imamo <span className="text-primary">beton.</span>
          </h2>
          <div className="space-y-6">
            <a
              href="tel:+381605887471"
              className="group block font-display text-4xl font-black text-white [font-stretch:66%] hover:text-primary sm:text-5xl"
            >
              {company.phone}
              <span className="mt-2 block h-[2px] w-full origin-left scale-x-0 bg-primary transition-transform duration-700 group-hover:scale-x-100" />
            </a>
            <div className="flex flex-wrap gap-3">
              <Link href="/porucivanje-betona#forma" className="btn-primary">
                Pošalji upit
              </Link>
              <Link href="/behaton" className="btn-outline-white">
                Katalog behatona
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-5">
          <p className="font-display text-2xl font-black uppercase [font-stretch:66%]">{company.name}</p>
          <p className="max-w-sm font-body text-sm leading-relaxed text-white/55">
            Prevozkop je građevinska podrška iz Niša: isporuka gotovog betona, beton pumpe,
            behaton za Srbiju i zemljani radovi za stambenu i poslovnu gradnju.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">{company.tagline}</p>
        </div>

        <div className="space-y-4">
          <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Brzi linkovi</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm lg:grid-cols-1">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="font-body text-white/65 transition-colors hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Kontakt</h3>
          <ul className="space-y-3 font-body text-sm text-white/70">
            <li>
              <a href="tel:+381605887471" className="text-white/80 transition-colors hover:text-primary">
                {company.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${company.email}`} className="break-all text-white/80 transition-colors hover:text-primary">
                {company.email}
              </a>
            </li>
            <li>{company.address}</li>
            <li>{company.workingHours}</li>
          </ul>
        </div>
      </div>

      {/* Giant wordmark */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden px-3" data-reveal-skip>
        <p className="translate-y-[18%] whitespace-nowrap text-center font-display text-[18vw] font-black uppercase leading-[0.8] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.14)] [font-stretch:62%]">
          Prevoz Kop
        </p>
      </div>

      <div className="relative border-t border-white/10 bg-ink">
        <div className="content-section flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/35">
            © {year} {company.name}. Sva prava zadržana.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/35">
            Izradio{" "}
            <a
              href="https://adspire.rs/softver-za-betonsku-bazu-i-proizvodnju-materijala"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/70 transition-colors hover:text-primary"
            >
              Adspire
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
