"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import type { Order } from "@/lib/api";
import { getCurrentPathWithSearch, trackEvent, trackGoogleAdsConversion } from "@/lib/tracking";

export type QuickInquiryService = "beton" | "behaton" | "pumpa" | "iskop";

type ServiceOption = {
  id: QuickInquiryService;
  label: string;
  subject: string;
  serviceType: "beton" | "behaton" | "other";
};

const services: ServiceOption[] = [
  { id: "beton", label: "Beton", subject: "Upit za beton", serviceType: "beton" },
  { id: "behaton", label: "Behaton", subject: "Upit za behaton", serviceType: "behaton" },
  { id: "pumpa", label: "Pumpa za beton", subject: "Upit za pumpu za beton", serviceType: "beton" },
  {
    id: "iskop",
    label: "Iskop i zemljani radovi",
    subject: "Upit za zemljane radove",
    serviceType: "other",
  },
];

export type QuickInquiryOptions = {
  /** Pretpodesena usluga - cip je vec izabran kad se modal otvori. */
  service?: QuickInquiryService;
  /** Konkretan model behatona ili klasa betona. */
  product?: string;
  /** Odakle je modal otvoren - ide u analitiku. */
  origin?: string;
};

type QuickInquiryContextValue = {
  open: (options?: QuickInquiryOptions) => void;
  close: () => void;
};

const QuickInquiryContext = createContext<QuickInquiryContextValue | null>(null);

export function useQuickInquiry() {
  const ctx = useContext(QuickInquiryContext);
  if (!ctx) {
    throw new Error("useQuickInquiry must be used inside <QuickInquiryProvider>");
  }
  return ctx;
}

type FormState = "idle" | "loading" | "success" | "error";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.prevozkop.rs/api";
const DEFAULT_FORM_SEND_TO = "AW-17801652604/1aABCMrT9tIbEPzSvqHC";

function detectCitySlug(path: string | null): string | null {
  if (!path) return null;
  const match = path.match(/^\/(?:behaton|beton)\/grad\/([^/?#]+)/);
  return match?.[1] || null;
}

export function QuickInquiryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<QuickInquiryOptions>({});
  const [service, setService] = useState<QuickInquiryService>("beton");
  const [showDetails, setShowDetails] = useState(false);
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const submitInFlightRef = useRef(false);
  const phoneRef = useRef<HTMLInputElement>(null);

  const open = useCallback((next: QuickInquiryOptions = {}) => {
    setOptions(next);
    setService(next.service ?? "beton");
    setShowDetails(false);
    setState("idle");
    setError(null);
    setIsOpen(true);
    trackEvent("quick_inquiry_open", {
      origin: next.origin || "unknown",
      service: next.service || "beton",
      source_page: getCurrentPathWithSearch(),
    });
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => phoneRef.current?.focus(), 120);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, close]);

  const value = useMemo<QuickInquiryContextValue>(() => ({ open, close }), [open, close]);

  const activeService = services.find((item) => item.id === service) ?? services[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitInFlightRef.current) return;
    submitInFlightRef.current = true;
    setState("loading");
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPath = getCurrentPathWithSearch();
    const search =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

    const note = (data.get("message") as string) || "";
    const messageLines: string[] = [];
    if (options.product) messageLines.push(`Model: ${options.product}`);
    if (note) messageLines.push(note);

    const payload: Partial<Order> = {
      name: (data.get("name") as string) || "",
      email: "",
      phone: (data.get("phone") as string) || "",
      subject: options.product
        ? `${activeService.subject} - ${options.product}`
        : activeService.subject,
      concrete_type: options.product || "",
      service_type: activeService.serviceType,
      quantity: null,
      quantity_unit: null,
      city_slug: detectCitySlug(currentPath),
      source_page: currentPath || "/",
      utm_source: search?.get("utm_source") || null,
      utm_medium: search?.get("utm_medium") || null,
      utm_campaign: search?.get("utm_campaign") || null,
      message: messageLines.join("\n"),
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
        lead_type: activeService.serviceType,
        form_type: "quick_inquiry",
        origin: options.origin || "unknown",
        source_page: currentPath,
      });
      trackGoogleAdsConversion(
        process.env.NEXT_PUBLIC_GOOGLE_ADS_FORM_SEND_TO ||
          process.env.NEXT_PUBLIC_GOOGLE_ADS_SEND_TO ||
          DEFAULT_FORM_SEND_TO,
        { transaction_id: response.id ? `order-${response.id}` : undefined }
      );

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

  return (
    <QuickInquiryContext.Provider value={value}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              className="absolute inset-0 bg-ink/70 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Brzi upit"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              data-lenis-prevent
              className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-ink text-white shadow-[0_40px_120px_rgba(0,0,0,0.5)] ring-1 ring-white/10 sm:rounded-[28px]"
            >
              <button
                type="button"
                onClick={close}
                aria-label="Zatvori"
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:rotate-90 hover:border-primary hover:text-primary"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              {state === "success" ? (
                <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-primary text-4xl text-ink shadow-[0_20px_50px_-10px_rgba(244,161,0,0.7)]">
                    &#10003;
                  </div>
                  <h3 className="font-display text-5xl font-black uppercase leading-none [font-stretch:62%]">Upit je poslat</h3>
                  <p className="text-sm text-white/60">
                    Javićemo se na vaš broj u roku od <strong>2 sata</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="btn-primary mt-2"
                  >
                    Zatvori
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-5 px-5 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-9">
                  <div>
                    <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-white/50">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                      Dispečer je na vezi
                    </p>
                    <p className="mt-3 font-display text-6xl font-black uppercase leading-[0.85] [font-stretch:62%]">
                      Brzi <span className="text-primary">upit</span>
                    </p>
                    <p className="mt-3 text-sm text-white/60">
                      Ostavite broj &mdash; zovemo vas u roku od 2 sata. Bez obaveze.
                    </p>
                  </div>

                  {options.product && (
                    <div className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 font-mono text-[12px] uppercase tracking-[0.1em] text-primary">
                      {options.product}
                    </div>
                  )}

                  <div className="grid gap-2">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/50">
                      Šta vam treba?
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {services.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setService(item.id)}
                          aria-pressed={service === item.id}
                          className={clsx(
                            "rounded-full border px-4 py-2 font-body text-sm font-semibold transition",
                            service === item.id
                              ? "border-primary bg-primary text-ink"
                              : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex flex-col gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/50">
                    <span>
                      Vaš broj telefona <span className="text-primary">*</span>
                    </span>
                    <input
                      ref={phoneRef}
                      required
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="060 / 065 / 062..."
                      className="block w-full rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-5 font-body text-xl font-medium normal-case tracking-normal text-white placeholder:text-white/25 outline-none transition focus:border-primary focus:bg-white/[0.09] focus:shadow-[0_0_0_4px_rgba(244,161,0,0.2)]"
                    />
                  </label>

                  {showDetails ? (
                    <div className="grid gap-4">
                      <label className="flex flex-col gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/50">
                        <span>
                          Vaše ime <span className="normal-case tracking-normal text-white/30">(opciono)</span>
                        </span>
                        <input
                          name="name"
                          autoComplete="name"
                          placeholder="Vaše ime i prezime"
                          className="block w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 font-body text-sm normal-case tracking-normal text-white placeholder:text-white/25 outline-none transition focus:border-primary"
                        />
                      </label>
                      <label className="flex flex-col gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/50">
                        <span>
                          Napomena <span className="normal-case tracking-normal text-white/30">(opciono)</span>
                        </span>
                        <textarea
                          name="message"
                          rows={3}
                          placeholder="Lokacija, količina, rok isporuke..."
                          className="block w-full resize-none rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 font-body text-sm normal-case tracking-normal text-white placeholder:text-white/25 outline-none transition focus:border-primary"
                        />
                      </label>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDetails(true)}
                      className="justify-self-start font-mono text-[11px] uppercase tracking-[0.16em] text-primary hover:text-white"
                    >
                      + Dodaj ime i napomenu (opciono)
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className={clsx(
                      "btn-primary !min-h-[4rem] w-full !text-base before:!bg-white",
                      state === "loading" && "cursor-wait opacity-75"
                    )}
                  >
                    {state === "loading" ? "Slanje..." : "Pošalji upit"}
                  </button>

                  {state === "error" && (
                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}{" "}
                      <a href="tel:+381605887471" className="font-semibold underline">
                        Pozovite nas
                      </a>
                      .
                    </div>
                  )}

                  <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/40">
                    Ili nas pozovite:{" "}
                    <a href="tel:+381605887471" className="text-white hover:text-primary">
                      060 588 7471
                    </a>{" "}
                    &middot; Pon&ndash;Sub 08:00&ndash;20:00
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </QuickInquiryContext.Provider>
  );
}
