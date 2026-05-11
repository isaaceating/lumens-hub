"use client";

import { useParams } from "next/navigation";
import AdminGuard from "@/app/components/AdminGuard";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;

  return (
    <AdminGuard>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Course</h1>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm text-slate-500">Course ID</div>
          <div className="font-mono text-sm text-slate-900">{courseId}</div>
        </div>
      </div>
    </AdminGuard>
  );
}