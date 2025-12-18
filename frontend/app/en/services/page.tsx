import PageHero from "@/components/page-hero";

export default function ServicesEn() {
  return (
    <div className="space-y-12 sm:space-y-16">
      <PageHero
        title="Services"
        kicker="What we offer"
        description="Concrete production and delivery, demolition, excavation, grading and transport of bulk materials across Niš and southern Serbia."
        background="/img/volvonov2.webp"
        actions={[{ label: "Order concrete", href: "/en/order-concrete#form" }]}
      />

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold sm:text-3xl">Core services</h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Turnkey heavy-duty support for residential, commercial and industrial projects.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Concrete delivery",
              desc: "Mixers and pumps, controlled slump, on-time dispatch, site logistics.",
            },
            { title: "Demolition", desc: "Selective demolition, debris removal and transport." },
            { title: "Excavation & grading", desc: "Foundations, trenches, embankments and backfill." },
            { title: "Bulk transport", desc: "Sand, gravel, stone, crushed concrete, soil." },
            { title: "Site prep", desc: "Compaction, subbase, access planning and haul roads." },
            { title: "Project support", desc: "Material sourcing, scheduling, on-site supervision." },
          ].map((item) => (
            <li key={item.title} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
