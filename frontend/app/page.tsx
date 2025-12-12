import Link from "next/link";
import ProjectsGrid from "./projekti/projects-grid";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-14">
      <section className="grid gap-10 lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <p className="text-primary uppercase tracking-widest text-xs font-semibold">
            Beton · Dostava · Iskop
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            Gradimo čvrste temelje za vaše projekte
          </h1>
          <p className="text-lg text-gray-700">
            Proizvodnja i isporuka betona, pumpanje, iskopi i prevoz rasutih materijala širom regiona.
          </p>
          <div className="flex gap-3">
            <Link href="/kontakt" className="rounded-md bg-primary px-5 py-3 text-white font-semibold shadow">
              Poruči beton
            </Link>
            <Link href="/projekti" className="rounded-md border border-gray-300 px-5 py-3 font-semibold hover:border-primary">
              Reference
            </Link>
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl p-6 shadow-inner">
          <ProjectsGrid featured limit={3} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          { title: "Proizvodnja betona", desc: "Vlastita baza, kontrola kvaliteta, tačna isporuka." },
          { title: "Pumpanje i mikseri", desc: "Flota vozila i pumpe za brzu i preciznu isporuku." },
          { title: "Iskopi i prevoz", desc: "Iskopi, tamponiranje, prevoz šljunka, peska i zemlje." },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-gray-700 mt-2">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
