"use client";

import { useEffect, type ReactNode } from "react";

export default function BuilderTemplate({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Keep this temporary bridge only for hiding the legacy editor area.
    // Lesson actions are now rendered by React components in the Lessons tab.
    const hideLegacyPlaceholder = () => {
      const headings = Array.from(document.querySelectorAll("div.text-sm.font-semibold.text-slate-700"));
      const legacyHeading = headings.find((heading) => heading.textContent?.includes("Legacy advanced editor area"));
      const legacySection = legacyHeading?.closest(".rounded-2xl.border.border-slate-200.bg-slate-50.p-4.shadow-sm");

      if (legacySection instanceof HTMLElement) {
        legacySection.style.display = "none";
      }
    };

    hideLegacyPlaceholder();
    const timer = window.setInterval(hideLegacyPlaceholder, 800);

    return () => window.clearInterval(timer);
  }, []);

  return <>{children}</>;
}
