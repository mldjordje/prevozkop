'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { company } from "@/content/site";
import clsx from "clsx";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";

type NavLink = { href: string; label: string };

const srLinks: NavLink[] = [
  { href: "/", label: "Početna" },
  { href: "/o-nama", label: "O nama" },
  { href: "/usluge", label: "Usluge" },
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

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 48);
  });

  const isEn = pathname?.startsWith("/en") ?? false;
  const links = isEn ? enLinks : srLinks;
  const normalizedPath = pathname ?? "/";

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
    if (normalizedPath.startsWith("/behaton")) return "/en";
    return "/en";
  }, [isEn, normalizedPath]);

  const active = useMemo(() => {
    return links.reduce<Record<string, boolean>>((map, link) => {
      map[link.href] =
        link.href === "/" ? pathname === "/" : (pathname?.startsWith(link.href) ?? false);
      return map;
    }, {});
  }, [pathname, links]);

  return (
    <motion.header
      className={clsx(
        "sticky top-0 z-40 transition-[background,border-color,box-shadow] duration-500"
      )}
      animate={
        scrolled
          ? { backgroundColor: "rgba(255,255,255,0.94)", borderBottomColor: "rgba(0,0,0,0.06)" }
          : { backgroundColor: "rgba(255,255,255,0.75)", borderBottomColor: "rgba(0,0,0,0.04)" }
      }
      style={{ borderBottomWidth: 1, borderBottomStyle: "solid", backdropFilter: "blur(20px)" }}
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] origin-left bg-primary"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={scrolled ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />

      <nav className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3 group">
          <img src="/img/logo.webp" alt="Prevoz Kop" className="h-11 w-auto" />
          <div className="hidden sm:block">
            <p className="font-body text-xs uppercase tracking-[0.22em] text-primary">
              {company.tagline}
            </p>
            <p className="font-display text-sm font-bold text-dark">{company.name}</p>
          </div>
        </Link>

        <div className="ml-auto flex flex-1 items-center justify-end gap-3 sm:gap-5">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/8 bg-white/90 text-dark shadow-sm transition hover:border-primary/30 sm:hidden"
            aria-label="Toggle navigation"
          >
            <motion.span
              initial={false}
              animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute h-[1.5px] w-5 rounded-full bg-dark"
            />
            <motion.span
              initial={false}
              animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute h-[1.5px] w-5 rounded-full bg-dark"
            />
            <motion.span
              initial={false}
              animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute h-[1.5px] w-5 rounded-full bg-dark"
            />
          </button>

          {/* Desktop nav */}
          <div className="hidden items-center gap-5 sm:flex">
            <ul className="flex items-center gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={clsx(
                      "relative block rounded-lg px-3 py-2 font-body text-sm font-semibold transition-colors duration-200",
                      active[link.href]
                        ? "text-dark"
                        : "text-muted hover:text-dark"
                    )}
                  >
                    {link.label}
                    {active[link.href] && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg bg-primary/10"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href={isEn ? "/en/order-concrete#form" : "/porucivanje-betona#forma"}
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-dark shadow-[0_8px_28px_rgba(244,161,0,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(244,161,0,0.42)]"
            >
              {isEn ? "Order concrete" : "Poruči beton"}
            </Link>

            <Link
              href={alternatePath}
              onClick={() => setOpen(false)}
              className="font-body text-xs font-bold uppercase tracking-[0.2em] text-faint transition hover:text-primary"
            >
              {isEn ? "SR" : "EN"}
            </Link>
          </div>

          {/* Mobile menu panel */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-3 right-3 top-full mt-1 overflow-hidden rounded-2xl border border-black/6 bg-white/97 shadow-[0_16px_64px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:hidden"
              >
                {/* Tagline strip */}
                <div className="border-b border-black/5 bg-primary/5 px-5 py-3">
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {company.tagline}
                  </p>
                </div>

                <div className="p-3">
                  <ul className="space-y-0.5">
                    {links.map((link, i) => (
                      <motion.li
                        key={link.href}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.28, delay: 0.04 * i }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={clsx(
                            "block rounded-xl px-4 py-3 font-body text-sm font-semibold transition",
                            active[link.href]
                              ? "bg-primary/10 text-dark"
                              : "text-muted hover:bg-gray-50 hover:text-dark"
                          )}
                        >
                          {link.label}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.div
                    className="mt-3 flex flex-col gap-2 border-t border-black/5 pt-3"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: 0.18 }}
                  >
                    <Link
                      href={isEn ? "/en/order-concrete#form" : "/porucivanje-betona#forma"}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center rounded-xl bg-primary px-5 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-dark shadow-[0_8px_28px_rgba(244,161,0,0.32)]"
                    >
                      {isEn ? "Order concrete" : "Poruči beton"}
                    </Link>
                    <div className="flex gap-2">
                      <a
                        href="tel:+381605887471"
                        onClick={() => setOpen(false)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/8 bg-white px-4 py-3 font-body text-sm font-semibold text-dark"
                      >
                        <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Pozovi
                      </a>
                      <Link
                        href={alternatePath}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center rounded-xl border border-black/8 bg-white px-4 py-3 font-body text-xs font-bold uppercase tracking-[0.18em] text-faint hover:border-primary hover:text-primary"
                      >
                        {isEn ? "SR" : "EN"}
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </motion.header>
  );
}
