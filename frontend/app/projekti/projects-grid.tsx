import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/lib/api";

type Props = {
  featured?: boolean;
  limit?: number;
};

export default async function ProjectsGrid({ featured = false, limit = 12 }: Props) {
  let data: Awaited<ReturnType<typeof getProjects>>["data"] = [];
  try {
    const res = await getProjects(limit, 0);
    data = res.data || [];
  } catch (error) {
    console.error("Neuspelo ucitavanje projekata:", error);
    data = [];
  }

  if (!data?.length) {
    return <p className="text-gray-600">Nema projekata za prikaz.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((project) => (
        <Link
          key={project.id}
          href={`/projekti/${project.slug}`}
          className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="relative aspect-[4/3] bg-gray-100">
            {project.hero_image ? (
              <Image
                src={project.hero_image}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                Bez slike
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2 p-4">
            <h3 className="text-lg font-semibold">{project.title}</h3>
            {project.excerpt && (
              <p className="line-clamp-2 text-sm text-gray-600">{project.excerpt}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
