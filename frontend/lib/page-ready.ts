"use client";

import { useEffect, useState } from "react";

/*
 * Shared "page is ready" signal. The preloader flips it when its exit starts
 * (or immediately when the preloader is skipped), so hero/text animations
 * play *after* the curtain instead of hidden behind it.
 */

const EVENT = "pk:ready";

export function isPageReady() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("pk-ready");
}

export function markPageReady() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (root.classList.contains("pk-ready")) return;
  root.classList.add("pk-ready");
  root.classList.remove("pk-loading");
  window.dispatchEvent(new Event(EVENT));
}

export function onPageReady(cb: () => void) {
  if (isPageReady()) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener(EVENT, handler, { once: true });
  return () => window.removeEventListener(EVENT, handler);
}

export function usePageReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => onPageReady(() => setReady(true)), []);
  return ready;
}
