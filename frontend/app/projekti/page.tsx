import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import { ParallaxImage } from "@/components/motion/scroll-effects";
import { CtaBand, SectionHead } from "@/components/sections";
import { getProjects } from "@/lib/api";
import type { Project } from "@/lib/api";
import { buildMetadata, srEnLanguages } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Projekti | Prevozkop",
  description:
    "Galerija završenih projekata: betoniranje, zemljani radovi, priprema terena i logistika gradilišta u Nišu i regionu.",
  path: "/projekti",
  image: "/img/volvonov2.webp",
  languages: srEnLanguages("/projekti", "/en/projects"),
});

// Repeating bento rhythm: wide, tall, then a row of three, then full-bleed.
const layouts = [
  "md:col-span-4 aspect-[4/5] md:aspect-[16/11]",
  "md:col-span-2 aspect-[4/5] md:aspect-auto",
  "md:col-span-2 aspect-[4/5]",
  "md:col-span-2 aspect-[4/5]",
  "md:col-span-2 aspect-[4/5]",
  "md:col-span-6 aspect-[4/5] md:aspect-[21/9]",
];

export default async function ProjectsPage() {
  let projects: Project[] = [];
  try {
    const response = await getProjects(60, 0);
    projects = response.data || [];
  } catch (error) {
    console.error("Neuspelo učitavanje projekata:", error);
  }

  return (
    <div className="bg-cement">
      <PageHero
        title="Galerija projekata"
        kicker="Radovi"
        description="Betoniranje, tamponiranje, rušenje i transport rasutih materijala širom regiona."
        background="/img/volvonov2.webp"
        priority
        actions={[{ label: "Zatraži ponudu", href: "/porucivanje-betona#forma" }]}
      />

      <section className="bg-ink py-24 text-white sm:py-32">
        <div className="content-section">
          <SectionHead
            tone="dark"
            label={`Na terenu · ${projects.length || 0} ${projects.length === 1 ? "projekat" : "projekata"}`}
            lines={["Poslednji", { text: "završeni projekti", className: "text-primary" }]}
            text="Betoniranja, iskopi i priprema terena — svaki rad iz baze se pojavljuje ovde čim ga objavimo."
          />

          {projects.length === 0 ? (
            <p className="font-body text-white/60">Još uvek nema objavljenih projekata.</p>
          ) : (
            <div className="grid gap-4 sm:gap-5 md:grid-cols-6">
              {projects.map((project, i) => (
                <Link
                  key={project.id}
                  href={`/projekti/${project.slug}`}
                  data-cursor="view"
                  className={`group relative block ${projects.length === 1 ? layouts[5] : layouts[i % layouts.length]}`}
                >
                  <ParallaxImage
                    src={project.hero_image || "/img/napolje1.webp"}
                    alt={project.title}
                    sizes="(max-width: 768px) 100vw, 60vw"
                    strength={8}
                    className="!absolute inset-0 rounded-[24px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                          {project.published_at
                            ? new Date(project.published_at).toLocaleDateString("sr-RS")
                            : `Projekat ${String(i + 1).padStart(2, "0")}`}
                        </p>
                        <h3 className="mt-2 font-display text-3xl font-black uppercase leading-[0.92] [font-stretch:62%] sm:text-4xl">
                          {project.title}
                        </h3>
                        {project.excerpt && (
                          <p className="mt-2 line-clamp-2 max-w-md font-body text-sm text-white/65">{project.excerpt}</p>
                        )}
                      </div>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 backdrop-blur transition-all duration-500 group-hover:rotate-[-45deg] group-hover:bg-primary group-hover:text-ink">
                        →
                      </span>
                    </div>
                  </ParallaxImage>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaBand
        label="Kontakt"
        lines={["Provera terena", { text: "ili hitna isporuka?", className: "text-primary" }]}
        text="Pozovite nas ili pošaljite upit. Naš tim odmah odgovara i organizuje logistiku na terenu."
        image="/img/kamion3.webp"
        bullets={[
          "Zona: Niš, Leskovac, Prokuplje, Aleksinac, jug/centar Srbije",
          "Flota: mikseri, pumpe, kiperi, bageri",
          "Hitne isporuke: brza reakcija uz proveru pristupa",
          "Rezervacije: planiranje termina unapred",
        ]}
      >
        <a href="tel:+381605887471" className="btn-primary">
          Pozovi odmah
        </a>
        <Link href="/porucivanje-betona#forma" className="btn-outline-white">
          Pošalji upit
        </Link>
      </CtaBand>
    </div>
  );
}
