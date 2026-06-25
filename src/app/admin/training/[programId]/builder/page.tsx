"use client";

import { useParams } from "next/navigation";
import { BookOpenCheck, Layers3, Video } from "lucide-react";
import BuilderPage from "../page";

export default function AdvancedTrainingBuilderRoute() {
  const params = useParams();
  const programId = params.programId as string;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-950 to-indigo-800 p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15">
                Advanced Builder
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight">Advanced Training Builder</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/75">
                Build and edit the full training hierarchy: sections, courses, lessons, materials, and quizzes.
              </p>
              <p className="mt-2 font-mono text-xs text-white/55">Program ID: {programId}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-white/80">
              <div className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/15">
                <Layers3 className="mx-auto mb-1" size={18} /> Sections
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/15">
                <BookOpenCheck className="mx-auto mb-1" size={18} /> Courses
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/15">
                <Video className="mx-auto mb-1" size={18} /> Lessons
              </div>
            </div>
          </div>
        </div>
      </div>

      <BuilderPage />
    </div>
  );
}
