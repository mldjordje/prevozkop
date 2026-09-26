import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/lib/api";

type Props = {
  featured?: boolean;
  limit?: number;
};

export default async function ProjectsGrid({ limit = 12 }: Props) {
  let data: Awaited<ReturnType<typeof getProjects>>["data"] = [];
  try {
    const res = await getProjects(limit, 0);
    data = res.data || [];
  } catch (error) {
    console.error("Neuspelo učitavanje projekata:", error);
    data = [];
  }

  if (!data?.length) {
    return <p className="font-body text-muted">Nema projekata za prikaz.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((project, i) => (
        <Link
          key={project.id}
          href={`/projekti/${project.slug}`}
          data-cursor="view"
          className="group relative block aspect-[4/5] overflow-hidden rounded-[24px] bg-ink"
        >
          {project.hero_image ? (
            <Image
              src={project.hero_image}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.06]"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center font-mono text-xs uppercase tracking-[0.2em] text-white/40">
              Bez slike
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-2 font-display text-3xl font-black uppercase leading-[0.92] [font-stretch:62%]">{project.title}</h3>
            {project.excerpt && <p className="mt-2 line-clamp-2 font-body text-sm text-white/65">{project.excerpt}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}
