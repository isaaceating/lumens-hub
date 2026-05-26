"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminGuard from "@/app/components/AdminGuard";
import { getCourseById } from "@/lib/courses";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      const data = await getCourseById(courseId);

      setCourse(data);
      setLoading(false);
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  return (
    <AdminGuard>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Edit Course
        </h1>

        {loading ? (
          <div className="mt-6 text-slate-500">
            Loading...
          </div>
        ) : !course ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            Course not found.
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-500">Title</div>
                <div className="text-slate-900">{course.title}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Video ID</div>
                <div className="text-slate-900">{course.videoId}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Duration</div>
                <div className="text-slate-900">{course.duration}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Status</div>
                <div className="text-slate-900">{course.status}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}