'use client';

import { FormEvent, useRef, useState } from "react";
import clsx from "clsx";
import type { Order } from "@/lib/api";

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

type ContactFormProps = {
  defaultSubject?: string;
  subjectPlaceholder?: string;
  selectLabel?: string;
  selectOptions?: string[];
  selectPlaceholder?: string;
  defaultSelectValue?: string;
  selectRequired?: boolean;
  showQuantity?: boolean;
  quantityLabel?: string;
  quantityPlaceholder?: string;
  quantityUnitLabel?: string;
  quantityUnits?: string[];
  defaultQuantityUnit?: string;
};

export default function ContactForm({
  defaultSubject,
  subjectPlaceholder,
  selectLabel,
  selectOptions,
  selectPlaceholder,
  defaultSelectValue,
  selectRequired,
  showQuantity,
  quantityLabel,
  quantityPlaceholder,
  quantityUnitLabel,
  quantityUnits,
  defaultQuantityUnit,
}: ContactFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const submitInFlightRef = useRef(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.prevozkop.rs/api";
  const DEFAULT_SEND_TO = "AW-17801652604/1aABCMrT9tIbEPzSvqHC";
  const GOOGLE_ADS_SEND_TO =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_SEND_TO ||
    process.env.NEXT_PUBLIC_GADS_SEND_TO ||
    DEFAULT_SEND_TO;
  const resolvedSelectOptions = selectOptions ?? concreteTypes;
  const resolvedSelectLabel = selectLabel || "Vrsta betona (nije obavezno)";
  const resolvedSelectPlaceholder = selectPlaceholder || "Izaberite vrstu betona";
  const resolvedQuantityLabel = quantityLabel || "Kolicina (opciono)";
  const resolvedQuantityPlaceholder = quantityPlaceholder || "npr. 120";
  const resolvedQuantityUnitLabel = quantityUnitLabel || "Jedinica";
  const resolvedQuantityUnits = quantityUnits ?? ["m2", "m3", "kom", "paleta"];
  const concreteSet = new Set(concreteTypes.map((item) => item.toLowerCase()));

  function detectServiceType(subject: string, selectedType: string) {
    const normalizedSubject = subject.trim().toLowerCase();
    const normalizedType = selectedType.trim().toLowerCase();
    if (normalizedSubject.includes("behaton")) return "behaton";
    if (normalizedSubject.includes("beton")) return "beton";
    if (normalizedType) {
      return concreteSet.has(normalizedType) ? "beton" : "behaton";
    }
    return "other";
  }

  function detectCitySlug(path: string | null): string | null {
    if (!path) return null;
    const match = path.match(/^\/(?:behaton|beton)\/grad\/([^/?#]+)/);
    return match?.[1] || null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitInFlightRef.current) return;
    submitInFlightRef.current = true;
    setState("loading");
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const selectedType = (data.get("concrete_type") as string) || "";
    const quantity = (data.get("quantity") as string) || "";
    const quantityUnit = (data.get("quantity_unit") as string) || "";
    const rawMessage = (data.get("message") as string) || "";
    const detailLines: string[] = [];
    if (selectedType) detailLines.push(`Model: ${selectedType}`);
    if (quantity) {
      detailLines.push(`Kolicina: ${quantity}${quantityUnit ? ` ${quantityUnit}` : ""}`);
    }
    const message = detailLines.length ? `${detailLines.join(" | ")}\n${rawMessage}` : rawMessage;

    const subject = (data.get("subject") as string) || "";
    const serviceType = detectServiceType(subject, selectedType);
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "/";
    const citySlug = detectCitySlug(currentPath);
    const currentSearch =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

    const payload: Partial<Order> = {
      name: (data.get("name") as string) || "",
      email: (data.get("email") as string) || "",
      phone: (data.get("phone") as string) || "",
      subject,
      concrete_type: selectedType,
      service_type: serviceType,
      quantity: quantity || null,
      quantity_unit: quantityUnit || null,
      city_slug: citySlug,
      source_page: currentPath || "/",
      utm_source: currentSearch?.get("utm_source") || null,
      utm_medium: currentSearch?.get("utm_medium") || null,
      utm_campaign: currentSearch?.get("utm_campaign") || null,
      message,
    };

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const gtag = typeof window !== "undefined" ? (window as any).gtag : undefined;
      if (typeof gtag === "function" && GOOGLE_ADS_SEND_TO) {
        // Google Ads conversion event (requires proper send_to value with conversion label)
        gtag("event", "conversion", { send_to: GOOGLE_ADS_SEND_TO });
      }
      setState("success");
      form.reset();
    } catch (err) {
      console.error(err);
      setState("error");
      setError("Server privremeno nije dostupan.");
    } finally {
      submitInFlightRef.current = false;
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
            placeholder={subjectPlaceholder || "Nasipanje, beton..."}
            defaultValue={defaultSubject}
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
        {resolvedSelectLabel}
        <select
          name="concrete_type"
          className="rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary"
          defaultValue={defaultSelectValue || ""}
          required={selectRequired}
        >
          <option value="">{resolvedSelectPlaceholder}</option>
          {resolvedSelectOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      {showQuantity && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-dark">
            {resolvedQuantityLabel}
            <input
              name="quantity"
              type="number"
              min="0"
              step="0.01"
              className="rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder={resolvedQuantityPlaceholder}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-dark">
            {resolvedQuantityUnitLabel}
            <select
              name="quantity_unit"
              className="rounded-lg border border-black/10 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary"
              defaultValue={defaultQuantityUnit || ""}
            >
              <option value="">Izaberite jedinicu</option>
              {resolvedQuantityUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

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
          <p className="text-sm font-semibold text-green-600">Vaš upit je uspešno poslat!</p>
        )}
        {state === "error" && <p className="text-sm font-semibold text-red-600">{error}</p>}
      </div>
    </form>
  );
}
