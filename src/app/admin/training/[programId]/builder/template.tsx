"use client";

import { useEffect, type ReactNode } from "react";
import { useParams } from "next/navigation";

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

        const actions = document.createElement("div");
        actions.setAttribute("data-lesson-actions", "true");
        actions.className = "flex flex-wrap items-center gap-2";
        actions.innerHTML = `
          <a class="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100" href="/admin/training/${programId}/builder/materials?lessonId=${lessonId}">Materials</a>
          <button type="button" disabled class="inline-flex cursor-not-allowed items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-400">Quiz</button>
        `;

        topRow.appendChild(actions);
      });
    };

    addLessonActions();
    const timer = window.setInterval(addLessonActions, 800);

    return () => window.clearInterval(timer);
  }, [programId]);

  return <>{children}</>;
}
