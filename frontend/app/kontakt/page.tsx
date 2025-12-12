export const metadata = {
  title: "Kontakt | Prevoz Kop",
  description: "Kontaktirajte nas za isporuku betona, pumpanje ili iskope.",
};

export default function KontaktPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
      <div className="space-y-3">
        <p className="text-primary uppercase tracking-widest text-xs font-semibold">Kontakt</p>
        <h1 className="text-3xl font-bold">Stupite u kontakt</h1>
        <p className="text-gray-700">Pozovite nas za ponudu ili pošaljite upit putem forme.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Detalji</h2>
          <div className="space-y-2 text-gray-700">
            <p><strong>Telefon:</strong> <a href="tel:+381605887471" className="text-primary">+381 60 588 7471</a></p>
            <p><strong>Email:</strong> <a href="mailto:prevozkopbb@gmail.com" className="text-primary">prevozkopbb@gmail.com</a></p>
            <p><strong>Adresa:</strong> Krušce, Niš 18000</p>
            <p><strong>Radno vreme:</strong> Pon–Sub 08–20h</p>
          </div>
        </div>
        <form className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4" action="https://prevozkop.rs/mail/contact-form.php" method="post">
          <div>
            <label className="text-sm font-semibold text-gray-700">Ime i prezime</label>
            <input name="name" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Vaše ime" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input name="email" type="email" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" placeholder="email@primer.rs" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Telefon</label>
            <input name="phone" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" placeholder="+381..." />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Tema</label>
            <input name="subject" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Tema razgovora" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Vrsta betona</label>
            <select name="beton" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2">
              <option value="">Izaberite</option>
              <option>MB 10</option>
              <option>MB 15</option>
              <option>MB 20</option>
              <option>MB 25</option>
              <option>MB 30</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Poruka</label>
            <textarea name="message" rows={4} required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Vaš upit" />
          </div>
          <button type="submit" className="w-full rounded-md bg-primary px-4 py-3 text-white font-semibold shadow hover:opacity-90">
            Pošalji upit
          </button>
        </form>
      </div>
    </div>
  );
}
