'use client';

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

/*
 * Route transition. Next re-mounts a template on every navigation, so each
 * new page enters behind an ink curtain that names the destination and then
 * lifts. The first load is skipped — the preloader owns that moment.
 */

const NAMES: [RegExp, string][] = [
  [/^\/$/, "Početna"],
  [/^\/behaton\/grad\//, "Behaton lokalno"],
  [/^\/behaton\/.+/, "Model behatona"],
  [/^\/behaton/, "Behaton"],
  [/^\/beton\/grad\//, "Beton lokalno"],
  [/^\/beton/, "Beton"],
  [/^\/porucivanje-betona/, "Poručivanje"],
  [/^\/usluge/, "Usluge"],
  [/^\/o-nama/, "O nama"],
  [/^\/projekti-video/, "Video"],
  [/^\/projekti/, "Projekti"],
  [/^\/kontakt/, "Kontakt"],
  [/^\/en/, "Prevoz Kop"],
];

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  // Only animate navigations that happen after the first paint.
  const [play] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("pk-ready") &&
      !pathname.startsWith("/admin") &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const name = NAMES.find(([re]) => re.test(pathname))?.[1] ?? "Prevoz Kop";

  return (
    <>
      {play && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[9400] flex items-end bg-ink px-5 pb-10 sm:px-12 sm:pb-14"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          animate={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: [0.77, 0, 0.175, 1], delay: 0.35 }}
        >
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1 origin-left bg-primary"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.span
            className="display-xl text-[16vw] text-white sm:text-[10vw]"
            initial={{ y: "40%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {name}
            <span className="text-primary">.</span>
          </motion.span>
        </motion.div>
      )}
      {children}
    </>
  );
}
