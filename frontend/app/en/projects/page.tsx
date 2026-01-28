import Link from "next/link";
import PageHero from "@/components/page-hero";
import { getProjects } from "@/lib/api";
import type { Project } from "@/lib/api";

export default async function ProjectsEn() {
  let projects: Project[] = [];
  try {
    const res = await getProjects(60, 0);
    projects = res.data || [];
  } catch (error) {
    console.error("Failed to load projects:", error);
  }

  return (
    <div className="space-y-12 sm:space-y-16">
      <PageHero
        title="Projects"
        kicker="Gallery"
        description="Recent concrete deliveries, demolition and earthwork jobs. Open a project to view photos."
        background="/img/volvonov2.webp"
        actions={[{ label: "Order concrete", href: "/en/order-concrete#form" }]}
      />

      <section className="content-section space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold sm:text-3xl">Latest work</h2>
          <Link href="/projekti" className="text-sm text-primary hover:underline">
            Serbian gallery →
          </Link>
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-gray-600">No published projects yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projekti/${project.slug}`}
                className="group block overflow-hidden rounded-2xl border border-black/5 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              >
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
                        ? `Published ${new Date(project.published_at).toLocaleDateString("sr-RS")}`
                        : "Project"}
                    </p>
                    <h3 className="text-lg font-semibold text-dark">{project.title}</h3>
                    {project.excerpt && <p className="text-sm text-gray-600">{project.excerpt}</p>}
                    <p className="pt-1 text-sm font-semibold text-primary">Open project →</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
