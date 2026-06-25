"use client";

import { useParams } from "next/navigation";
import {
  BookOpenCheck,
  CheckCircle2,
  FileText,
  Layers3,
  ListChecks,
  Route,
  Video,
} from "lucide-react";
import BuilderPage from "../page";

const workflowSteps = [
  {
    title: "1. Program",
    description: "Confirm title, owner, status, and route.",
    icon: FileText,
  },
  {
    title: "2. Sections",
    description: "Create levels, chapters, or phases.",
    icon: Layers3,
  },
  {
    title: "3. Courses",
    description: "Group lessons under each section.",
    icon: BookOpenCheck,
  },
  {
    title: "4. Lessons",
    description: "Add video, duration, materials, and quiz.",
    icon: Video,
  },
  {
    title: "5. Structure",
    description: "Review, edit, and publish hierarchy.",
    icon: ListChecks,
  },
];

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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
              <Route size={14} /> Builder Workflow
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Build from top to bottom</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              The editor below still uses the existing create/edit logic, but this page is now organized as the advanced build flow.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 size={15} /> Existing data logic preserved
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm ring-1 ring-slate-100">
                  <Icon size={17} />
                </div>
                <div className="text-sm font-semibold text-slate-900">{step.title}</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-slate-700">Advanced editor area</div>
        <BuilderPage />
      </div>
    </div>
  );
}
