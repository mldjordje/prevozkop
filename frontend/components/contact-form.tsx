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
  "block w-full min-w-0 rounded-xl border border-[rgba(15,14,12,0.12)] bg-white px-4 py-3.5 text-sm text-dark placeholder:text-faint outline-none transition-all duration-200 focus:border-primary focus:ring-3 focus:ring-primary/15 focus:shadow-[0_0_0_3px_rgba(244,161,0,0.12)]";

const labelClass = "flex min-w-0 flex-col gap-1.5 text-sm font-semibold text-dark font-body";

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
  const resolvedQuantityLabel = quantityLabel || "Kolicina (opciono)";
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
    if (quantity) detailLines.push(`Kolicina: ${quantity}${quantityUnit ? ` ${quantityUnit}` : ""}`);
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
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-green-200 bg-green-50 px-6 py-12 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-bold text-dark">Upit je poslat!</h3>
          <p className="text-sm text-muted">
            Javicemo se na vas broj u roku od <strong>2 sata</strong> radi potvrde termina i
            detalja.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-2 text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          Posalji novi upit
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid w-full gap-5 overflow-hidden rounded-2xl border border-[rgba(15,14,12,0.07)] bg-white p-5 shadow-[0_8px_48px_rgba(0,0,0,0.07)] sm:p-8"
    >
      {/* Gold accent header */}
      <div className="flex items-start gap-3 border-l-4 border-primary pl-4">
        <div>
          <p className="font-display text-xl font-bold leading-tight text-dark sm:text-2xl">
            Posaljite besplatan upit
          </p>
          <p className="mt-0.5 text-sm text-muted">Odgovaramo u roku od 2 sata · Bez obaveze</p>
        </div>
      </div>

      {/* Phone — primary field, full width, large */}
      <label className={labelClass}>
        <span>
          Vas broj telefona{" "}
          <span className="font-normal text-primary">*</span>
        </span>
        <input
          required
          name="phone"
          type="tel"
          autoComplete="tel"
          className={clsx(inputClass, "text-base font-medium")}
          placeholder="060 / 065 / 062..."
        />
        <span className="text-xs font-normal text-faint">
          Pozivamo vas radi potvrde termina i detalja
        </span>
      </label>

      {/* Name + Email — secondary row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Vase ime{" "}
          <span className="font-normal text-faint">(opciono)</span>
          <input
            name="name"
            autoComplete="name"
            className={inputClass}
            placeholder="Vase ime i prezime"
          />
        </label>
        <label className={labelClass}>
          Email{" "}
          <span className="font-normal text-faint">(opciono)</span>
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
          Sta vas zanima{" "}
          <span className="font-normal text-faint">(opciono)</span>
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
        <span className="font-normal text-faint">(opciono)</span>
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
            "relative w-full overflow-hidden rounded-xl px-6 py-4 text-center font-display text-base font-bold uppercase tracking-wider text-dark transition-all duration-300",
            "bg-primary shadow-[0_12px_40px_rgba(244,161,0,0.35)]",
            "hover:shadow-[0_20px_60px_rgba(244,161,0,0.45)] hover:-translate-y-0.5",
            "active:translate-y-0 active:shadow-[0_8px_24px_rgba(244,161,0,0.3)]",
            state === "loading" && "opacity-75 cursor-wait"
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
            "Posalji besplatan upit →"
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
        <p className="text-center text-xs text-faint">
          Radimo pon–sub · Odgovaramo u roku od 2 sata · Bez obaveze
        </p>
      </div>
    </form>
  );
}
