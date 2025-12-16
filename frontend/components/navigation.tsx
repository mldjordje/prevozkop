'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { company } from "@/content/site";
import clsx from "clsx";

type NavLink = {
  href: string;
  label: string;
};

const links: NavLink[] = [
  { href: "/", label: "Pocetna" },
  { href: "/o-nama", label: "O nama" },
  { href: "/usluge", label: "Usluge" },
  { href: "/projekti", label: "Projekti" },
  { href: "/projekti-video", label: "Video" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const active = useMemo(() => {
    return links.reduce<Record<string, boolean>>((map, link) => {
      map[link.href] = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href) ?? false;
      return map;
    }, {});
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <img src="/img/logo.png" alt="Prevoz Kop" className="h-11 w-auto" />
          <div className="hidden sm:block">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">{company.tagline}</p>
            <p className="text-sm font-semibold text-dark">{company.name}</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-black/10 px-3 py-2 text-sm font-semibold text-dark sm:hidden"
          aria-label="Toggle navigation"
        >
          {open ? "Zatvori" : "Meni"}
        </button>

        <div
          className={clsx(
            "flex flex-1 items-center justify-end gap-3 sm:gap-6",
            "sm:static",
            open
              ? "absolute left-4 right-4 top-full flex-col rounded-2xl border border-black/5 bg-white p-4 shadow-xl sm:flex-row sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none"
              : "hidden sm:flex"
          )}
        >
          <ul className="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-5">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "text-sm font-semibold transition-colors",
                    active[link.href] ? "text-dark" : "text-gray-600 hover:text-dark"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/porucivanje-betona#forma"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-dark shadow-[0_10px_40px_rgba(244,161,0,0.3)] transition hover:translate-y-[-2px]"
          >
            Poruci beton
          </Link>
        </div>
      </nav>
    </header>
  );
}
