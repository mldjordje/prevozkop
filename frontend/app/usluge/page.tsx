import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import { services, stats } from "@/content/site";

export const metadata: Metadata = {
  title: "Usluge: isporuka betona, visoke pumpe i zemljani radovi | Niš",
  description:
    "Prevozkop (Prevoz Kop) iz Niša pruža isporuku gotovog betona, visinske pumpe za beton (za višespratnice i nepristupačne terene) i zemljane radove (iskopi, ravnanje, priprema gradilišta). Radimo u Nišu, Leskovcu, Prokuplju, Aleksincu i širom juga/centralne Srbije.",
  alternates: { canonical: "/usluge" },
};

const coreServices = [
  {
    title: "Isporuka gotovog betona",
    description:
      "Organizujemo isporuku betona na gradilište mikserima, uz dogovor termina i logistike istovara (pristup, teren, visina).",
    href: "/porucivanje-betona#forma",
    cta: "Poruči beton",
  },
  {
    title: "Visoke pumpe za beton",
    description:
      "Betonske pumpe za betoniranje višespratnica, velikih visina i nepristupačnih terena. Pre izlaska proveravamo uslove i pristup.",
    href: "/kontakt",
    cta: "Provera uslova",
  },
  {
    title: "Zemljani radovi (iskopi i priprema)",
    description:
      "Zemljani radovi i priprema gradilišta: iskopi temelja, ravnanje terena i organizacija prilaza za mikser/pumpu.",
    href: "/kontakt",
    cta: "Dogovor na terenu",
  },
];

const processSteps = [
  {
    title: "Procena i planiranje",
    description:
      "Dolazimo na lokaciju, merimo i predlažemo optimalnu vrstu betona i vozila.",
  },
  {
    title: "Brza isporuka",
    description:
      "Flota miksera, pumpi i kipera kreće odmah nakon dogovora — bez čekanja.",
  },
  {
    title: "Kontrola kvaliteta",
    description:
      "Nadziremo svaki korak na terenu i obezbeđujemo da beton stigne u traženoj klasi.",
  },
];

export default function ServicesPage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title="Usluge u Nišu: isporuka betona, visinske pumpe i zemljani radovi"
        kicker="Ponuda"
        description="Prevozkop (Prevoz Kop) iz Niša: isporuka gotovog betona, visoke pumpe za beton i zemljani radovi (iskopi, priprema gradilišta) za stambenu i poslovnu gradnju."
        background="/img/kamionislika2.jpg"
        priority
        actions={[{ label: "Poruči beton", href: "/porucivanje-betona#forma" }]}
      />

      <section className="content-section space-y-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Glavne usluge
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Građevinska podrška na jednom mestu (Niš i region)
          </h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Pomažemo investitorima, izvođačima i majstorima da reše logistiku na gradilištu – od
            isporuke betona do izlaska visinske pumpe i pripreme terena.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {coreServices.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-black/5 bg-white p-6 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-dark">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-700">{item.description}</p>
              <Link
                href={item.href}
                className="mt-4 inline-flex w-fit items-center text-sm font-semibold text-primary"
              >
                {item.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section space-y-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Šta radimo
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Betonska logistika, pumpe i priprema gradilišta
          </h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Od temelja do ploče – baza, vozni park i tim omogućavaju da projekti napreduju bez
            zastoja i bez improvizacije na terenu.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-44 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-xl font-semibold text-dark">{service.title}</h3>
                <p className="text-sm text-gray-700">{service.description}</p>
                <div className="flex-1" />
                <Link
                  href="/porucivanje-betona#forma"
                  className="inline-flex w-fit items-center text-sm font-semibold text-primary"
                >
                  Pošalji upit →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="grid gap-6 rounded-3xl border border-black/5 bg-white px-6 py-10 shadow-xl sm:px-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-3">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Proces
            </span>
            <h3 className="text-2xl font-bold text-dark sm:text-3xl">Kako radimo</h3>
            <p className="text-sm text-gray-700">
              Svaki posao počinjemo planom, a završavamo proverom kvaliteta. Vreme
              isporuke je prioritet, jer znamo koliko svaka minuta znači na gradilištu.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((step, idx) => (
              <div
                key={step.title}
                className="rounded-2xl border border-black/5 bg-gray-50 px-4 py-5 text-sm shadow-sm"
              >
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <h4 className="text-base font-semibold text-dark">{step.title}</h4>
                <p className="text-gray-700">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Rezultati
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Brojevi koji nas izdvajaju
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-black/5 bg-white px-4 py-6 text-center shadow-sm"
            >
              <div className="text-3xl font-bold text-dark">{item.value}</div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-dark text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(244,161,0,0.3),_transparent_35%)]" />
          <div className="grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Hitna isporuka
              </span>
              <h3 className="text-3xl font-bold sm:text-4xl">
                Potreban vam je beton, pumpa ili zemljani radovi?
              </h3>
              <p className="text-sm text-gray-200">
                Brzo reagujemo i organizujemo termin u skladu sa uslovima na gradilištu.
                Kontaktirajte nas za rezervaciju termina i procenu logistike.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="tel:+381605887471"
                  className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-dark shadow-[0_12px_40px_rgba(244,161,0,0.4)] transition hover:translate-y-[-2px]"
                >
                  Pozovi odmah
                </Link>
                <Link
                  href="/porucivanje-betona#forma"
                  className="inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-dark"
                >
                  Pošalji upit
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <ul className="space-y-3 text-sm text-gray-200">
                <li>• Dostava mikserima i pumpama za beton</li>
                <li>• Iskopi, tamponiranje, priprema nasipa</li>
                <li>• Rušenje objekata i odvoz šuta</li>
                <li>• Transport rasutih materijala</li>
                <li>• Priprema i izgradnja temelja</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
