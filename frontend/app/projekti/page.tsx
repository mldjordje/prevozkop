import Link from "next/link";
import PageHero from "@/components/page-hero";
import { ScrollReveal, StaggerReveal } from "@/components/motion/reveal";
import TiltCard from "@/components/motion/tilt-card";
import { getProjects } from "@/lib/api";
import type { Project } from "@/lib/api";

export default async function ProjectsPage() {
  let projects: Project[] = [];
  try {
    const response = await getProjects(60, 0);
    projects = response.data || [];
  } catch (error) {
    console.error("Neuspelo učitavanje projekata:", error);
  }

  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title="Galerija projekata"
        kicker="Radovi"
        description="Betoniranje, tamponiranje, rušenje i transport rasutih materijala širom regiona."
        background="/img/volvonov2.webp"
        priority
        actions={[{ label: "Zatraži ponudu", href: "/porucivanje-betona#forma" }]}
      />

      <section className="content-section space-y-8">
        <ScrollReveal className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Na terenu
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">Poslednji završeni projekti</h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Projekti direktno iz baze – kada objavite novi rad u admin panelu, pojaviće se i ovde.
          </p>
        </ScrollReveal>

        {projects.length === 0 ? (
          <ScrollReveal>
            <p className="text-sm text-gray-600">
              Još uvek nema objavljenih projekata. Dodajte prvi projekat kroz admin panel.
            </p>
          </ScrollReveal>
        ) : (
          <StaggerReveal className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {projects.map((project) => (
              <ScrollReveal key={project.id} from="up" className="h-full">
                <Link href={`/projekti/${project.slug}`} className="group block h-full">
                  <TiltCard className="h-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-md transition">
                    <article>
                      <div className="h-52 overflow-hidden">
                        <img
                          src={project.hero_image || "/img/napolje1.webp"}
                          alt={project.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="space-y-1 p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-primary">
                          {project.published_at
                            ? `Objavljeno ${new Date(project.published_at).toLocaleDateString("sr-RS")}`
                            : "Projekat"}
                        </p>
                        <h3 className="text-lg font-semibold text-dark">{project.title}</h3>
                        {project.excerpt && (
                          <p className="text-sm text-gray-600">{project.excerpt}</p>
                        )}
                        <p className="pt-1 text-sm font-semibold text-primary">Pogledaj projekat →</p>
                      </div>
                    </article>
                  </TiltCard>
                </Link>
              </ScrollReveal>
            ))}
          </StaggerReveal>
        )}
      </section>

      <section className="content-section">
        <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-dark text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,161,0,0.25),_transparent_45%)]" />
          <div className="grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Kontakt
              </span>
              <h3 className="text-3xl font-bold leading-tight sm:text-4xl">
                Potrebna je provera terena ili hitna isporuka?
              </h3>
              <p className="text-sm text-gray-200">
                Pozovite nas ili pošaljite upit. Naš tim odmah odgovara i organizuje logistiku na
                terenu.
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
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2">
              <InfoCard label="Zona" value="Niš, Leskovac, Prokuplje, Aleksinac, jug/centar Srbije" />
              <InfoCard label="Flota" value="Mikseri, pumpe, kiperi, bageri" />
              <InfoCard label="Hitne isporuke" value="Brza reakcija uz proveru pristupa" />
              <InfoCard label="Rezervacije" value="Planiranje termina unapred" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
