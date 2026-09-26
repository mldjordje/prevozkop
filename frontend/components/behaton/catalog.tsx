'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useQuickInquiry } from "@/components/quick-inquiry";
import type { CatalogItem } from "@/components/behaton/catalog-utils";

const ease = [0.16, 1, 0.3, 1] as const;

export default function BehatonCatalog({ items }: { items: CatalogItem[] }) {
  const quickInquiry = useQuickInquiry();
  const thicknesses = useMemo(
    () =>
      Array.from(new Set(items.map((i) => i.thickness).filter((t): t is number => t !== null))).sort(
        (a, b) => a - b,
      ),
    [items],
  );
  const [filter, setFilter] = useState<number | "all">("all");
  const visible = filter === "all" ? items : items.filter((i) => i.thickness === filter);

  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/10 p-10 text-center text-white/70">
        Katalog se trenutno ažurira. Pozovite nas za preporuku modela:{" "}
        <a href="tel:+381605887471" className="text-primary">
          +381 60 588 7471
        </a>
      </div>
    );
  }

  return (
    <div data-reveal-skip>
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2 sm:mb-8">
        <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">Debljina</span>
        {(["all", ...thicknesses] as const).map((t) => {
          const selected = filter === t;
          return (
            <button
              key={String(t)}
              type="button"
              onClick={() => setFilter(t)}
              className={clsx(
                "relative rounded-full px-4 py-2 font-mono text-[12px] uppercase tracking-[0.12em] transition-colors",
                selected ? "text-ink" : "text-white/70 hover:text-white",
              )}
            >
              {selected && (
                <motion.span
                  layoutId="catalog-filter"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">
                {t === "all" ? `Svi · ${items.length}` : `${t} cm`}
              </span>
            </button>
          );
        })}
      </div>

      <motion.ul layout className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {visible.map((item, i) => (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.9, ease, delay: (i % 4) * 0.07 }}
            >
              <Link
                href={`/behaton/${item.slug}`}
                data-cursor="view"
                className="group relative block overflow-hidden rounded-[18px] bg-[#1d1c19] sm:rounded-[24px]"
                aria-label={`${item.name} — detalji`}
              >
                <div
                  className={clsx(
                    "relative aspect-[3/4] overflow-hidden",
                    item.isPackshot && "bg-white",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    loading={i < 4 ? "eager" : "lazy"}
                    className={clsx(
                      "h-full w-full transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.07]",
                      item.isPackshot ? "object-contain" : "object-cover",
                    )}
                  />
                  {!item.isPackshot && (
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/5 to-transparent" />
                  )}

                  <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/85 backdrop-blur sm:left-4 sm:top-4">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.thickness && (
                    <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink sm:right-4 sm:top-4">
                      {item.thickness} cm
                    </span>
                  )}
                </div>

                <div className="flex items-end justify-between gap-3 p-3.5 sm:p-5">
                  <div className="min-w-0">
                    <h3 className="font-display text-[1.35rem] font-black uppercase leading-[0.92] text-white [font-stretch:62%] sm:text-[1.9rem]">
                      {item.model}
                    </h3>
                    <p className="mt-1.5 truncate font-mono text-[10.5px] uppercase tracking-[0.1em] text-white/50 sm:text-[11px]">
                      {item.spec}
                    </p>
                  </div>
                  <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 text-white transition-all duration-500 group-hover:rotate-[-45deg] group-hover:border-primary group-hover:bg-primary group-hover:text-ink sm:grid">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => quickInquiry.open({ service: "behaton", product: item.name, origin: "behaton_product_card" })}
                className="mt-2 w-full rounded-full border border-white/12 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/70 transition-colors hover:border-primary hover:bg-primary hover:text-ink"
              >
                Brzi upit
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
