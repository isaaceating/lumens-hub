"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserProfile } from "@/lib/useUserProfile";
import { getCourseProgress, markCourseComplete } from "@/lib/progress";
import { level1Courses } from "@/app/config/training";


export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const { user } = useUserProfile();
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const course = level1Courses.find((item) => item.id === courseId);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.uid || !courseId) return;

      const data = await getCourseProgress(user.uid, courseId);

      if (data?.completed) {
        setCompleted(true);
      }
    };

    fetchProgress();
  }, [user, courseId]);

  const handleComplete = async () => {
    if (!user?.uid || !courseId) return;

    setSaving(true);
    await markCourseComplete(user.uid, courseId);
    setCompleted(true);
    setSaving(false);
  };

  if (!course) {
    return (
      <div>
        <Link
          href="/training/level-1"
          className="mb-4 inline-block text-sm text-blue-700 hover:underline"
        >
          ← Back to Level 1
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Course not found.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/training/level-1"
          className="mb-4 inline-block text-sm text-blue-700 hover:underline"
        >
          ← Back to Level 1
        </Link>

        <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
        <p className="mt-2 text-slate-600">{course.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-video rounded-2xl bg-slate-900 shadow-sm">
            <div className="flex h-full items-center justify-center text-slate-400">
              Video Placeholder
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Course Overview
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {course.overview}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Course Materials
            </h2>

            <div className="mt-4 space-y-3">
              <a
                href="#"
                className="block rounded-lg border border-slate-200 px-4 py-3 text-sm text-blue-700 hover:bg-slate-50"
              >
                Slides
              </a>

              <a
                href="#"
                className="block rounded-lg border border-slate-200 px-4 py-3 text-sm text-blue-700 hover:bg-slate-50"
              >
                Reference Document
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Progress</h2>

            <p className="mt-2 text-sm text-slate-500">
              Mark this course as completed after watching the video and reading
              the materials.
            </p>

            <button
              onClick={handleComplete}
              disabled={completed || saving}
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-green-600"
            >
              {completed ? "Completed ✅" : saving ? "Saving..." : "Mark as Complete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}