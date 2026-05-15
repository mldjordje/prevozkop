"use client";

import { getCurrentPathWithSearch, trackEvent, trackGoogleAdsConversion } from "@/lib/tracking";

type FloatingCtaProps = {
  phone: string;
  formHref?: string;
  formLabel?: string;
  callLabel?: string;
  whatsappLabel?: string;
  message?: string;
  callNumber?: string;
  whatsappNumber?: string;
};

export default function FloatingCta({
  phone,
  formHref = "#forma",
  formLabel = "Posalji upit",
  callLabel = "Pozovi",
  whatsappLabel = "WhatsApp",
  message,
  callNumber,
  whatsappNumber,
}: FloatingCtaProps) {
  const callDigits = (callNumber || phone).replace(/\D/g, "");
  const whatsappDigits = (whatsappNumber || phone).replace(/\D/g, "");

  const googleAdsPhoneSendTo =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_PHONE_SEND_TO ||
    process.env.NEXT_PUBLIC_GADS_PHONE_SEND_TO ||
    "";
  const googleAdsWhatsappSendTo =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_SEND_TO ||
    process.env.NEXT_PUBLIC_GADS_WHATSAPP_SEND_TO ||
    "";
  const whatsappHref = `https://wa.me/${whatsappDigits}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

  function trackCta(eventName: string, sendTo?: string) {
    const sourcePage = getCurrentPathWithSearch();
    trackEvent(eventName, { location: "floating_cta_mobile", source_page: sourcePage });
    trackGoogleAdsConversion(sendTo, { source_page: sourcePage });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Safe area + backdrop */}
      <div className="border-t border-black/8 bg-white/96 px-3 pb-safe-bottom pt-2.5 shadow-[0_-8px_32px_rgba(0,0,0,0.10)] backdrop-blur-xl"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}
      >
        <div className="mx-auto flex max-w-md items-center gap-2">
          {/* PRIMARY — Form CTA */}
          <a
            href={formHref}
            onClick={() => trackCta("click_form_cta_mobile")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-dark shadow-[0_8px_28px_rgba(244,161,0,0.38)] transition-all active:scale-95"
            aria-label="Posalji upit"
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="truncate font-display uppercase tracking-wide">{formLabel}</span>
          </a>

          {/* SECONDARY — Call */}
          <a
            href={`tel:${callDigits ? `+${callDigits}` : phone}`}
            onClick={() => trackCta("click_tel_cta", googleAdsPhoneSendTo)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm font-bold text-dark shadow-sm transition-all active:scale-95"
            aria-label={`Pozovi ${phone}`}
          >
            <svg
              className="h-4 w-4 shrink-0 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="font-display uppercase tracking-wide">{callLabel}</span>
          </a>

          {/* ICON — WhatsApp */}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackCta("click_whatsapp_cta", googleAdsWhatsappSendTo)}
            className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white shadow-sm transition-all active:scale-95"
            aria-label="WhatsApp"
          >
            <svg
              className="h-5 w-5 text-[#25D366]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
