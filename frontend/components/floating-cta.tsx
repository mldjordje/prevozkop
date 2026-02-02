type FloatingCtaProps = {
  phone: string;
  callLabel?: string;
  whatsappLabel?: string;
  message?: string;
};

export default function FloatingCta({
  phone,
  callLabel = "Pozovi",
  whatsappLabel = "WhatsApp",
  message,
}: FloatingCtaProps) {
  const phoneDigits = phone.replace(/\D/g, "");
  const whatsappHref = `https://wa.me/${phoneDigits}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 px-4 md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2 rounded-full border border-black/10 bg-white/95 p-2 shadow-2xl backdrop-blur">
        <a
          href={`tel:${phoneDigits ? `+${phoneDigits}` : phone}`}
          className="flex-1 rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-dark shadow-[0_10px_30px_rgba(244,161,0,0.35)]"
          aria-label={`Pozovi ${phone}`}
        >
          {callLabel}
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-center text-sm font-semibold text-dark"
          aria-label="WhatsApp poruka"
        >
          {whatsappLabel}
        </a>
      </div>
    </div>
  );
}
