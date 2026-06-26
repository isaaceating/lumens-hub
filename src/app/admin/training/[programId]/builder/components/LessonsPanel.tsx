"use client";

import type { TrainingCourse, TrainingLesson, TrainingLevel } from "@/lib/training";
import {
  getCourseSectionId,
  getCourseTitle,
  getSectionTitle,
  sortLessonsByHierarchy,
} from "./lessonHierarchy";
import LessonSummaryCard from "./LessonSummaryCard";

type LessonsPanelProps = {
  programId: string;
  sections: TrainingLevel[];
  courses: TrainingCourse[];
  lessons: TrainingLesson[];
  onEditLesson: (lesson: TrainingLesson) => void;
};

export default function LessonsPanel({
  programId,
  sections,
  courses,
  lessons,
  onEditLesson,
}: LessonsPanelProps) {
  const sortedLessons = sortLessonsByHierarchy(lessons, courses, sections);

  if (!sortedLessons.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        No lessons yet. Create a lesson first.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedLessons.map((lesson) => (
        <LessonSummaryCard
          key={lesson.id}
          programId={programId}
          lesson={lesson}
          sectionTitle={getSectionTitle(sections, getCourseSectionId(courses, lesson.courseId))}
          courseTitle={getCourseTitle(courses, lesson.courseId)}
          onEdit={onEditLesson}
        />
      ))}
    </div>
  );
}
