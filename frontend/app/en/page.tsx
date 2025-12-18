import Link from "next/link";
import PageHero from "@/components/page-hero";
import ProjectsGrid from "@/app/projekti/projects-grid";

export default function HomeEn() {
  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title="Concrete supply, demolition and earthworks"
        kicker="Prevoz Kop"
        description="Concrete production and delivery with mixers and pumps, excavation, demolition, grading and transport of bulk materials across Niš and southern Serbia."
        background="/img/kamionislika2.webp"
        priority
        actions={[
          { label: "Order concrete", href: "/en/order-concrete#form" },
          { label: "Contact us", href: "/en/contact" },
        ]}
      />

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Services</p>
          <h2 className="text-3xl font-bold sm:text-4xl">What we do</h2>
          <p className="max-w-3xl text-gray-700">
            Concrete production and transport (mixers, pumps), demolition of structures, excavation,
            grading and all heavy-duty earthworks with modern machinery.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Concrete delivery", desc: "Mixers and pumps, on time and on spec." },
            { title: "Demolition", desc: "Safe takedown of houses, halls and industrial objects." },
            { title: "Earthworks", desc: "Excavation, grading, embankment and backfill." },
            { title: "Transport", desc: "Bulk materials with tipper trucks and trailers." },
            { title: "Project support", desc: "Site visits, logistics planning, material sourcing." },
            { title: "Recycling", desc: "Concrete rubble removal and site cleanup." },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
        <div>
          <Link
            href="/en/services"
            className="text-sm font-semibold text-primary hover:underline"
          >
            See all services →
          </Link>
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Recent work
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">Project gallery</h2>
          <p className="max-w-3xl text-sm text-gray-700">
            A selection of our recent jobs. For full descriptions and galleries open a project page.
          </p>
        </div>
        <ProjectsGrid limit={6} />
        <Link href="/en/projects" className="text-sm font-semibold text-primary hover:underline">
          All projects →
        </Link>
      </section>
    </div>
  );
}
