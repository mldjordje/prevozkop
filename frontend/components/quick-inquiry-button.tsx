"use client";

import clsx from "clsx";
import { useQuickInquiry, type QuickInquiryService } from "@/components/quick-inquiry";

type QuickInquiryButtonProps = {
  service?: QuickInquiryService;
  product?: string;
  origin?: string;
  label?: string;
  className?: string;
  variant?: "solid" | "outline";
};

const variants = {
  solid:
    "bg-primary text-dark shadow-[0_8px_28px_rgba(244,161,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(244,161,0,0.42)]",
  outline: "border-2 border-primary bg-white text-dark hover:bg-primary/10",
};

export default function QuickInquiryButton({
  service = "beton",
  product,
  origin = "page",
  label = "Brzi upit",
  className,
  variant = "solid",
}: QuickInquiryButtonProps) {
  const quickInquiry = useQuickInquiry();

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        quickInquiry.open({ service, product, origin });
      }}
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition",
        variants[variant],
        className
      )}
    >
      {label}
    </button>
  );
}
