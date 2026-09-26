"use client";

import { type ElementType, Fragment, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { onPageReady } from "@/lib/page-ready";

type Line = string | { text: string; className?: string };

type Props = {
  /** Each entry renders as its own masked line. A plain string is split on "\n". */
  lines: Line[] | string;
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  /** "ready": play when the preloader lifts (heroes). "view": play on scroll into view. */
  trigger?: "ready" | "view";
  delay?: number;
  stagger?: number;
  id?: string;
  /** When set, the parent controls visibility (e.g. scroll-driven heroes). */
  active?: boolean;
};

/*
 * Word-level mask reveal: each word slides up from behind its line's clip.
 * The full text is in the server HTML; motion is pure CSS transitions.
 */
export default function SplitText({
  lines,
  as: Tag = "h2",
  className,
  lineClassName,
  trigger = "view",
  delay = 0,
  stagger = 0.06,
  id,
  active,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  const normalized: { text: string; className?: string }[] = (
    typeof lines === "string" ? lines.split("\n") : lines
  ).map((line) => (typeof line === "string" ? { text: line } : line));

  useEffect(() => {
    const el = ref.current;
    if (!el || active !== undefined) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    if (trigger === "ready") return onPageReady(() => setShown(true));

    let stopReady = () => {};
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        stopReady = onPageReady(() => setShown(true));
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stopReady();
    };
  }, [trigger, active]);

  const visible = active ?? shown;

  let wordIndex = 0;

  return (
    <Tag
      ref={ref}
      id={id}
      data-reveal-skip
      className={clsx("split-text", visible && "is-shown", className)}
    >
      {normalized.map((line, li) => (
        <span key={li} className={clsx("split-line", lineClassName, line.className)}>
          {line.text.split(" ").map((word, wi, arr) => {
            const d = delay + wordIndex++ * stagger;
            return (
              <Fragment key={wi}>
                <span className="split-mask">
                  <span className="split-word" style={{ transitionDelay: `${d}s` }}>
                    {word}
                  </span>
                </span>
                {wi < arr.length - 1 ? " " : null}
              </Fragment>
            );
          })}
          {li < normalized.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
