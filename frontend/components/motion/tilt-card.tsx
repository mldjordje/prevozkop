'use client';

import { type ReactNode, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import clsx from "clsx";

type Props = {
  children: ReactNode;
  className?: string;
  intensity?: number;
};

// Lightweight 3D tilt card for mobile/desktop (GPU-friendly transforms only).
export default function TiltCard({ children, className, intensity = 18 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 140,
    damping: 18,
    mass: 0.6,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 140,
    damping: 18,
    mass: 0.6,
  });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
    x.set(offsetX);
    y.set(offsetY);
  };

  const resetTilt = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={clsx("relative will-change-transform", className)}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      onPointerUp={resetTilt}
      onTouchEnd={resetTilt}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-primary/10 via-transparent to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {children}
    </motion.div>
  );
}
