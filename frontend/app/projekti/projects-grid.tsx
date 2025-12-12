import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/lib/api";

type Props = {
  featured?: boolean;
  limit?: number;
};

export default async function ProjectsGrid({ featured = false, limit = 12 }: Props) {
  const { data } = await getProjects(limit, 0);

  if (!data?.length) {
    return <p className="text-gray-600">Nema projekata za prikaz.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((project) => (
        <Link
          key={project.id}
          href={`/projekti/${project.slug}`}
          className="group rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col"
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
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                Bez slike
              </div>
            )}
          </div>
          <div className="p-4 space-y-2 flex-1">
            <h3 className="font-semibold text-lg">{project.title}</h3>
            {project.excerpt && (
              <p className="text-sm text-gray-600 line-clamp-2">{project.excerpt}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
