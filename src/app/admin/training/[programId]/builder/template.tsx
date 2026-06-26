"use client";

import { useEffect, type ReactNode } from "react";
import { useParams } from "next/navigation";

const pencilIcon = `
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
    <path d="m15 5 4 4"></path>
  </svg>
`;

export default function BuilderTemplate({ children }: { children: ReactNode }) {
  const params = useParams();
  const programId = params.programId as string;

  useEffect(() => {
    const addLessonActions = () => {
      const idNodes = Array.from(
        document.querySelectorAll("p.font-mono.text-xs.text-slate-400")
      );

      idNodes.forEach((idNode) => {
        const lessonId = idNode.textContent?.trim();
        if (!lessonId) return;

        const card = idNode.closest(".rounded-2xl.border.border-slate-200.bg-slate-50.p-4");
        if (!card || card.querySelector("[data-lesson-actions='true']")) return;

        const cardText = card.textContent || "";
        if (!cardText.includes("Lesson Order")) return;

        const topRow = card.querySelector(".flex.flex-wrap.items-start.justify-between.gap-3");
        if (!topRow) return;

        const editButton = Array.from(card.querySelectorAll("button")).find((button) =>
          button.textContent?.includes("Edit")
        );
        if (!editButton) return;

        const actions = document.createElement("div");
        actions.setAttribute("data-lesson-actions", "true");
        actions.className = "flex flex-wrap items-center gap-2";

        editButton.className = "inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100";
        actions.appendChild(editButton);

        actions.insertAdjacentHTML(
          "beforeend",
          `
            <a class="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100" href="/admin/training/${programId}/builder/materials?lessonId=${lessonId}">${pencilIcon} Materials</a>
            <a class="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100" href="/admin/training/${programId}/builder/quiz?lessonId=${lessonId}">${pencilIcon} Quiz</a>
          `
        );

        topRow.appendChild(actions);
      });
    };

    const hideLegacyEditor = () => {
      const headings = Array.from(document.querySelectorAll("div.text-sm.font-semibold.text-slate-700"));
      const legacyHeading = headings.find((heading) => heading.textContent?.includes("Legacy advanced editor area"));
      const legacySection = legacyHeading?.closest(".rounded-2xl.border.border-slate-200.bg-slate-50.p-4.shadow-sm");

      if (legacySection instanceof HTMLElement) {
        legacySection.style.display = "none";
      }
    };

    const applyBuilderEnhancements = () => {
      addLessonActions();
      hideLegacyEditor();
    };

    applyBuilderEnhancements();
    const timer = window.setInterval(applyBuilderEnhancements, 800);

    return () => window.clearInterval(timer);
  }, [programId]);

  return <>{children}</>;
}
