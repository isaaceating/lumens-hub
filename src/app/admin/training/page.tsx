"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/app/components/AdminGuard";
import {
  duplicateTrainingProgram,
  getTrainingProgramStats,
  getTrainingPrograms,
  TrainingProgram,
} from "@/lib/training";

type ProgramWithStats = TrainingProgram & {
  courseCount: number;
  lessonCount: number;
};

const getStatusClass = (status: string) => {
  if (status === "published") {
    return "bg-green-50 text-green-700";
  }

  if (status === "archived") {
    return "bg-slate-100 text-slate-500";
  }

  return "bg-yellow-50 text-yellow-700";
};

function AdminTrainingContent() {
  const [programs, setPrograms] = useState<ProgramWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const fetchPrograms = async () => {
    setLoading(true);

    try {
      const data = await getTrainingPrograms();

      const dataWithStats = await Promise.all(
        data.map(async (program) => {
          const stats = await getTrainingProgramStats(program.id);

          return {
            ...program,
            ...stats,
          };
        })
      );

      setPrograms(dataWithStats);
    } catch (error) {
      console.error("Failed to load training programs:", error);
      alert("Failed to load training programs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleDuplicate = async (program: TrainingProgram) => {
    const confirmed = window.confirm(
      `Duplicate "${program.title}"? The copied program will be created as draft.`
    );

    if (!confirmed) return;

    setDuplicatingId(program.id);

    try {
      await duplicateTrainingProgram(program.id);
      await fetchPrograms();
    } catch (error) {
      console.error("Failed to duplicate training program:", error);
      alert("Failed to duplicate training program.");
    } finally {
      setDuplicatingId(null);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading training programs...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Training Management
          </h1>
          <p className="mt-2 text-slate-600">
            Manage reusable training programs, courses, and lessons.
          </p>
        </div>

        <Link
          href="/admin/training/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          + New Program
        </Link>
      </div>

      <div className="grid gap-5">
        {programs.map((program) => (
          <div
            key={program.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {program.title}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                      program.status
                    )}`}
                  >
                    {program.status}
                  </span>
                </div>

                <p className="text-sm text-slate-500">
                  {program.description || "No description."}
                </p>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                  <span>Owner: {program.ownerDepartment || "-"}</span>
                  <span>Courses: {program.courseCount}</span>
                  <span>Lessons: {program.lessonCount}</span>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-3">
                <Link
                  href={`/admin/training/${program.id}`}
                  className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700 hover:bg-blue-100"
                >
                  Edit
                </Link>

                <button
                  type="button"
                  onClick={() => handleDuplicate(program)}
                  disabled={duplicatingId === program.id}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 disabled:text-slate-400"
                >
                  {duplicatingId === program.id ? "Duplicating..." : "Duplicate"}
                </button>
              </div>
            </div>
          </div>
        ))}

        {programs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              No training programs yet.
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Create your first reusable training program.
            </p>

            <Link
              href="/admin/training/new"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Create Program
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminTrainingPage() {
  return (
    <AdminGuard>
      <AdminTrainingContent />
    </AdminGuard>
  );
}