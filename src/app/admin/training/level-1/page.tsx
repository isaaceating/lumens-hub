"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signInWithGoogle } from "@/lib/auth";
import { useUserProfile } from "@/lib/useUserProfile";
import { getCourseProgress } from "@/lib/progress";
import { getCoursesByLevel } from "@/lib/courses";

export default function Level1Page() {
  const { user, loading: userLoading } = useUserProfile();

  const [courses, setCourses] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const handleLogin = async () => {
    if (signingIn) return;

    setSigningIn(true);

    try {
      await signInWithGoogle();
    } finally {
      setSigningIn(false);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.uid) return;

      setLoadingCourses(true);

      try {
        const data = await getCoursesByLevel("level-1");
        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [user?.uid]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.uid || courses.length === 0) return;

      const completed: string[] = [];

      for (const course of courses) {
        const data = await getCourseProgress(user.uid, course.id);

        if (data?.completed) {
          completed.push(course.id);
        }
      }

      setCompletedCourses(completed);
    };

    fetchProgress();
  }, [user?.uid, courses]);

  if (userLoading) {
    return <div className="text-sm text-slate-500">Loading training...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Login required</h1>

        <p className="mt-3 text-slate-600">
          Please sign in with an authorized Google account to access Level 1
          Training.
        </p>

        <button
          type="button"
          onClick={handleLogin}
          disabled={signingIn}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {signingIn ? "Signing in..." : "Login with Google"}
        </button>
      </div>
    );
  }

  if (loadingCourses) {
    return <div className="text-sm text-slate-500">Loading courses...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Level 1 Training
        </h1>

        <p className="mt-2 text-slate-600">
          Foundation learning path for Lumens sales certification.
        </p>
      </div>

      <div className="space-y-4">
        {courses.map((course) => {
          const courseId = course.id;
          const isCompleted = completedCourses.includes(courseId);
          const isUnlockedByProgress =
            course.unlockAfter && completedCourses.includes(course.unlockAfter);

          const isAvailable =
            course.status === "Available" || isUnlockedByProgress;

          return (
            <div
              key={course.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <div className="font-semibold text-slate-900">
                  {course.title}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  {course.duration}
                </div>
              </div>

              <div>
                {isCompleted ? (
                  <Link
                    href={`/training/level-1/${courseId}`}
                    className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700 hover:bg-green-200"
                  >
                    Completed ✅ Review
                  </Link>
                ) : isAvailable ? (
                  <Link
                    href={`/training/level-1/${courseId}`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    Start
                  </Link>
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                    Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}