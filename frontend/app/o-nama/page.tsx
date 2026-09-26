import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import StatsSection from "@/components/stats-section";
import { ParallaxImage, ScrollFillText } from "@/components/motion/scroll-effects";
import { CtaBand, RuleList, SectionHead } from "@/components/sections";
import { aboutHighlights, company, stats, team } from "@/content/site";
import { buildMetadata, srEnLanguages } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "O nama | Prevozkop",
  description:
    "Prevozkop iz Niša: betonska baza, isporuka betona, visinske pumpe i zemljani radovi za stambenu i poslovnu gradnju.",
  path: "/o-nama",
  image: "/img/napolje5.webp",
  languages: srEnLanguages("/o-nama", "/en/about"),
});

const aboutParagraphs = [
  "Prevoz Kop iz Niša posluje od 2020. godine i specijalizovan je za proizvodnju i isporuku betona. Naša sopstvena betonska baza i tim iskusnih operatera garantuju da beton stiže na vreme i u klasi koja vam je potrebna.",
  "Pored betona, pružamo kompletne građevinske usluge: iskope, nasipanje šljunka, rizle, tampona i iberlaufa, kao i rušenje objekata. Svaki projekat vodimo od pripreme terena do završne ploče, sa fokusom na sigurnost i preciznost.",
];

const mission = [
  {
    title: "Naša misija",
    text: "Da budemo lider u industriji betona i građevinskih usluga, uz preciznu isporuku i tehnologiju koja skraćuje rokove.",
    image: "/img/mikseri.webp",
  },
  {
    title: "Naša vizija",
    text: "Da postanemo prvi izbor za sve vrste projekata – od temelja do kompletne pripreme terena, uz stalno ulaganje u ljude i opremu.",
    image: "/img/vozila5.webp",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-cement">
      <PageHero
        title="Gradimo sve što vam je potrebno"
        kicker="O nama"
        description="Betonska baza, iskopi, tamponiranje, rušenje i kompletna podrška na terenu."
        background="/img/napolje5.webp"
        priority
        actions={[
          { label: "Poruči beton", href: "/porucivanje-betona#forma" },
          { label: "Naše usluge", href: "/usluge" },
        ]}
      />

      {/* ── Manifesto ─────────────────────────────────────── */}
      <section className="content-section py-24 sm:py-36">
        <div className="mb-10 flex items-center justify-between">
          <p className="section-label">Od 2020.</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Krušce bb · Niš</p>
        </div>
        <ScrollFillText
          as="h2"
          className="font-display text-[2.6rem] font-extrabold uppercase leading-[0.93] text-ink [font-stretch:66%] sm:text-7xl lg:text-[6.2rem]"
          text="Naša misija je da budemo pouzdan partner na svakom gradilištu — a vizija da pomeramo standarde kvaliteta i brzine na jugu Srbije."
        />
      </section>

      {/* ── Story + image ─────────────────────────────────── */}
      <section className="content-section pb-24 sm:pb-32">
        <div className="grid gap-12 lg:grid-cols-12">
          <ParallaxImage
            src="/img/radnici1.webp"
            alt="Naš tim na terenu"
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="aspect-[4/5] rounded-[28px] lg:col-span-6"
          >
            <div className="absolute bottom-5 left-5 rounded-2xl bg-ink/80 px-5 py-4 text-white backdrop-blur-md">
              <p className="font-display text-5xl font-black leading-none text-primary [font-stretch:62%]">2020</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">Godina osnivanja</p>
            </div>
          </ParallaxImage>
          <div className="flex flex-col justify-between gap-10 lg:col-span-6">
            <div className="space-y-6">
              {aboutParagraphs.map((paragraph) => (
                <p key={paragraph} className="font-body text-lg leading-relaxed text-ink/80">
                  {paragraph}
                </p>
              ))}
            </div>
            <RuleList items={aboutHighlights} big />
            <div className="flex flex-wrap gap-3">
              <Link href="/projekti" className="btn-primary">
                Pogledaj projekte
              </Link>
              <a href="tel:+381605887471" className="btn-outline">
                Pozovi {company.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <StatsSection stats={stats} />

      {/* ── Mission / vision split ────────────────────────── */}
      <section className="grid bg-ink lg:grid-cols-2">
        {mission.map((m, i) => (
          <article key={m.title} className="group relative flex min-h-[80svh] items-end overflow-hidden p-6 text-white sm:p-12">
            <Image
              src={m.image}
              alt={m.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover opacity-50 transition-all duration-[1.4s] [transition-timing-function:var(--ease-out)] group-hover:scale-105 group-hover:opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
            <div className="relative max-w-lg">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                {String(i + 1).padStart(2, "0")} — {m.title}
              </p>
              <p className="mt-5 font-display text-4xl font-black uppercase leading-[0.95] [font-stretch:62%] sm:text-5xl">{m.text}</p>
            </div>
          </article>
        ))}
      </section>

      {/* ── Team ──────────────────────────────────────────── */}
      <section className="content-section py-24 sm:py-32">
        <SectionHead
          label="Tim"
          lines={["Ljudi iza", { text: "svakog projekta", className: "text-outline" }]}
          text="Povezujemo iskustvo, vozni park i sigurnost na terenu."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, i) => (
            <article key={member.name} className="group relative aspect-[3/4] overflow-hidden rounded-[24px] bg-ink" data-cursor="view">
              <Image
                src={member.image}
                alt={member.name}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover grayscale transition-all duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-105 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-display text-4xl font-black uppercase leading-[0.9] [font-stretch:62%]">{member.name}</h3>
                <p className="mt-1 font-body text-sm text-white/65">{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CtaBand
        label="Spremni za projekat"
        lines={["Pričajmo o", { text: "vašem gradilištu", className: "text-primary" }]}
        text="Dostupni smo za konsultacije, procenu i brzu isporuku materijala širom juga Srbije."
        image="/img/napolje2.webp"
      >
        <Link href="/porucivanje-betona#forma" className="btn-primary">
          Pošalji upit
        </Link>
        <a href={`mailto:${company.email}`} className="btn-outline-white">
          {company.email}
        </a>
      </CtaBand>
    </div>
  );
}
