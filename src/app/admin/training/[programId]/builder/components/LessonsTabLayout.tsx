"use client";

import type { ChangeEvent, FormEvent } from "react";
import type { TrainingCourse, TrainingLesson, TrainingLevel, TrainingStatus } from "@/lib/training";
import LessonEditorForm, { type LessonEditorFormValues } from "./LessonEditorForm";
import LessonListPanel from "./LessonListPanel";
import { getSectionTitle } from "./lessonHierarchy";

type Props = {
  programId: string;
  sections: TrainingLevel[];
  courses: TrainingCourse[];
  lessons: TrainingLesson[];
  loading: boolean;
  editingId: string | null;
  saving: boolean;
  message: string;
  form: LessonEditorFormValues;
  statuses: TrainingStatus[];
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  onRefresh: () => void;
  onEdit: (lesson: TrainingLesson) => void;
};

export default function LessonsTabLayout({
  programId,
  sections,
  courses,
  lessons,
  loading,
  editingId,
  saving,
  message,
  form,
  statuses,
  onChange,
  onSubmit,
  onCancel,
  onRefresh,
  onEdit,
}: Props) {
  const courseOptions = courses.map((course) => ({
    id: course.id,
    label: `${getSectionTitle(sections, course.levelId)} / ${course.title}`,
  }));

  return (
    <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <LessonEditorForm
        editingLessonId={editingId}
        saving={saving}
        message={message}
        form={form}
        courseOptions={courseOptions}
        statusOptions={statuses}
        onChange={onChange}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
      <LessonListPanel
        programId={programId}
        sections={sections}
        courses={courses}
        lessons={lessons}
        loading={loading}
        onRefresh={onRefresh}
        onEditLesson={onEdit}
      />
    </section>
  );
}
