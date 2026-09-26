'use client';

import { FormEvent, useRef, useState } from "react";
import clsx from "clsx";
import type { Order } from "@/lib/api";
import { getCurrentPathWithSearch, trackEvent, trackGoogleAdsConversion } from "@/lib/tracking";

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

const inputClass =
  "block w-full min-w-0 rounded-2xl border border-transparent bg-cement px-4 py-4 font-body text-[15px] text-ink placeholder:text-ink/35 outline-none transition-all duration-300 hover:bg-[#e8e5de] focus:border-ink focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,161,0,0.25)]";

const labelClass =
  "flex min-w-0 flex-col gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-ink/60";

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
  const DEFAULT_FORM_SEND_TO = "AW-17801652604/1aABCMrT9tIbEPzSvqHC";
  const GOOGLE_ADS_FORM_SEND_TO =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_FORM_SEND_TO ||
    process.env.NEXT_PUBLIC_GOOGLE_ADS_SEND_TO ||
    process.env.NEXT_PUBLIC_GADS_FORM_SEND_TO ||
    process.env.NEXT_PUBLIC_GADS_SEND_TO ||
    DEFAULT_FORM_SEND_TO;

  const resolvedSelectOptions = selectOptions ?? concreteTypes;
  const resolvedSelectLabel = selectLabel || "Vrsta betona (opciono)";
  const resolvedSelectPlaceholder = selectPlaceholder || "Izaberite vrstu betona";
  const resolvedQuantityLabel = quantityLabel || "Količina (opciono)";
  const resolvedQuantityPlaceholder = quantityPlaceholder || "npr. 20";
  const resolvedQuantityUnitLabel = quantityUnitLabel || "Jedinica";
  const resolvedQuantityUnits = quantityUnits ?? ["m2", "m3", "kom", "paleta"];

  const concreteSet = new Set(concreteTypes.map((item) => item.toLowerCase()));

  function detectServiceType(subject: string, selectedType: string) {
    const s = subject.trim().toLowerCase();
    const t = selectedType.trim().toLowerCase();
    if (s.includes("behaton")) return "behaton";
    if (s.includes("beton")) return "beton";
    if (t) return concreteSet.has(t) ? "beton" : "behaton";
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
    if (quantity) detailLines.push(`Količina: ${quantity}${quantityUnit ? ` ${quantityUnit}` : ""}`);
    const message = detailLines.length ? `${detailLines.join(" | ")}\n${rawMessage}` : rawMessage;

    const subject = (data.get("subject") as string) || defaultSubject || "";
    const serviceType = detectServiceType(subject, selectedType);
    const currentPath = getCurrentPathWithSearch();
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
      const response = (await res.json()) as { id?: number; ok?: boolean };

      trackEvent("generate_lead", {
        lead_type: serviceType,
        source_page: currentPath,
        city_slug: citySlug || undefined,
      });
      trackGoogleAdsConversion(GOOGLE_ADS_FORM_SEND_TO, {
        transaction_id: response.id ? `order-${response.id}` : undefined,
      });

      setState("success");
      form.reset();
    } catch (err) {
      console.error(err);
      setState("error");
      setError("Server privremeno nije dostupan. Pozovite nas direktno.");
    } finally {
      submitInFlightRef.current = false;
    }
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-6 rounded-[22px] bg-white px-6 py-16 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-primary text-4xl text-ink shadow-[0_20px_50px_-10px_rgba(244,161,0,0.7)]">
          ✓
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-5xl font-black uppercase leading-none text-ink [font-stretch:62%]">Upit je poslat</h3>
          <p className="font-body text-base text-muted">
            Javićemo se na vaš broj u roku od <strong>2 sata</strong> radi potvrde termina i
            detalja.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-2 text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          Pošalji novi upit
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid w-full gap-5 overflow-hidden rounded-[22px] bg-white p-5 sm:p-8"
      data-reveal-skip
    >
      <div className="flex items-end justify-between gap-4 border-b border-ink/10 pb-5">
        <div>
          <p className="font-display text-4xl font-black uppercase leading-[0.9] text-ink [font-stretch:62%] sm:text-5xl">
            Besplatan upit
          </p>
          <p className="mt-2 font-body text-sm text-muted">Odgovaramo u roku od 2 sata · Bez obaveze</p>
        </div>
        <span className="hidden shrink-0 items-center gap-2 rounded-full bg-cement px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/70 sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          Dispečer aktivan
        </span>
      </div>

      {/* Phone — primary field, full width, large */}
      <label className={labelClass}>
        <span>
          Vaš broj telefona{" "}
          <span className="text-primary">*</span>
        </span>
        <input
          required
          name="phone"
          type="tel"
          autoComplete="tel"
          className={clsx(inputClass, "py-5 text-lg font-medium")}
          placeholder="060 / 065 / 062..."
        />
        <span className="font-body text-xs normal-case tracking-normal text-ink/45">
          Pozivamo vas radi potvrde termina i detalja
        </span>
      </label>

      {/* Name + Email — secondary row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Vaše ime{" "}
          <span className="normal-case tracking-normal text-ink/35">(opciono)</span>
          <input
            name="name"
            autoComplete="name"
            className={inputClass}
            placeholder="Vaše ime i prezime"
          />
        </label>
        <label className={labelClass}>
          Email{" "}
          <span className="normal-case tracking-normal text-ink/35">(opciono)</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder="primer@email.com"
          />
        </label>
      </div>

      {/* Subject — hidden if defaultSubject is provided, shown otherwise */}
      {defaultSubject ? (
        <input type="hidden" name="subject" value={defaultSubject} />
      ) : (
        <label className={labelClass}>
          Šta vas zanima{" "}
          <span className="normal-case tracking-normal text-ink/35">(opciono)</span>
          <input
            name="subject"
            className={inputClass}
            placeholder={subjectPlaceholder || "Beton, pumpa, iskopi, behaton..."}
          />
        </label>
      )}

      {/* Type dropdown */}
      <label className={labelClass}>
        {resolvedSelectLabel}
        <select
          name="concrete_type"
          className={clsx(inputClass, "cursor-pointer")}
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

      {/* Quantity */}
      {showQuantity && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            {resolvedQuantityLabel}
            <input
              name="quantity"
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              placeholder={resolvedQuantityPlaceholder}
            />
          </label>
          <label className={labelClass}>
            {resolvedQuantityUnitLabel}
            <select
              name="quantity_unit"
              className={clsx(inputClass, "cursor-pointer")}
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

      {/* Message — short and optional */}
      <label className={labelClass}>
        Napomena{" "}
        <span className="normal-case tracking-normal text-ink/35">(opciono)</span>
        <textarea
          name="message"
          rows={3}
          className={clsx(inputClass, "resize-none")}
          placeholder="Lokacija, posebni zahtevi, vreme isporuke..."
        />
      </label>

      {/* Submit */}
      <div className="space-y-3">
        <button
          type="submit"
          disabled={state === "loading"}
          className={clsx(
            "btn-primary !min-h-[4rem] w-full !text-base",
            state === "loading" && "cursor-wait opacity-75"
          )}
        >
          {state === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Slanje...
            </span>
          ) : (
            "Pošalji besplatan upit →"
          )}
        </button>

        {/* Error */}
        {state === "error" && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="mt-0.5 shrink-0 text-red-500">⚠</span>
            <span>
              {error}{" "}
              <a href="tel:+381605887471" className="font-semibold underline">
                Pozovite nas
              </a>
              .
            </span>
          </div>
        )}

        {/* Trust signals */}
        <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink/40">
          Radimo pon–sub · Odgovaramo u roku od 2 sata · Bez obaveze
        </p>
      </div>
    </form>
  );
}
