import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/page-hero";
import { CtaBand } from "@/components/sections";
import { getProject, getProjects } from "@/lib/api";

export const revalidate = 300;

type RouteParams = { slug: string };
type Props = {
  params: Promise<RouteParams> | RouteParams;
};

export async function generateStaticParams() {
  try {
    const projects = await getProjects(300, 0);
    return (projects.data || []).map((project) => ({ slug: project.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const project = await getProject(slug);
    return {
      title: `${project.title} | Prevoz Kop`,
      description: project.excerpt || "Projekat Prevoz Kop",
      alternates: {
        canonical: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://prevozkop.rs"
        }/projekti/${slug}`,
      },
    };
  } catch {
    return {
      title: "Projekat | Prevoz Kop",
      description: "Detalji projekta Prevoz Kop.",
      alternates: {
        canonical: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://prevozkop.rs"
        }/projekti/${slug}`,
      },
    };
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  let project = null;
  try {
    project = await getProject(slug);
  } catch {
    notFound();
  }

  const gallery = project.gallery ?? [];

  return (
    <div className="bg-cement">
      <PageHero
        title={project.title}
        kicker="Projekat"
        description={project.excerpt || undefined}
        background={project.hero_image || "/img/napolje1.webp"}
        priority
        actions={[{ label: "Sličan projekat? Pošalji upit", href: "/porucivanje-betona#forma" }]}
      />

      <section className="content-section py-20 sm:py-28">
        <Link
          href="/projekti"
          className="mb-12 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full border border-ink/20">←</span>
          Nazad na projekte
        </Link>

        {project.body && (
          <div className="grid gap-10 lg:grid-cols-[0.35fr_0.65fr]">
            <p className="section-label">Opis radova</p>
            <article className="rich-text" dangerouslySetInnerHTML={{ __html: project.body }} />
          </div>
        )}
      </section>

      {gallery.length > 0 && (
        <section className="bg-ink py-20 text-white sm:py-28">
          <div className="content-section">
            <p className="section-label mb-10">Galerija · {gallery.length}</p>
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
              {gallery.map((img, idx) => (
                <figure key={`${img.src}-${idx}`} className="group relative break-inside-avoid overflow-hidden rounded-[20px]" data-cursor="view">
                  <Image
                    src={img.src}
                    alt={img.alt || project.title}
                    width={1200}
                    height={900}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-auto w-full transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.04]"
                  />
                  <figcaption className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] text-white/80 backdrop-blur">
                    {String(idx + 1).padStart(2, "0")}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand
        label="Vaš projekat"
        lines={["Sledeće gradilište", { text: "može biti vaše", className: "text-primary" }]}
        image={project.hero_image || "/img/mikseri.webp"}
      >
        <Link href="/porucivanje-betona#forma" className="btn-primary">
          Pošalji upit
        </Link>
        <Link href="/projekti" className="btn-outline-white">
          Svi projekti
        </Link>
      </CtaBand>
    </div>
  );
}
