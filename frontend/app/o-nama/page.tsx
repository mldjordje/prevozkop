export const metadata = {
  title: "O nama | Prevoz Kop",
  description: "Proizvodnja i isporuka betona, pumpanje, iskopi i prevoz materijala.",
};

const highlights = [
  "Proizvodnja betona na sopstvenoj bazi",
  "Brza i tacna dostava mikserima",
  "Nasipanje betona pumpama",
  "Iskopi i priprema terena",
  "Prevoz rasutih materijala",
];

export default function OnamaPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10">
      <header className="space-y-3">
        <p className="text-primary uppercase tracking-widest text-xs font-semibold">O nama</p>
        <h1 className="text-3xl font-bold">Proizvodnja i isporuka betona visokog kvaliteta</h1>
        <p className="text-lg text-gray-700">
          Nasa firma specijalizovana je za proizvodnju betona i betonskih mesavina, kao i za brzu i efikasnu dostavu.
          Uz sopstvenu bazu, mikser vozila i pumpe za beton, obezbedjujemo tacnost, pouzdanost i stabilan rezultat na terenu.
        </p>
      </header>

      <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-start">
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Iskustvo i fokus na kvalitet</h2>
            <p className="text-gray-700">
              Sa vise od pet godina iskustva, tim inzenjera i operatera planira, proizvodi i isporucuje beton koji ispunjava
              standarde cvrstoce i homogenosti. Svaki projekat posmatramo kao partnerstvo i prilagodjavamo se vremenskom
              okviru gradilista.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Od 2020. godine</h2>
            <p className="text-gray-700">
              Kompanija je osnovana 2020. godine sa ciljem da pruzi kompletnu uslugu: od pripreme terena i tamponiranja,
              preko proizvodnje i pumpanja betona, do prevoza rasutih materijala. Investiramo u vozni park i opremu kako
              bismo svaki zahtev isporucili na vreme.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-inner space-y-4">
          <h3 className="text-lg font-semibold">Sta dobijate</h3>
          <ul className="space-y-2 text-gray-700">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
