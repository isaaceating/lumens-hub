"use client";

import { useEffect, useState } from "react";
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Course Management
        </h1>

        <p className="mt-2 text-slate-600">
          Manage Lumens HUB training courses.
        </p>
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
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr
                key={course.id}
                className="border-t border-slate-100"
              >
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}