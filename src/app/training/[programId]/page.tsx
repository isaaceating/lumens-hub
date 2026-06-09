"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getPublishedTrainingCoursesByProgram,
  getPublishedTrainingLessonsByProgram,
  getPublishedTrainingLevelsByProgram,
  getPublishedTrainingProgramById,
  TrainingCourse,
  TrainingLesson,
  TrainingLevel,
  TrainingProgram,
} from "@/lib/training";

type ProgramContent = {
  program: TrainingProgram;
  levels: TrainingLevel[];
  courses: TrainingCourse[];
  lessons: TrainingLesson[];
};

type LearningSection = {
  id: string;
  title: string;
  description?: string;
  order?: number;
  courses: TrainingCourse[];
  isVirtual?: boolean;
};

const getCompletionStorageKey = (programId: string) =>
  `lumens-training-completed-lessons:${programId}`;

function TrainingProgramContent() {
  const params = useParams();
  const programId = params.programId as string;

  const [content, setContent] = useState<ProgramContent | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const lessonsByCourse = useMemo(() => {
    const map = new Map<string, TrainingLesson[]>();

    if (!content) return map;

    content.courses.forEach((course) => {
      map.set(course.id, []);
    });

    content.lessons.forEach((lesson) => {
      const existing = map.get(lesson.courseId) || [];
      map.set(lesson.courseId, [...existing, lesson]);
    });

    return map;
  }, [content]);

  const learningSections = useMemo(() => {
    if (!content) return [] as LearningSection[];

    if (content.levels.length === 0) {
      return [
        {
          id: "main-content",
          title: "Training Content",
          description: "Follow the courses below to complete this program.",
          order: 1,
          courses: content.courses,
          isVirtual: true,
        },
      ];
    }

    const sections: LearningSection[] = content.levels.map((level) => ({
      id: level.id,
      title: level.title,
      description: level.description,
      order: level.order,
      courses: content.courses.filter((course) => course.levelId === level.id),
    }));

    const ungroupedCourses = content.courses.filter((course) => !course.levelId);

    if (ungroupedCourses.length > 0) {
      sections.push({
        id: "additional-content",
        title: "Additional Content",
        description: "Courses that are not assigned to a specific section.",
        order: sections.length + 1,
        courses: ungroupedCourses,
        isVirtual: true,
      });
    }

    return sections;
  }, [content]);

  const completedPublishedLessonIds = useMemo(() => {
    if (!content) return [] as string[];

    const publishedLessonIds = new Set(content.lessons.map((lesson) => lesson.id));

    return completedLessonIds.filter((lessonId) => publishedLessonIds.has(lessonId));
  }, [content, completedLessonIds]);

  const completionPercent = useMemo(() => {
    if (!content || content.lessons.length === 0) return 0;

    return Math.round(
      (completedPublishedLessonIds.length / content.lessons.length) * 100
    );
  }, [content, completedPublishedLessonIds.length]);

  useEffect(() => {
    const fetchProgram = async () => {
      if (!programId) return;

      setLoading(true);

      try {
        const program = await getPublishedTrainingProgramById(programId);

        if (!program) {
          setNotFound(true);
          return;
        }

        const [levels, courses, lessons] = await Promise.all([
          getPublishedTrainingLevelsByProgram(programId),
          getPublishedTrainingCoursesByProgram(programId),
          getPublishedTrainingLessonsByProgram(programId),
        ]);

        setContent({
          program,
          levels,
          courses,
          lessons,
        });

        setNotFound(false);
      } catch (error) {
        console.error("Failed to load training program:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId]);

  useEffect(() => {
    if (!programId || typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(getCompletionStorageKey(programId));
      const parsed = stored ? JSON.parse(stored) : [];

      setCompletedLessonIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCompletedLessonIds([]);
    }
  }, [programId]);

  if (loading) {
    return <div className="text-slate-500">Loading training program...</div>;
  }

  if (notFound || !content) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Training program not available
        </h1>
        <p className="mt-3 text-slate-500">
          This program may still be in draft or archived.
        </p>
      </div>
    );
  }

  const { program, courses, lessons } = content;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-slate-100 p-7 shadow-sm">
        <div className="relative">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-44 w-44 rounded-full bg-cyan-100/60 blur-3xl" />

          <div className="relative grid gap-7 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700 shadow-sm">
                Official Training Program
              </div>

              <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                {program.title}
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                {program.description || "No description."}
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-white/80 px-3 py-1 text-slate-600 ring-1 ring-blue-100">
                  Owner: {program.ownerDepartment || "Lumens"}
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1 text-slate-600 ring-1 ring-blue-100">
                  {learningSections.length} sections
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1 text-slate-600 ring-1 ring-blue-100">
                  {courses.length} courses
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1 text-slate-600 ring-1 ring-blue-100">
                  {lessons.length} lessons
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Program Completion
                  </div>
                </div>

                <div className="text-3xl font-bold text-blue-700">
                  {completionPercent}%
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>

              <div className="mt-3 text-xs text-slate-500">
                {completedPublishedLessonIds.length} of {lessons.length} lessons completed
              </div>
            </div>
          </div>
        </div>
      </section>

      {learningSections.length === 0 || courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No published content yet.
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Published sections, courses, and lessons will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <div className="mb-2 h-1 w-12 rounded-full bg-blue-600" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Learning Path
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Follow each section and lesson in order, or jump directly to the topic you need.
            </p>
          </div>

          <div className="space-y-6">
            {learningSections.map((section, sectionIndex) => (
              <section
                key={section.id}
                className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-sm">
                      {sectionIndex + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                        Section {section.order || sectionIndex + 1}
                      </div>

                      <h3 className="text-2xl font-bold text-slate-900">
                        {section.title}
                      </h3>

                      {section.description && (
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                    {section.courses.length} courses
                  </div>
                </div>

                {section.courses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                    No published courses in this section yet.
                  </div>
                ) : (
                  <div className="space-y-4 border-l-2 border-slate-100 pl-4 md:pl-6">
                    {section.courses.map((course) => {
                      const courseLessons = lessonsByCourse.get(course.id) || [];

                      return (
                        <div key={course.id} className="relative">
                          <div className="absolute -left-[25px] top-6 h-3 w-3 rounded-full border-2 border-white bg-blue-600 md:-left-[31px]" />

                          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                  Course {course.order || 0}
                                </div>

                                <h4 className="text-lg font-bold text-slate-900">
                                  {course.title}
                                </h4>

                                {course.description && (
                                  <p className="mt-2 text-sm leading-6 text-slate-500">
                                    {course.description}
                                  </p>
                                )}
                              </div>

                              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200">
                                {courseLessons.length} lessons
                              </span>
                            </div>

                            {courseLessons.length === 0 ? (
                              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                                No published lessons in this course yet.
                              </div>
                            ) : (
                              <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white">
                                {courseLessons.map((lesson, lessonIndex) => {
                                  const isCompleted = completedPublishedLessonIds.includes(
                                    lesson.id
                                  );
                                  const lessonNumber = lesson.order || lessonIndex + 1;

                                  return (
                                    <article
                                      key={lesson.id}
                                      className="group flex flex-col gap-4 p-4 transition hover:bg-blue-50/50 md:flex-row md:items-center md:justify-between"
                                    >
                                      <div className="flex min-w-0 gap-3">
                                        <div
                                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                            isCompleted
                                              ? "bg-green-100 text-green-700"
                                              : "bg-blue-50 text-blue-700"
                                          }`}
                                        >
                                          {isCompleted ? "✓" : lessonNumber}
                                        </div>

                                        <div className="min-w-0">
                                          <div className="mb-1 flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-medium text-blue-700">
                                              Lesson {lessonNumber}
                                            </span>

                                            {lesson.duration && (
                                              <span className="text-xs text-slate-400">
                                                · {lesson.duration}
                                              </span>
                                            )}

                                            {lesson.materials && lesson.materials.length > 0 && (
                                              <span className="text-xs text-slate-400">
                                                · {lesson.materials.length} resources
                                              </span>
                                            )}

                                            {lesson.requireCompletion === false && (
                                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                                                Optional
                                              </span>
                                            )}
                                          </div>

                                          <h5 className="font-semibold text-slate-900">
                                            {lesson.title}
                                          </h5>

                                          {lesson.description && (
                                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                              {lesson.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <Link
                                        href={`/training/${programId}/lessons/${lesson.id}`}
                                        className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                                      >
                                        Start Lesson
                                      </Link>
                                    </article>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainingProgramPage() {
  return <TrainingProgramContent />;
}