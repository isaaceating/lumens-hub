"use client";

import type { TrainingCourse, TrainingLesson, TrainingLevel } from "@/lib/training";
import LessonsPanel from "./LessonsPanel";

type LessonListPanelProps = {
  programId: string;
  sections: TrainingLevel[];
  courses: TrainingCourse[];
  lessons: TrainingLesson[];
  loading: boolean;
  onRefresh: () => void;
  onEditLesson: (lesson: TrainingLesson) => void;
};

export default function LessonListPanel({
  programId,
  sections,
  courses,
  lessons,
  loading,
  onRefresh,
  onEditLesson,
}: LessonListPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Lesson List</h2>
          <p className="mt-1 text-sm text-slate-500">
            Showing {lessons.length} lessons by Section order, Course order, then Lesson order.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
          Loading lessons...
        </div>
      ) : (
        <LessonsPanel
          programId={programId}
          sections={sections}
          courses={courses}
          lessons={lessons}
          onEditLesson={onEditLesson}
        />
      )}
    </div>
  );
}
