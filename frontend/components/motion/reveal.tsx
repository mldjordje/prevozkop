'use client';

import { type ComponentPropsWithoutRef, type ElementType, type ReactNode, useRef } from "react";
import { motion, useInView } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "scale";

type ScrollRevealProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: Direction;
  once?: boolean;
  amount?: number;
  duration?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

const directionVariants: Record<Direction, { hidden: Record<string, unknown>; visible: Record<string, unknown> }> = {
  up: { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -28 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: 32 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: -32 }, visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1 } },
};

export function ScrollReveal<T extends ElementType = "div">({
  as,
  children,
  className,
  delay = 0,
  from = "up",
  once = true,
  amount = 0.3,
  duration = 0.9,
  ...rest
}: ScrollRevealProps<T>) {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once, amount });
  const Component = motion[(as || "div") as keyof typeof motion] as ElementType;

  const variants = directionVariants[from];

  return (
    <Component
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
};

export function StaggerReveal({ children, className, stagger = 0.08, delay = 0 }: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
