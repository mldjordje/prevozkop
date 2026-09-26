"use client";

import { type ReactNode, useRef } from "react";
import Image from "next/image";
import clsx from "clsx";
import {
  type MotionValue,
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useAnimationFrame,
  useMotionValue,
} from "framer-motion";

/* ── Parallax image: drifts inside its frame and un-clips on entry ───────── */

type ParallaxImageProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  strength?: number;
  unoptimized?: boolean;
  children?: ReactNode;
};

export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  sizes = "100vw",
  priority,
  strength = 12,
  unoptimized,
  children,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start 0.55"] });
  const clip = useTransform(enter, [0, 1], ["inset(14% 8% 14% 8% round 28px)", "inset(0% 0% 0% 0% round 0px)"]);
  const scale = useTransform(enter, [0, 1], [1.25, 1.08]);

  return (
    <motion.div ref={ref} className={clsx("relative overflow-hidden", className)} style={{ clipPath: clip }} data-reveal-skip>
      <motion.div className="absolute inset-[-14%_0]" style={{ y, scale }}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={unoptimized}
          className={clsx("object-cover", imgClassName)}
        />
      </motion.div>
      {children}
    </motion.div>
  );
}

/* ── Scroll-fill paragraph: words light up as the reader scrolls past ───── */

function FillWord({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <motion.span className="inline-block" style={{ opacity, y }}>
      {word}
    </motion.span>
  );
}

export function ScrollFillText({
  text,
  className,
  as: Tag = "p",
}: {
  text: string;
  className?: string;
  as?: "p" | "h2" | "h3";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  const MotionTag = motion[Tag];

  return (
    <div ref={ref} data-reveal-skip>
      <MotionTag className={className}>
        {words.map((word, i) => {
          const start = i / words.length;
          const end = Math.min(1, start + 1.6 / words.length);
          return (
            <span key={i}>
              <FillWord word={word} progress={scrollYProgress} range={[start, end]} />
              {i < words.length - 1 ? " " : null}
            </span>
          );
        })}
      </MotionTag>
    </div>
  );
}

/* ── Velocity marquee: endless band that speeds/flips with scroll ───────── */

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

export function VelocityMarquee({
  children,
  baseVelocity = -2,
  className,
}: {
  children: ReactNode;
  baseVelocity?: number;
  className?: string;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    let move = direction.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    move += direction.current * move * Math.abs(f);
    baseX.set(baseX.get() + move);
  });

  return (
    <div className={clsx("overflow-hidden whitespace-nowrap", className)} data-reveal-skip aria-hidden>
      <motion.div className="flex w-max flex-nowrap" style={{ x }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex shrink-0 items-center">
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Scroll progress hairline (top of viewport) ─────────────────────────── */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-primary"
      style={{ scaleX }}
    />
  );
}
