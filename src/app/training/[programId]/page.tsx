"use client";

import { useEffect, useMemo, useState } from "react";
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

const getMaterialIcon = (type?: string) => {
  switch (type) {
    case "slides":
      return "📊";
    case "pdf":
      return "📄";
    case "doc":
      return "📝";
    case "video":
      return "🎥";
    case "folder":
      return "📁";
    default:
      return "🔗";
  }
};

function TrainingProgramContent() {
  const params = useParams();
  const programId = params.programId as string;

  const [content, setContent] = useState<ProgramContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const coursesByLevel = useMemo(() => {
    const map = new Map<string, TrainingCourse[]>();

    if (!content) return map;

    content.levels.forEach((level) => {
      map.set(level.id, []);
    });

    content.courses.forEach((course) => {
      const existing = map.get(course.levelId || "") || [];
      map.set(course.levelId || "", [...existing, course]);
    });

    return map;
  }, [content]);

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

  const { program, levels, courses, lessons } = content;

  return (
    <div>
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Official Training Program
        </div>

        <h1 className="text-3xl font-bold text-slate-900">{program.title}</h1>

        <p className="mt-3 max-w-3xl text-slate-600">
          {program.description || "No description."}
        </p>

        <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
          <span>Owner: {program.ownerDepartment || "Lumens"}</span>
          <span>Levels: {levels.length}</span>
          <span>Courses: {courses.length}</span>
          <span>Lessons: {lessons.length}</span>
        </div>
      </div>

      {levels.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No published content yet.
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Published levels, courses, and lessons will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {levels.map((level) => {
            const levelCourses = coursesByLevel.get(level.id) || [];

            return (
              <section
                key={level.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5">
                  <div className="mb-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    Level {level.order || 0}
                  </div>

                  <h2 className="text-2xl font-semibold text-slate-900">
                    {level.title}
                  </h2>

                  {level.description && (
                    <p className="mt-2 text-sm text-slate-500">
                      {level.description}
                    </p>
                  )}
                </div>

                {levelCourses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                    No published courses in this level yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {levelCourses.map((course) => {
                      const courseLessons =
                        lessonsByCourse.get(course.id) || [];

                      return (
                        <div
                          key={course.id}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-5"
                        >
                          <div className="mb-4">
                            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-blue-700">
                              Course {course.order || 0}
                            </div>

                            <h3 className="text-lg font-semibold text-slate-900">
                              {course.title}
                            </h3>

                            {course.description && (
                              <p className="mt-2 text-sm text-slate-500">
                                {course.description}
                              </p>
                            )}
                          </div>

                          {courseLessons.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                              No published lessons in this course yet.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {courseLessons.map((lesson) => (
                                <article
                                  key={lesson.id}
                                  className="rounded-xl bg-white p-5 shadow-sm"
                                >
                                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                      <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                          Lesson {lesson.order || 0}
                                        </span>

                                        {lesson.duration && (
                                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                                            {lesson.duration}
                                          </span>
                                        )}
                                      </div>

                                      <h4 className="text-base font-semibold text-slate-900">
                                        {lesson.title}
                                      </h4>

                                      {lesson.description && (
                                        <p className="mt-2 text-sm text-slate-500">
                                          {lesson.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {lesson.videoUrl && (
                                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Video
                                      </div>

                                      <a
                                        href={lesson.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="break-all text-sm font-medium text-blue-700 hover:underline"
                                      >
                                        {lesson.videoUrl}
                                      </a>
                                    </div>
                                  )}

                                  {lesson.materials &&
                                    lesson.materials.length > 0 && (
                                      <div className="mt-4">
                                        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                                          Materials
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                          {lesson.materials.map(
                                            (material, index) => (
                                              <a
                                                key={`${lesson.id}-${index}`}
                                                href={material.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                              >
                                                <span>
                                                  {getMaterialIcon(
                                                    material.type
                                                  )}
                                                </span>
                                                <span>{material.title}</span>
                                              </a>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </article>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TrainingProgramPage() {
  return <TrainingProgramContent />;
}