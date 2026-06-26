"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText, Pencil, HelpCircle } from "lucide-react";
import AdminGuard from "@/app/components/AdminGuard";
import {
  getTrainingCoursesByProgram,
  getTrainingLessonsByProgram,
  getTrainingLevelsByProgram,
  type TrainingCourse,
  type TrainingLesson,
  type TrainingLevel,
} from "@/lib/training";

const sortByOrder = <T extends { order?: number; title?: string }>(items: T[]) =>
  [...items].sort((a, b) => {
    const orderDiff = (a.order || 0) - (b.order || 0);
    if (orderDiff !== 0) return orderDiff;
    return (a.title || "").localeCompare(b.title || "");
  });

function LessonQuickLinksContent() {
  const params = useParams();
  const programId = params.programId as string;

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<TrainingLevel[]>([]);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [lessons, setLessons] = useState<TrainingLesson[]>([]);

  const getSection = (levelId?: string) => sections.find((section) => section.id === levelId);
  const getCourse = (courseId?: string) => courses.find((course) => course.id === courseId);
  const getCourseTitle = (courseId?: string) => getCourse(courseId)?.title || "Unknown course";
  const getCourseSectionId = (courseId?: string) => getCourse(courseId)?.levelId || "";
  const getSectionTitle = (levelId?: string) => getSection(levelId)?.title || "Unassigned";
  const getSectionOrder = (levelId?: string) => getSection(levelId)?.order ?? Number.MAX_SAFE_INTEGER;
  const getCourseOrder = (courseId?: string) => getCourse(courseId)?.order ?? Number.MAX_SAFE_INTEGER;

  const sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => {
      const sectionOrderDiff = getSectionOrder(getCourseSectionId(a.courseId)) - getSectionOrder(getCourseSectionId(b.courseId));
      if (sectionOrderDiff !== 0) return sectionOrderDiff;
      const courseOrderDiff = getCourseOrder(a.courseId) - getCourseOrder(b.courseId);
      if (courseOrderDiff !== 0) return courseOrderDiff;
      const lessonOrderDiff = (a.order || 0) - (b.order || 0);
      if (lessonOrderDiff !== 0) return lessonOrderDiff;
      return (a.title || "").localeCompare(b.title || "");
    });
  }, [lessons, courses, sections]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sectionData, courseData, lessonData] = await Promise.all([
          getTrainingLevelsByProgram(programId),
          getTrainingCoursesByProgram(programId),
          getTrainingLessonsByProgram(programId),
        ]);
        setSections(sectionData);
        setCourses(courseData);
        setLessons(lessonData);
      } finally {
        setLoading(false);
      }
    };

    if (programId) fetchData();
  }, [programId]);

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">Loading lesson links...</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <Link href={`/admin/training/${programId}/builder`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-700">
        <ArrowLeft size={16} /> Back to Builder
      </Link>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-950 to-indigo-800 p-6 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">Lesson Actions</div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Lesson Quick Links</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-white/75">Use this temporary page until the actions are embedded directly into the Lessons tab.</p>
          <p className="mt-2 font-mono text-xs text-white/55">Program ID: {programId}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="font-semibold text-slate-900">Lessons</h2>
          <p className="mt-1 text-sm text-slate-500">Each lesson action follows the final planned pattern: Edit, Materials, Quiz.</p>
        </div>

        <div className="space-y-3">
          {sortedLessons.map((lesson) => (
            <div key={lesson.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                    <span>{getSectionTitle(getCourseSectionId(lesson.courseId))}</span>
                    <span>/</span>
                    <span>{getCourseTitle(lesson.courseId)}</span>
                    <span>/</span>
                    <span>Lesson Order {lesson.order || 0}</span>
                  </div>
                  <h3 className="mt-2 font-semibold text-slate-900">{lesson.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{lesson.duration || "No duration"} · {lesson.videoType || "video"}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/training/${programId}/builder`} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                    <Pencil size={13} /> Edit
                  </Link>
                  <Link href={`/admin/training/${programId}/builder/materials?lessonId=${lesson.id}`} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
                    <FileText size={13} /> Materials
                  </Link>
                  <button type="button" disabled className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-400">
                    <HelpCircle size={13} /> Quiz
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function LessonQuickLinksPage() {
  return (
    <AdminGuard>
      <LessonQuickLinksContent />
    </AdminGuard>
  );
}
