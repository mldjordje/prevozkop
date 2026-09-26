import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import { ParallaxImage } from "@/components/motion/scroll-effects";
import { SectionHead } from "@/components/sections";
import { getProjects } from "@/lib/api";
import type { Project } from "@/lib/api";
import { buildMetadata, srEnLanguages } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Projects | Prevoz Kop",
  description:
    "Recent concrete, demolition and earthwork projects from Niš and southern Serbia.",
  path: "/en/projects",
  locale: "en_US",
  image: "/img/volvonov2.webp",
  languages: srEnLanguages("/projekti", "/en/projects"),
});

export default async function ProjectsEn() {
  let projects: Project[] = [];
  try {
    const res = await getProjects(60, 0);
    projects = res.data || [];
  } catch (error) {
    console.error("Failed to load projects:", error);
  }

  return (
    <div className="bg-cement">
      <PageHero
        title="Projects"
        kicker="Gallery"
        description="Recent concrete deliveries, demolition and earthwork jobs. Open a project to view photos."
        background="/img/volvonov2.webp"
        priority
        actions={[{ label: "Order concrete", href: "/en/order-concrete#form" }]}
      />
      <section className="bg-ink py-24 text-white sm:py-32">
        <div className="content-section">
          <SectionHead
            tone="dark"
            label="Latest work"
            lines={["Recent", { text: "projects", className: "text-primary" }]}
            aside={
              <Link href="/projekti" className="btn-outline-white">
                Serbian gallery
              </Link>
            }
          />
          {projects.length === 0 ? (
            <p className="font-body text-white/60">No published projects yet.</p>
          ) : (
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              {projects.map((project) => (
                <Link key={project.id} href={`/projekti/${project.slug}`} data-cursor="view" className="group relative block aspect-[4/3]">
                  <ParallaxImage
                    src={project.hero_image || "/img/napolje1.webp"}
                    alt={project.title}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    strength={8}
                    className="!absolute inset-0 rounded-[24px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <h3 className="font-display text-4xl font-black uppercase leading-[0.92] [font-stretch:62%]">{project.title}</h3>
                      {project.excerpt && <p className="mt-2 line-clamp-2 font-body text-sm text-white/65">{project.excerpt}</p>}
                    </div>
                  </ParallaxImage>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
