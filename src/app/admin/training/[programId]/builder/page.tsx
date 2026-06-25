"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  Eye,
  FileText,
  Layers3,
  ListChecks,
  Route,
  Video,
} from "lucide-react";
import BuilderPage from "../page";

type BuilderTabId = "program" | "sections" | "courses" | "lessons" | "structure";

const workflowSteps: {
  id: BuilderTabId;
  title: string;
  shortTitle: string;
  description: string;
  detail: string;
  status: string;
  icon: React.ElementType;
}[] = [
  {
    id: "program",
    title: "1. Program",
    shortTitle: "Program",
    description: "Confirm title, owner, status, and route.",
    detail:
      "This tab will become the focused editor for program-level settings. For now, use the legacy editor below for actual saving.",
    status: "Next implementation target",
    icon: FileText,
  },
  {
    id: "sections",
    title: "2. Sections",
    shortTitle: "Sections",
    description: "Create levels, chapters, or phases.",
    detail:
      "Sections define the top layer of the learning structure. This tab will hold add/edit controls for sections after Program is stable.",
    status: "Planned",
    icon: Layers3,
  },
  {
    id: "courses",
    title: "3. Courses",
    shortTitle: "Courses",
    description: "Group lessons under each section.",
    detail:
      "Courses organize lesson groups and can belong to a section. This tab will be migrated after Sections.",
    status: "Planned",
    icon: BookOpenCheck,
  },
  {
    id: "lessons",
    title: "4. Lessons",
    shortTitle: "Lessons",
    description: "Add video, duration, materials, and quiz.",
    detail:
      "Lessons are the most complex part because they include video, materials, completion options, and quizzes. This will be migrated last.",
    status: "Planned",
    icon: Video,
  },
  {
    id: "structure",
    title: "5. Structure",
    shortTitle: "Structure",
    description: "Review, edit, and publish hierarchy.",
    detail:
      "Structure will become the visual review area for the full program hierarchy, with quick edit entry points.",
    status: "Planned",
    icon: ListChecks,
  },
];

export default function AdvancedTrainingBuilderRoute() {
  const params = useParams();
  const programId = params.programId as string;
  const [activeTab, setActiveTab] = useState<BuilderTabId>("program");
  const activeStep = workflowSteps.find((step) => step.id === activeTab) || workflowSteps[0];
  const ActiveIcon = activeStep.icon;

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

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/training/${programId}/overview`}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
              >
                <ArrowLeft size={16} /> Manage
              </Link>
              <Link
                href={`/training/${programId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <Eye size={16} /> Preview
              </Link>
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
              This is the new builder shell. Each tab will gradually replace the legacy editor below.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 size={15} /> Existing data logic preserved
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            const isActive = activeTab === step.id;
            return (
              <button
                type="button"
                key={step.id}
                onClick={() => setActiveTab(step.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? "border-blue-200 bg-blue-50 shadow-sm ring-2 ring-blue-100"
                    : "border-slate-200 bg-slate-50 hover:border-blue-100 hover:bg-blue-50/50"
                }`}
              >
                <div
                  className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ${
                    isActive ? "text-blue-700 ring-blue-100" : "text-slate-500 ring-slate-100"
                  }`}
                >
                  <Icon size={17} />
                </div>
                <div className="text-sm font-semibold text-slate-900">{step.title}</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{step.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm ring-1 ring-blue-100">
              <ActiveIcon size={20} />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Active tab · {activeStep.status}
              </div>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{activeStep.shortTitle}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{activeStep.detail}</p>
            </div>
          </div>

          <div className="rounded-xl bg-white px-3 py-2 font-mono text-xs text-slate-500 ring-1 ring-blue-100">
            /builder#{activeTab}
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-700">Legacy advanced editor area</div>
            <p className="mt-1 text-xs text-slate-500">
              Full create/edit/delete controls remain here until each tab is migrated.
            </p>
          </div>
        </div>
        <BuilderPage />
      </div>
    </div>
  );
}
