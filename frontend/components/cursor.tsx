'use client';

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/*
 * Desktop-only cursor: a precise dot plus a lagging ring. The ring swells
 * over links/buttons and turns into a "Pogledaj" disc over media marked
 * with data-cursor="view". Touch devices never see it.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<"default" | "link" | "view" | "hidden">("hidden");
  const [label, setLabel] = useState("Pogledaj");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 260, damping: 26, mass: 0.5 });
  const raf = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (hover: hover)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches || location.pathname.startsWith("/admin")) return;
    const id = requestAnimationFrame(() => setEnabled(true));
    document.documentElement.classList.add("has-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const el = e.target as HTMLElement | null;
        const view = el?.closest<HTMLElement>("[data-cursor]");
        if (view) {
          setLabel(view.dataset.cursor === "view" ? "Pogledaj" : view.dataset.cursor || "Pogledaj");
          setMode("view");
        } else if (el?.closest("a, button, summary, [role='button'], label, select")) {
          setMode("link");
        } else {
          setMode("default");
        }
      });
    };
    const leave = () => setMode("hidden");
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(id);
      cancelAnimationFrame(raf.current);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;

  const ring = {
    hidden: { width: 0, height: 0, opacity: 0 },
    default: { width: 36, height: 36, opacity: 1 },
    link: { width: 64, height: 64, opacity: 1 },
    view: { width: 104, height: 104, opacity: 1 },
  }[mode];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9600]">
      <motion.div
        className="absolute left-0 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
        style={{ x, y, opacity: mode === "hidden" || mode === "view" ? 0 : 1 }}
      />
      <motion.div className="absolute left-0 top-0" style={{ x: rx, y: ry }}>
        <motion.div
          className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
          animate={{
            ...ring,
            backgroundColor: mode === "view" ? "rgba(244,161,0,1)" : mode === "link" ? "rgba(244,161,0,0.18)" : "rgba(244,161,0,0)",
            borderColor: mode === "view" ? "rgba(244,161,0,0)" : "rgba(244,161,0,0.8)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          style={{ borderWidth: 1.5, borderStyle: "solid" }}
        >
          <motion.span
            className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink"
            animate={{ opacity: mode === "view" ? 1 : 0, scale: mode === "view" ? 1 : 0.6 }}
          >
            {label}
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  );
}
