export const metadata = {
  title: "Usluge | Prevoz Kop",
  description: "Proizvodnja i isporuka betona, pumpanje, iskopi, tamponiranje i prevoz materijala.",
};

const services = [
  {
    title: "Proizvodnja i isporuka betona",
    desc: "Sopstvena betonska baza i kontrola kvaliteta. Tacna dostava mikserima prema rasporedu gradilista.",
  },
  {
    title: "Pumpanje betona",
    desc: "Pumpe za beton za brzo i precizno plasiranje na trazenu visinu ili dubinu.",
  },
  {
    title: "Iskopi i tamponiranje",
    desc: "Priprema terena, iskopi, tampon i nivelacija kao siguran temelj za izgradnju.",
  },
  {
    title: "Rusenje i priprema terena",
    desc: "Bezbedno rusenje objekata, odvoz otpada i priprema lokacije za nove radove.",
  },
  {
    title: "Prevoz rasutih materijala",
    desc: "Pesak, sljunak, rizla, zemlja i drugi materijali u svim kolicinama, pravovremeno.",
  },
  {
    title: "Izgradnja temelja",
    desc: "Izlivanje temelja i ploca sa proverom nosivosti i ujednacenosti smese.",
  },
];

export default function UslugePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-10">
      <header className="space-y-3">
        <p className="text-primary uppercase tracking-widest text-xs font-semibold">Usluge</p>
        <h1 className="text-3xl font-bold">Kompletna podrska za gradiliste</h1>
        <p className="text-lg text-gray-700">
          Od pripreme terena do gotovih ploca. Beton, pumpe, iskopi i transport materijala sa jedne adrese.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <div key={service.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-semibold">{service.title}</h3>
            <p className="text-gray-700">{service.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-inner space-y-3">
        <h2 className="text-xl font-semibold">Zasto mi</h2>
        <p className="text-gray-700">
          Kombinujemo sopstvenu proizvodnju, transport i specijalizovanu opremu da bismo isporucili beton i usluge bez kasnjenja.
          Uz planiranje i jasan raspored, prilagodjavamo se dinamici svakog gradilista.
        </p>
      </div>
    </div>
  );
}
