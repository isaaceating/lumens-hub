"use client";

import { useEffect, type ReactNode } from "react";

const hashToTabLabel: Record<string, string> = {
  "#program": "Program",
  "#sections": "Sections",
  "#courses": "Courses",
  "#lessons": "Lessons",
  "#structure": "Structure",
};

const syncHashToTab = () => {
  const tabLabel = hashToTabLabel[window.location.hash];
  if (!tabLabel) return;

  const buttons = Array.from(document.querySelectorAll("button"));
  const targetButton = buttons.find((button) => button.textContent?.includes(tabLabel));

  targetButton?.click();
};

export default function BuilderTemplate({ children }: { children: ReactNode }) {
  useEffect(() => {
    syncHashToTab();
    window.addEventListener("hashchange", syncHashToTab);

    return () => window.removeEventListener("hashchange", syncHashToTab);
  }, []);

  return <>{children}</>;
}
