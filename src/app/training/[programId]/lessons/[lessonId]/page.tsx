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

type LessonContent = {
  program: TrainingProgram;
  levels: TrainingLevel[];
  courses: TrainingCourse[];
  lessons: TrainingLesson[];
  lesson: TrainingLesson;
  course?: TrainingCourse;
  level?: TrainingLevel;
};

const getMaterialIcon = (type?: string) => {
  switch (type) {
    case "slides":
      return "💡";
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

const getYouTubeEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    return "";
  } catch {
    return "";
  }
};

const getVimeoEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const videoId = parsed.pathname.split("/").filter(Boolean)[0];

    if (parsed.hostname.includes("vimeo.com") && videoId) {
      return `https://player.vimeo.com/video/${videoId}`;
    }

    return "";
  } catch {
    return "";
  }
};

function VideoBlock({ lesson }: { lesson: TrainingLesson }) {
  if (!lesson.videoUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            No video added yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This lesson currently has no video link.
          </p>
        </div>
      </div>
    );
  }

  const videoType = lesson.videoType || "external";

  if (videoType === "youtube") {
    const embedUrl = getYouTubeEmbedUrl(lesson.videoUrl);

    if (embedUrl) {
      return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      );
    }
  }

  if (videoType === "vimeo") {
    const embedUrl = getVimeoEmbedUrl(lesson.videoUrl);

    if (embedUrl) {
      return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex aspect-video items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Video
        </div>

        <a
          href={lesson.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-sm font-medium text-blue-700 hover:underline"
        >
          Open video link
        </a>

        <p className="mt-2 text-xs text-slate-500">
          This video type opens as an external link.
        </p>
      </div>
    </div>
  );
}

function LessonDetailContent() {
  const params = useParams();
  const programId = params.programId as string;
  const lessonId = params.lessonId as string;

  const [content, setContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const nextLesson = useMemo(() => {
    if (!content) return null;

    const currentIndex = content.lessons.findIndex(
      (item) => item.id === content.lesson.id
    );

    if (currentIndex === -1) return null;

    return content.lessons[currentIndex + 1] || null;
  }, [content]);

  const previousLesson = useMemo(() => {
    if (!content) return null;

    const currentIndex = content.lessons.findIndex(
      (item) => item.id === content.lesson.id
    );

    if (currentIndex <= 0) return null;

    return content.lessons[currentIndex - 1] || null;
  }, [content]);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!programId || !lessonId) return;

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

        const lesson = lessons.find((item) => item.id === lessonId);

        if (!lesson) {
          setNotFound(true);
          return;
        }

        const course = courses.find((item) => item.id === lesson.courseId);
        const level = levels.find((item) => item.id === lesson.levelId);

        setContent({
          program,
          levels,
          courses,
          lessons,
          lesson,
          course,
          level,
        });

        setNotFound(false);
      } catch (error) {
        console.error("Failed to load lesson:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [programId, lessonId]);

  if (loading) {
    return <div className="text-slate-500">Loading lesson...</div>;
  }

  if (notFound || !content) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Lesson not available
        </h1>
        <p className="mt-3 text-slate-500">
          This lesson may still be in draft or archived.
        </p>

        <Link
          href={`/training/${programId}`}
          className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Back to Program
        </Link>
      </div>
    );
  }

  const { program, lesson, course, level } = content;

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/training/${programId}`}
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          Back to {program.title}
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {level && <span>{level.title}</span>}
          {level && course && <span>/</span>}
          {course && <span>{course.title}</span>}
          {(level || course) && <span>/</span>}
          <span className="font-medium text-slate-700">
            Lesson {lesson.order || 0}
          </span>
          {lesson.duration && (
            <>
              <span>/</span>
              <span>{lesson.duration}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <VideoBlock lesson={lesson} />
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Materials
            </h2>

            {lesson.materials && lesson.materials.length > 0 ? (
              <div className="mt-4 space-y-3">
                {lesson.materials.map((material, index) => (
                  <a
                    key={`${lesson.id}-${index}`}
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <span className="text-lg">
                      {getMaterialIcon(material.type)}
                    </span>

                    <div className="min-w-0">
                      <div className="font-medium">{material.title}</div>
                      <div className="mt-1 text-xs capitalize text-slate-500">
                        {material.type || "link"}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No materials added for this lesson.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Lesson Navigation
            </h2>

            <div className="mt-4 grid gap-3">
              {previousLesson ? (
                <Link
                  href={`/training/${programId}/lessons/${previousLesson.id}`}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-center text-sm text-slate-700 hover:bg-slate-200"
                >
                  Previous Lesson
                </Link>
              ) : (
                <div className="rounded-lg bg-slate-50 px-4 py-2 text-center text-sm text-slate-400">
                  No previous lesson
                </div>
              )}

              {nextLesson ? (
                <Link
                  href={`/training/${programId}/lessons/${nextLesson.id}`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm text-white hover:bg-blue-700"
                >
                  Next Lesson
                </Link>
              ) : (
                <div className="rounded-lg bg-slate-50 px-4 py-2 text-center text-sm text-slate-400">
                  Last lesson
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Course Info
            </h2>

            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {level && (
                <div>
                  <span className="text-slate-400">Level:</span>{" "}
                  <span>{level.title}</span>
                </div>
              )}

              {course && (
                <div>
                  <span className="text-slate-400">Course:</span>{" "}
                  <span>{course.title}</span>
                </div>
              )}

              <div>
                <span className="text-slate-400">Program:</span>{" "}
                <span>{program.title}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Lesson {lesson.order || 0}
          </span>

          {lesson.duration && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {lesson.duration}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-900">{lesson.title}</h1>

        {lesson.description ? (
          <p className="mt-3 max-w-4xl text-slate-600">
            {lesson.description}
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No lesson description.
          </p>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Discussion</h2>
        <p className="mt-2 text-sm text-slate-500">
          Comments and questions will be available in the next version.
        </p>

        {lesson.allowComments === false && (
          <p className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Comments are disabled for this lesson.
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          {previousLesson && (
            <Link
              href={`/training/${programId}/lessons/${previousLesson.id}`}
              className="inline-block rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
            >
              Previous Lesson
            </Link>
          )}
        </div>

        <div>
          {nextLesson && (
            <Link
              href={`/training/${programId}/lessons/${nextLesson.id}`}
              className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Next Lesson
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LessonDetailPage() {
  return <LessonDetailContent />;
}