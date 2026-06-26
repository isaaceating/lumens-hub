"use client";

import { useMemo } from "react";
import type { TrainingCourse, TrainingLesson, TrainingLevel } from "@/lib/training";
import { getCourseSectionId, getCourseTitle, getSectionTitle, sortLessonsByHierarchy } from "./lessonHierarchy";

type LessonPickerProps = {
  sections: TrainingLevel[];
  courses: TrainingCourse[];
  lessons: TrainingLesson[];
  value: string;
  onChange: (lessonId: string) => void;
  heading: string;
  helperText: string;
  metaLabel: string;
  metaValue: (lesson: TrainingLesson) => number;
};

export default function LessonPicker({
  sections,
  courses,
  lessons,
  value,
  onChange,
  heading,
  helperText,
  metaLabel,
  metaValue,
}: LessonPickerProps) {
  const sortedLessons = useMemo(
    () => sortLessonsByHierarchy(lessons, courses, sections),
    [lessons, courses, sections]
  );
  const currentLesson = lessons.find((lesson) => lesson.id === value) || null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900">{heading}</h2>
      <p className="mt-1 text-sm text-slate-500">{helperText}</p>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
      >
        <option value="">Select lesson</option>
        {sortedLessons.map((lesson) => (
          <option key={lesson.id} value={lesson.id}>
            {getSectionTitle(sections, getCourseSectionId(courses, lesson.courseId))} / {getCourseTitle(courses, lesson.courseId)} / {lesson.title}
          </option>
        ))}
      </select>

      {currentLesson && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            {getSectionTitle(sections, getCourseSectionId(courses, currentLesson.courseId))}
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900">
            {getCourseTitle(courses, currentLesson.courseId)}
          </div>
          <div className="mt-1 text-sm text-slate-600">{currentLesson.title}</div>
          <div className="mt-3 text-xs text-slate-500">
            {metaLabel}: {metaValue(currentLesson)}
          </div>
        </div>
      )}
    </div>
  );
}
