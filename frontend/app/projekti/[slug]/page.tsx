import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/api";

type RouteParams = { slug: string };
type Props = {
  params: Promise<RouteParams> | RouteParams;
};

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

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <Link href="/projekti" className="text-sm text-gray-600 hover:text-primary">
        ← Nazad na projekte
      </Link>
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Projekat
        </p>
        <h1 className="text-3xl font-bold">{project.title}</h1>
        {project.excerpt && <p className="text-lg text-gray-700">{project.excerpt}</p>}
      </div>

      {project.hero_image && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
          <Image src={project.hero_image} alt={project.title} fill className="object-cover" />
        </div>
      )}

      {project.body && (
        <article className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: project.body }} />
        </article>
      )}

      {project.gallery && project.gallery.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Galerija</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.gallery.map((img, idx) => (
              <div
                key={`${img.src}-${idx}`}
                className="relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
              >
                <Image
                  src={img.src}
                  alt={img.alt || project.title}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
