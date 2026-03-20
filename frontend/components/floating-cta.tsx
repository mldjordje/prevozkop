"use client";

import { getCurrentPathWithSearch, trackEvent, trackGoogleAdsConversion } from "@/lib/tracking";

type FloatingCtaProps = {
  phone: string;
  callLabel?: string;
  whatsappLabel?: string;
  message?: string;
  callNumber?: string;
  whatsappNumber?: string;
};

export default function FloatingCta({
  phone,
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
    trackEvent(eventName, {
      location: "floating_cta_mobile",
      source_page: sourcePage,
    });
    trackGoogleAdsConversion(sendTo, {
      source_page: sourcePage,
    });
  }

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 px-4 md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2 rounded-full border border-black/10 bg-white/95 p-2 shadow-2xl backdrop-blur">
        <a
          href={`tel:${callDigits ? `+${callDigits}` : phone}`}
          onClick={() => trackCta("click_tel_cta", googleAdsPhoneSendTo)}
          className="flex-1 rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-dark shadow-[0_10px_30px_rgba(244,161,0,0.35)]"
          aria-label={`Pozovi ${phone}`}
        >
          {callLabel}
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackCta("click_whatsapp_cta", googleAdsWhatsappSendTo)}
          className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-center text-sm font-semibold text-dark"
          aria-label="WhatsApp poruka"
        >
          {whatsappLabel}
        </a>
      </div>
    </div>
  );
}
