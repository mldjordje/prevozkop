type TrackingPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function getCurrentPathWithSearch(): string {
  if (typeof window === "undefined") {
    return "/";
  }

  const pathname = window.location.pathname || "/";
  const search = window.location.search || "";
  return `${pathname}${search}`;
}

export function trackEvent(eventName: string, payload: TrackingPayload = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, payload);
}

export function trackGoogleAdsConversion(sendTo?: string | null, payload: TrackingPayload = {}) {
  if (!sendTo || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", "conversion", {
    send_to: sendTo,
    ...payload,
  });
}
