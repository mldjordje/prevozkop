import PageHero from "@/components/page-hero";

export default function AboutEn() {
  return (
    <div className="space-y-12 sm:space-y-16">
      <PageHero
        title="About Prevoz Kop"
        kicker="Family business"
        description="We produce and deliver concrete, demolish structures, perform excavation and earthworks, and transport bulk materials with our own fleet and crew."
        background="/img/volvonov2.webp"
      />

      <section className="content-section space-y-4">
        <h2 className="text-2xl font-bold sm:text-3xl">Reliable partner on site</h2>
        <p className="max-w-3xl text-sm text-gray-700">
          Decades of heavy-duty experience in Niš and southern Serbia. We plan access, choose the
          right machinery, deliver concrete on schedule and keep your site tidy and safe.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Own concrete base and logistics with mixers and pumps",
            "Modern machinery for excavation, grading and demolition",
            "Crew that coordinates suppliers and schedules deliveries",
            "Transparent pricing and clear communication in Serbian/English",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm font-semibold text-dark shadow-sm"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
