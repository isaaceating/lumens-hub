"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUserProfile } from "@/lib/useUserProfile";
import { getCourseProgress } from "@/lib/progress";

const courses = [
  {
    id: 1,
    title: "Lumens Company Introduction",
    duration: "10 min",
    status: "Available",
  },
  {
    id: 2,
    title: "CamConnect Pro Overview",
    duration: "18 min",
    status: "Available",
  },
  {
    id: 3,
    title: "OIP Solution Basics",
    duration: "15 min",
    status: "Available",
  },
  {
    id: 4,
    title: "Sales Positioning Fundamentals",
    duration: "12 min",
    status: "Locked",
    unlockAfter: "course-1",
  },
];

export default function Level1Page() {
  const { user } = useUserProfile();
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?.uid) return;

      const completed: string[] = [];

      for (const course of courses) {
        const courseId = `course-${course.id}`;
        const data = await getCourseProgress(user.uid, courseId);

        if (data?.completed) {
          completed.push(courseId);
        }
      }

      setCompletedCourses(completed);
    };

    fetchProgress();
  }, [user]);

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
          const courseId = `course-${course.id}`;
          const isCompleted = completedCourses.includes(courseId);
          const isUnlockedByProgress =
            course.unlockAfter &&
            completedCourses.includes(course.unlockAfter);

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
                    href="/training/level-1/course-1"
                    className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700 hover:bg-green-200"
                  >
                    Completed ✅ Review
                  </Link>
                ) : isAvailable ? (
                  <Link
                    href="/training/level-1/course-1"
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