import ProjectsGrid from "./projects-grid";

export const metadata = {
  title: "Projekti | Prevoz Kop",
  description: "Reference i realizovani projekti Prevoz Kop.",
};

export default function ProjektiPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-primary uppercase tracking-widest text-xs font-semibold">Reference</p>
        <h1 className="text-3xl font-bold">Naši projekti</h1>
        <p className="text-gray-700">Pogledajte izbor realizovanih radova – beton, pumpanje, iskopa i transport.</p>
      </div>
      <ProjectsGrid limit={30} />
    </div>
  );
}
