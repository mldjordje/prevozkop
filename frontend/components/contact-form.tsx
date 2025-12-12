'use client';

import { FormEvent, useState } from "react";
import clsx from "clsx";

type FormState = "idle" | "loading" | "success" | "error";

const concreteTypes = [
  "MB 10",
  "MB 15",
  "MB 20",
  "MB 25 VODONEPROPUSTIV",
  "MB 30 VODONEPROPUSTIV",
  "MB 35 VODONEPROPUSTIV",
  "MB 40 VODONEPROPUSTIV",
  "V8 M150",
];

export default function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("https://api.prevozkop.rs/mail/contact-form.php", {
        method: "POST",
        body: data,
      });
      const text = (await res.text()).trim();
      if (text === "Y") {
        setState("success");
        form.reset();
      } else {
        setState("error");
        setError("Došlo je do greške, pokušajte ponovo.");
      }
    } catch (err) {
      console.error(err);
      setState("error");
      setError("Server privremeno nije dostupan.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-lg sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-dark">
          Ime i prezime*
          <input
            required
            name="name"
            className="rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Vaše ime"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-dark">
          Email*
          <input
            required
            name="email"
            type="email"
            className="rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="primer@email.com"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-dark">
          Tema razgovora*
          <input
            required
            name="subject"
            className="rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Nasipanje, beton..."
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-dark">
          Kontakt telefon
          <input
            name="phone"
            className="rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="+381..."
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-semibold text-dark">
        Vrsta betona (nije obavezno)
        <select
          name="concrete_type"
          className="rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary"
          defaultValue=""
        >
          <option value="">Izaberite vrstu betona</option>
          {concreteTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-dark">
        Poruka*
        <textarea
          required
          name="message"
          rows={4}
          className="rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="Kako možemo da pomognemo?"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={state === "loading"}
          className={clsx(
            "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-dark transition",
            "bg-primary shadow-[0_14px_40px_rgba(244,161,0,0.35)] hover:translate-y-[-2px]",
            state === "loading" && "opacity-70"
          )}
        >
          {state === "loading" ? "Slanje..." : "Pošalji upit"}
        </button>
        {state === "success" && (
          <p className="text-sm font-semibold text-green-600">
            Vaš upit je uspešno poslat!
          </p>
        )}
        {state === "error" && (
          <p className="text-sm font-semibold text-red-600">{error}</p>
        )}
      </div>
    </form>
  );
}
