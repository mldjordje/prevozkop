import Link from "next/link";
import PageHero from "@/components/page-hero";
import { projectGallery } from "@/content/site";

export default function ProjectsPage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title="Galerija projekata"
        kicker="Radovi"
        description="Izbor terenskih radova: betoniranje, tamponiranje, rušenje i transport rasutih materijala."
        background="/img/volvonov2.jpg"
        actions={[{ label: "Zatraži ponudu", href: "/kontakt" }]}
      />

      <section className="content-section space-y-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Na terenu
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Poslednji završeni projekti
          </h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Prikaz delova flote, procesa pripreme terena i isporuka betona širom juga
            Srbije.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projectGallery.map((project) => (
            <div
              key={project.title}
              className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-52 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="space-y-1 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                  {project.category || "Projekat"}
                </p>
                <h3 className="text-lg font-semibold text-dark">{project.title}</h3>
                <p className="text-sm text-gray-600">{project.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-dark text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,161,0,0.25),_transparent_45%)]" />
          <div className="grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Planiranje projekta
              </span>
              <h3 className="text-3xl font-bold sm:text-4xl">
                Imate sličan projekat? Tu smo od prve ideje do poslednjeg kubika.
              </h3>
              <p className="text-sm text-gray-200">
                Pošaljite fotografije terena ili nacrt, a mi ćemo predložiti vrstu betona,
                logistiku i termin isporuke.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/kontakt"
                  className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-dark shadow-[0_12px_40px_rgba(244,161,0,0.4)] transition hover:translate-y-[-2px]"
                >
                  Kontaktiraj tim
                </Link>
                <Link
                  href="tel:+381605887471"
                  className="inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-dark"
                >
                  Pozovi za procenu
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <ul className="space-y-3 text-sm text-gray-200">
                <li>• Terenska procena i savetovanje</li>
                <li>• Detaljan plan logistike i pristupa</li>
                <li>• Fleksibilni termini isporuke</li>
                <li>• Podrška tokom čitavog procesa betoniranja</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
