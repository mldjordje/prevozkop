import Link from "next/link";
import PageHero from "@/components/page-hero";
import { aboutHighlights, company, stats, team } from "@/content/site";

const aboutParagraphs = [
  "Prevoz Kop iz Niša posluje od 2020. godine i specijalizovan je za proizvodnju i isporuku betona. Naša sopstvena betonska baza i tim iskusnih operatera garantuju da beton stiže na vreme i u klasi koja vam je potrebna.",
  "Pored betona, pružamo kompletne građevinske usluge: iskope, nasipanje šljunka, rizle, tampona i iberlaufa, kao i rušenje objekata. Svaki projekat vodimo od pripreme terena do završne ploče, sa fokusom na sigurnost i preciznost.",
  "Naša misija je da budemo pouzdan partner na svakom gradilištu, a vizija da pomeramo standarde kvaliteta i brzine u građevinskoj industriji na jugu Srbije.",
];

export default function AboutPage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title="Gradimo sve što vam je potrebno"
        kicker="O nama"
        description="Betonska baza, iskopi, tamponiranje, rušenje i kompletna podrška na terenu."
        background="/img/napolje5.jpg"
        priority
        actions={[
          { label: "Kontakt", href: "/kontakt" },
          { label: "Naše usluge", href: "/usluge" },
        ]}
      />

      <section className="content-section space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            {aboutParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-gray-800">
                {paragraph}
              </p>
            ))}

            <div className="grid gap-3 sm:grid-cols-2">
              {aboutHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm font-semibold text-dark shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/projekti"
                className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-dark shadow-[0_12px_40px_rgba(244,161,0,0.35)] transition hover:translate-y-[-2px]"
              >
                Pogledaj projekte
              </Link>
              <Link
                href="tel:+381605887471"
                className="inline-flex items-center rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-dark transition hover:border-primary hover:text-primary"
              >
                Pozovi {company.phone}
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="relative overflow-hidden rounded-3xl border border-black/5 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-white/50" />
              <img
                src="/img/radnici1.webp"
                alt="Naš tim na terenu"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-dark shadow-md">
                Osnovani 2020. godine
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-black/5 bg-white px-4 py-5 text-center shadow-sm"
                >
                  <div className="text-2xl font-bold text-dark">{item.value}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Misija i vizija
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Povezujemo iskustvo, vozni park i sigurnost na terenu
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <MissionCard
            title="Naša misija"
            description="Da budemo lider u industriji betona i građevinskih usluga, uz preciznu isporuku i tehnologiju koja skraćuje rokove."
            image="/img/mikseri.jpg"
          />
          <MissionCard
            title="Naša vizija"
            description="Da postanemo prvi izbor za sve vrste projekata – od temelja do kompletne pripreme terena, uz stalno ulaganje u ljude i opremu."
            image="/img/vozila5.webp"
          />
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Tim
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Ljudi koji stoje iza svakog projekta
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <div
              key={member.name}
              className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-52 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="space-y-1 p-4">
                <h3 className="text-lg font-semibold text-dark">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-dark text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,161,0,0.25),_transparent_45%)]" />
          <div className="flex flex-col gap-5 px-6 py-10 sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Spremni za projekat
              </span>
              <h3 className="text-3xl font-bold sm:text-4xl">Pričajmo o vašem gradilištu</h3>
              <p className="max-w-2xl text-sm text-gray-200">
                Dostupni smo za konsultacije, procenu i brzu isporuku materijala širom juga
                Srbije.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/kontakt"
                className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-dark shadow-[0_12px_40px_rgba(244,161,0,0.4)] transition hover:translate-y-[-2px]"
              >
                Pošalji upit
              </Link>
              <Link
                href="mailto:prevozkopbb@gmail.com"
                className="inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-dark"
              >
                {company.email}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MissionCard({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-white shadow-xl">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/50 to-black/20" />
      <div className="relative flex h-full flex-col justify-end space-y-3 p-6 text-white sm:p-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {title}
        </span>
        <p className="text-sm text-gray-100">{description}</p>
      </div>
    </div>
  );
}
