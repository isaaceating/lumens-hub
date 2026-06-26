"use client";

import type { TrainingLesson } from "@/lib/training";
import LessonActionLinks from "./LessonActionLinks";

type LessonSummaryCardProps = {
  programId: string;
  lesson: TrainingLesson;
  courseTitle: string;
  sectionTitle: string;
  onEdit: (lesson: TrainingLesson) => void;
};

export default function LessonSummaryCard({
  programId,
  lesson,
  courseTitle,
  sectionTitle,
  onEdit,
}: LessonSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            {sectionTitle}
          </div>
          <h3 className="mt-1 font-semibold text-slate-900">{lesson.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{lesson.description || "No description"}</p>
          <p className="mt-2 text-xs text-slate-500">Course: {courseTitle}</p>
          <p className="mt-2 font-mono text-xs text-slate-400">{lesson.id}</p>
        </div>

        <LessonActionLinks
          programId={programId}
          lessonId={lesson.id}
          onEdit={() => onEdit(lesson)}
        />
      </div>

      <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
        <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
          Lesson Order: {lesson.order ?? "-"}
        </div>
        <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
          Materials: {lesson.materials?.length || 0}
        </div>
        <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
          Quiz: {lesson.quizQuestions?.length || 0}
        </div>
      </div>
    </div>
  );
}
