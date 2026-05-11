"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCoursesByLevel } from "@/lib/courses";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const data = await getCoursesByLevel("level-1");
      setCourses(data);
    };

    fetchCourses();
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Course Management
          </h1>

          <p className="mt-2 text-slate-600">
            Manage Lumens HUB training courses.
          </p>
        </div>

        <Link
          href="/admin/courses/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Create Course
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Title
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Level
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Duration
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-t border-slate-100">
                <td className="px-6 py-4 text-sm text-slate-800">
                  {course.title}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {course.levelId}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {course.duration}
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {course.status}
                </td>

                <td className="px-6 py-4 text-sm">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="text-blue-700 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}