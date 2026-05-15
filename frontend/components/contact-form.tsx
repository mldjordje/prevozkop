'use client';

import { FormEvent, useRef, useState } from "react";
import clsx from "clsx";
import type { Order } from "@/lib/api";
import { getCurrentPathWithSearch, trackEvent, trackGoogleAdsConversion } from "@/lib/tracking";

type FormState = "idle" | "loading" | "success" | "error";
type ServiceTab = "beton" | "behaton";

const concreteTypes = [
  "MB 10", "MB 15", "MB 20",
  "MB 25 VODONEPROPUSTIV", "MB 30 VODONEPROPUSTIV",
  "MB 35 VODONEPROPUSTIV", "MB 40 VODONEPROPUSTIV",
  "V8 M150",
];

const behatonTypes = [
  "Holland 6cm", "Holland 8cm",
  "Roma 6cm", "Roma 8cm",
  "Kocka 10cm",
  "Trotoar 4cm", "Trotoar 6cm",
  "Ivicnjak betonski",
];

type ContactFormProps = {
  defaultSubject?: string;
  defaultServiceTab?: ServiceTab;
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
  hideServiceTabs?: boolean;
};

const inputCls =
  "block w-full rounded-xl border border-black/10 bg-gray-50/60 px-4 py-3.5 text-sm text-dark placeholder:text-faint outline-none transition-all duration-200 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20";

const labelCls = "flex flex-col gap-1.5 text-sm font-semibold text-dark";

export default function ContactForm({
  defaultSubject,
  defaultServiceTab,
  subjectPlaceholder,
  selectLabel,
  selectOptions,
  selectPlaceholder,
  defaultSelectValue,
  selectRequired,
  showQuantity = true,
  quantityLabel,
  quantityPlaceholder,
  quantityUnitLabel,
  quantityUnits,
  defaultQuantityUnit,
  hideServiceTabs = false,
}: ContactFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [serviceTab, setServiceTab] = useState<ServiceTab>(() => {
    if (defaultServiceTab) return defaultServiceTab;
    if (defaultSubject?.toLowerCase().includes("behaton")) return "behaton";
    return "beton";
  });
  const submitInFlightRef = useRef(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.prevozkop.rs/api";
  const DEFAULT_FORM_SEND_TO = "AW-17801652604/1aABCMrT9tIbEPzSvqHC";
  const GOOGLE_ADS_FORM_SEND_TO =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_FORM_SEND_TO ||
    process.env.NEXT_PUBLIC_GOOGLE_ADS_SEND_TO ||
    process.env.NEXT_PUBLIC_GADS_FORM_SEND_TO ||
    process.env.NEXT_PUBLIC_GADS_SEND_TO ||
    DEFAULT_FORM_SEND_TO;

  const isBeton = serviceTab === "beton";
  const concreteSet = new Set(concreteTypes.map((t) => t.toLowerCase()));

  // Resolve options based on tab or explicit props
  const resolvedSelectOptions = selectOptions ?? (isBeton ? concreteTypes : behatonTypes);
  const resolvedSelectLabel = selectLabel ?? (isBeton ? "Vrsta betona (opciono)" : "Model behatona (opciono)");
  const resolvedSelectPlaceholder = selectPlaceholder ?? (isBeton ? "Izaberite vrstu betona" : "Izaberite model behatona");
  const resolvedQuantityLabel = quantityLabel ?? "Kolicina (opciono)";
  const resolvedQuantityPlaceholder = quantityPlaceholder ?? (isBeton ? "npr. 10" : "npr. 50");
  const resolvedQuantityUnitLabel = quantityUnitLabel ?? "Jedinica";
  const resolvedQuantityUnits = quantityUnits ?? (isBeton ? ["m3"] : ["m2", "m3", "kom", "paleta"]);
  const resolvedDefaultUnit = defaultQuantityUnit ?? (isBeton ? "m3" : "m2");

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

    // Build subject from tab + defaultSubject
    const baseSubject = defaultSubject || (isBeton ? "Isporuka betona - upit" : "Behaton - upit");
    const currentPath = getCurrentPathWithSearch();
    const citySlug = detectCitySlug(currentPath);
    const currentSearch =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

    const payload: Partial<Order> = {
      name: (data.get("name") as string) || "",
      email: (data.get("email") as string) || "",
      phone: (data.get("phone") as string) || "",
      subject: baseSubject,
      concrete_type: selectedType,
      service_type: serviceTab,
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
        lead_type: serviceTab,
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
      setError("Server privremeno nije dostupan.");
    } finally {
      submitInFlightRef.current = false;
    }
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-green-100 bg-green-50 px-6 py-14 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-lg">
          ✓
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-bold text-dark">Upit je primljen!</h3>
          <p className="text-sm text-muted">
            Javicemo se na vas broj u roku od{" "}
            <strong className="text-dark">2 sata</strong> radi potvrde termina.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-1 text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          Posalji novi upit
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid w-full gap-5 rounded-2xl border border-black/6 bg-white p-5 shadow-[0_4px_32px_rgba(0,0,0,0.06)] sm:p-7"
    >
      {/* Header */}
      <div className="border-l-[3px] border-primary pl-4">
        <p className="font-display text-xl font-bold text-dark">Posaljite besplatan upit</p>
        <p className="mt-0.5 text-xs text-faint">Odgovaramo u roku od 2 sata · Bez obaveze</p>
      </div>

      {/* ── Service type tabs ── */}
      {!hideServiceTabs && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-dark">Sta vas zanima?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setServiceTab("beton")}
              className={clsx(
                "flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-center transition-all duration-200",
                isBeton
                  ? "border-primary bg-primary/8 text-dark shadow-[0_0_0_2px_rgba(244,161,0,0.15)]"
                  : "border-black/8 bg-gray-50 text-muted hover:border-primary/40 hover:bg-primary/4"
              )}
            >
              <span className="text-xl">🏗️</span>
              <span className="font-display text-sm font-bold leading-tight">Beton / Pumpa</span>
              <span className="text-xs font-normal text-faint">isporuka, mikseri</span>
            </button>
            <button
              type="button"
              onClick={() => setServiceTab("behaton")}
              className={clsx(
                "flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-center transition-all duration-200",
                !isBeton
                  ? "border-primary bg-primary/8 text-dark shadow-[0_0_0_2px_rgba(244,161,0,0.15)]"
                  : "border-black/8 bg-gray-50 text-muted hover:border-primary/40 hover:bg-primary/4"
              )}
            >
              <span className="text-xl">🧱</span>
              <span className="font-display text-sm font-bold leading-tight">Behaton</span>
              <span className="text-xs font-normal text-faint">poplocavanje, trotoir</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Phone — required, full width ── */}
      <label className={labelCls}>
        <span className="flex items-center gap-1.5">
          Vas broj telefona
          <span className="text-primary">*</span>
        </span>
        <input
          required
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          className={clsx(inputCls, "text-base font-medium")}
          placeholder="060 / 065 / 062..."
        />
        <span className="text-xs font-normal text-faint">
          Pozivamo vas radi potvrde i detalja
        </span>
      </label>

      {/* ── Name + Email ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          Vase ime{" "}
          <span className="font-normal text-faint">(opciono)</span>
          <input name="name" autoComplete="name" className={inputCls} placeholder="Ime i prezime" />
        </label>
        <label className={labelCls}>
          Email{" "}
          <span className="font-normal text-faint">(opciono)</span>
          <input name="email" type="email" autoComplete="email" className={inputCls} placeholder="primer@email.com" />
        </label>
      </div>

      {/* ── Type dropdown ── */}
      <label className={labelCls}>
        {resolvedSelectLabel}
        <select
          name="concrete_type"
          className={clsx(inputCls, "cursor-pointer")}
          defaultValue={defaultSelectValue ?? ""}
          required={selectRequired}
          key={serviceTab}
        >
          <option value="">{resolvedSelectPlaceholder}</option>
          {resolvedSelectOptions.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </label>

      {/* ── Quantity + Unit ── */}
      {showQuantity && (
        <div className="grid grid-cols-2 gap-4">
          <label className={labelCls}>
            {resolvedQuantityLabel}
            <input
              name="quantity"
              type="number"
              min="0"
              step="0.1"
              className={inputCls}
              placeholder={resolvedQuantityPlaceholder}
            />
          </label>
          <label className={labelCls}>
            {resolvedQuantityUnitLabel}
            <select
              name="quantity_unit"
              className={clsx(inputCls, "cursor-pointer")}
              defaultValue={resolvedDefaultUnit}
              key={`unit-${serviceTab}`}
            >
              <option value="">Jedinica</option>
              {resolvedQuantityUnits.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* ── Message ── */}
      <label className={labelCls}>
        Napomena{" "}
        <span className="font-normal text-faint">(opciono)</span>
        <textarea
          name="message"
          rows={3}
          className={clsx(inputCls, "resize-none")}
          placeholder="Lokacija, posebni zahtevi, termin isporuke..."
        />
      </label>

      {/* ── Submit ── */}
      <div className="space-y-3">
        <button
          type="submit"
          disabled={state === "loading"}
          className={clsx(
            "flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4",
            "font-display text-[15px] font-bold uppercase tracking-[0.08em] text-dark",
            "shadow-[0_8px_28px_rgba(244,161,0,0.3)] transition-all duration-300",
            "hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(244,161,0,0.42)]",
            "active:translate-y-0 active:shadow-[0_4px_16px_rgba(244,161,0,0.25)]",
            state === "loading" && "cursor-wait opacity-70"
          )}
        >
          {state === "loading" ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Slanje...
            </>
          ) : (
            <>
              Posalji besplatan upit
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        {state === "error" && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="shrink-0">⚠</span>
            <span>
              {error}{" "}
              <a href="tel:+381605887471" className="font-semibold underline">
                Pozovite nas
              </a>
              .
            </span>
          </div>
        )}

        <p className="text-center text-xs text-faint">
          Radimo pon–sub · Odgovaramo u roku od 2 sata · Bez obaveze
        </p>
      </div>
    </form>
  );
}
