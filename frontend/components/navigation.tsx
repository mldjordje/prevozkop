'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { company } from "@/content/site";
import { useQuickInquiry } from "@/components/quick-inquiry";
import clsx from "clsx";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";

type NavLink = { href: string; label: string };

const srLinks: NavLink[] = [
  { href: "/", label: "Početna" },
  { href: "/o-nama", label: "O nama" },
  { href: "/usluge", label: "Usluge" },
  { href: "/beton", label: "Beton" },
  { href: "/behaton", label: "Behaton" },
  { href: "/projekti", label: "Projekti" },
  { href: "/projekti-video", label: "Video" },
  { href: "/kontakt", label: "Kontakt" },
];

const enLinks: NavLink[] = [
  { href: "/en", label: "Home" },
  { href: "/en/about", label: "About" },
  { href: "/en/services", label: "Services" },
  { href: "/en/projects", label: "Projects" },
  { href: "/en/contact", label: "Contact" },
];

// Pages whose first section is a full-bleed dark hero that sits under the bar.
const OVERLAY_ROUTES = new Set(["/", "/behaton"]);

const ease = [0.16, 1, 0.3, 1] as const;

export function Wordmark({ light = true }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-primary">
        <span className="font-display text-[15px] font-black leading-none text-ink [font-stretch:70%]">PK</span>
        <span className="absolute inset-x-0 bottom-0 h-[3px] bg-ink/85" />
      </span>
      <span className="leading-none">
        <span
          className={clsx(
            "block font-display text-[19px] font-black uppercase tracking-[0.01em] [font-stretch:66%]",
            light ? "text-white" : "text-ink",
          )}
        >
          Prevoz Kop
        </span>
        <span
          className={clsx(
            "mt-1 block font-mono text-[9.5px] uppercase tracking-[0.28em]",
            light ? "text-white/55" : "text-ink/55",
          )}
        >
          Betonska baza · Niš
        </span>
      </span>
    </span>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const quickInquiry = useQuickInquiry();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 40);
    setHidden(latest > 320 && latest > prev + 2);
    if (latest < prev - 2) setHidden(false);
  });

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const isEn = pathname?.startsWith("/en") ?? false;
  const links = isEn ? enLinks : srLinks;
  const normalizedPath = pathname ?? "/";
  const overlay = OVERLAY_ROUTES.has(normalizedPath);
  const isAdmin = normalizedPath.startsWith("/admin");

  const alternatePath = useMemo(() => {
    if (isEn) {
      if (normalizedPath.startsWith("/en/projects")) return "/projekti";
      if (normalizedPath.startsWith("/en/services")) return "/usluge";
      if (normalizedPath.startsWith("/en/about")) return "/o-nama";
      if (normalizedPath.startsWith("/en/contact")) return "/kontakt";
      if (normalizedPath.startsWith("/en/order-concrete")) return "/porucivanje-betona";
      return "/";
    }
    if (normalizedPath.startsWith("/projekti/")) return "/en/projects";
    if (normalizedPath.startsWith("/projekti")) return "/en/projects";
    if (normalizedPath.startsWith("/usluge")) return "/en/services";
    if (normalizedPath.startsWith("/o-nama")) return "/en/about";
    if (normalizedPath.startsWith("/kontakt")) return "/en/contact";
    if (normalizedPath.startsWith("/porucivanje-betona")) return "/en/order-concrete";
    if (normalizedPath.startsWith("/beton")) return "/en/order-concrete";
    if (normalizedPath.startsWith("/behaton")) return "/en";
    return "/en";
  }, [isEn, normalizedPath]);

  const active = useMemo(() => {
    return links.reduce<Record<string, boolean>>((map, link) => {
      map[link.href] =
        link.href === "/" || link.href === "/en"
          ? pathname === link.href
          : (pathname?.startsWith(link.href) ?? false);
      return map;
    }, {});
  }, [pathname, links]);

  const solid = scrolled || !overlay || open;

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={false}
        animate={{ y: hidden && !open ? "-110%" : "0%" }}
        transition={{ duration: 0.6, ease }}
      >
        <div
          className={clsx(
            "absolute inset-0 transition-[background-color,backdrop-filter,border-color] duration-500",
            solid
              ? "border-b border-white/[0.07] bg-ink/80 backdrop-blur-xl backdrop-saturate-150"
              : "border-b border-transparent bg-gradient-to-b from-black/50 to-transparent",
          )}
        />

        <nav className="relative mx-auto flex h-[var(--nav-h)] max-w-[1360px] items-center gap-6 px-5 sm:px-8 lg:px-12">
          <Link href={isEn ? "/en" : "/"} className="shrink-0 hover:opacity-90" aria-label="Prevoz Kop — početna">
            <Wordmark />
          </Link>

          {/* Desktop links */}
          <ul className="ml-auto hidden items-center gap-0.5 lg:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={clsx(
                    "group relative block px-3 py-2 font-body text-[13.5px] font-medium tracking-[0.01em] transition-colors",
                    active[link.href] ? "text-white" : "text-white/60 hover:text-white",
                  )}
                >
                  <span className="relative block overflow-hidden">
                    <span className="block transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:-translate-y-full">
                      {link.label}
                    </span>
                    <span
                      aria-hidden
                      className="absolute inset-0 block translate-y-full text-primary transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:translate-y-0"
                    >
                      {link.label}
                    </span>
                  </span>
                  {active[link.href] && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto hidden items-center gap-2 lg:ml-2 lg:flex">
            {isEn ? (
              <Link href="/en/order-concrete#form" className="btn-primary !min-h-[2.75rem] !px-5 !text-xs">
                Order concrete
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => quickInquiry.open({ service: "beton", origin: "nav_desktop" })}
                  className="btn-primary !min-h-[2.75rem] !px-5 !text-xs"
                >
                  <span className="xl:hidden">Beton</span>
                  <span className="hidden xl:inline">Poruči beton</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickInquiry.open({ service: "behaton", origin: "nav_desktop" })}
                  className="btn-outline-white !min-h-[2.75rem] !px-5 !text-xs"
                >
                  <span className="xl:hidden">Behaton</span>
                  <span className="hidden xl:inline">Poruči behaton</span>
                </button>
              </>
            )}
            <Link
              href={alternatePath}
              className="ml-1 grid h-11 w-11 place-items-center rounded-full border border-white/15 font-mono text-[11px] font-medium tracking-[0.1em] text-white/70 transition hover:border-primary hover:text-primary"
            >
              {isEn ? "SR" : "EN"}
            </Link>
          </div>

          {/* Mobile: call + burger */}
          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <a
              href="tel:+381605887471"
              aria-label="Pozovi"
              className="grid h-11 w-11 place-items-center rounded-full bg-primary text-ink"
            >
              <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white"
              aria-label={open ? "Zatvori meni" : "Otvori meni"}
              aria-expanded={open}
            >
              <motion.span
                initial={false}
                animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -3.5 }}
                transition={{ duration: 0.35, ease }}
                className="absolute h-[1.5px] w-[18px] rounded-full bg-white"
              />
              <motion.span
                initial={false}
                animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 3.5 }}
                transition={{ duration: 0.35, ease }}
                className="absolute h-[1.5px] w-[18px] rounded-full bg-white"
              />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-ink pt-[var(--nav-h)] text-white lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.75, ease: [0.77, 0, 0.175, 1] }}
          >
            <div className="flex flex-1 flex-col justify-between overflow-y-auto px-5 pb-8 pt-6 sm:px-8">
              <ul>
                {links.map((link, i) => (
                  <li key={link.href} className="overflow-hidden border-b border-white/[0.07]">
                    <motion.div
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.8, ease, delay: 0.25 + i * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={clsx(
                          "flex items-baseline justify-between py-3 font-display text-[2.6rem] font-black uppercase leading-[1] [font-stretch:62%]",
                          active[link.href] ? "text-primary" : "text-white",
                        )}
                      >
                        {link.label}
                        <span className="font-mono text-[11px] font-normal tracking-[0.2em] text-white/35">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>

              <motion.div
                className="mt-8 space-y-3"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease, delay: 0.55 }}
              >
                {isEn ? (
                  <Link href="/en/order-concrete#form" onClick={() => setOpen(false)} className="btn-primary w-full">
                    Order concrete
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        quickInquiry.open({ service: "beton", origin: "nav_mobile" });
                      }}
                      className="btn-primary w-full !px-3"
                    >
                      Poruči beton
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        quickInquiry.open({ service: "behaton", origin: "nav_mobile" });
                      }}
                      className="btn-outline-white w-full !px-3"
                    >
                      Poruči behaton
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                  <a href="tel:+381605887471" className="text-white">
                    {company.phone}
                  </a>
                  <Link href={alternatePath} onClick={() => setOpen(false)} className="text-white/60 hover:text-primary">
                    {isEn ? "Srpski" : "English"}
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reserve space for the fixed bar on pages without an overlay hero */}
      {!overlay && !isAdmin && <div aria-hidden className="h-[var(--nav-h)] bg-ink" />}
      {isAdmin && <div aria-hidden className="h-[var(--nav-h)]" />}
    </>
  );
}
