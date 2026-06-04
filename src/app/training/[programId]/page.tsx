"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getPublishedTrainingProgramById,
  TrainingProgram,
} from "@/lib/training";

function TrainingProgramContent() {
  const params = useParams();
  const programId = params.programId as string;

  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProgram = async () => {
      if (!programId) return;

      setLoading(true);

      try {
        const data = await getPublishedTrainingProgramById(programId);

        if (!data) {
          setNotFound(true);
          return;
        }

        setProgram(data);
        setNotFound(false);
      } catch (error) {
        console.error("Failed to load training program:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId]);

  if (loading) {
    return <div className="text-slate-500">Loading training program...</div>;
  }

  if (notFound || !program) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Training program not available
        </h1>
        <p className="mt-3 text-slate-500">
          This program may still be in draft or archived.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Official Training Program
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          {program.title}
        </h1>

        <p className="mt-3 max-w-3xl text-slate-600">
          {program.description || "No description."}
        </p>

        <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
          <span>Owner: {program.ownerDepartment || "Lumens"}</span>
          <span>Status: {program.status}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h2 className="text-lg font-semibold text-slate-900">
          Program content coming soon
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          The next step will add levels, courses, lessons, video content, and
          materials under this training program.
        </p>
      </div>
    </div>
  );
}

export default function TrainingProgramPage() {
  return <TrainingProgramContent />;
}