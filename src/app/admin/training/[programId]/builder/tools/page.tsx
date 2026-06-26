"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import AdminGuard from "@/app/components/AdminGuard";

function BuilderToolsContent() {
  const params = useParams();
  const programId = params.programId as string;

  return (
    <div className="space-y-6 pb-10">
      <Link
        href={`/admin/training/${programId}/builder`}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-700"
      >
        <ArrowLeft size={16} /> Back to Builder
      </Link>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-950 to-indigo-800 p-6 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
            Builder Tools
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Training Builder Tools</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-white/75">
            Manage lesson-level advanced tools from here.
          </p>
          <p className="mt-2 font-mono text-xs text-white/55">Program ID: {programId}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href={`/admin/training/${programId}/builder/materials`}
          className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm transition hover:bg-blue-100"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm ring-1 ring-blue-100">
            <FileText size={20} />
          </div>
          <h2 className="mt-4 font-semibold text-blue-950">Materials Editor</h2>
          <p className="mt-2 text-sm leading-6 text-blue-700">
            Select a lesson and manage its learning resources.
          </p>
        </Link>
      </section>
    </div>
  );
}

export default function BuilderToolsPage() {
  return (
    <AdminGuard>
      <BuilderToolsContent />
    </AdminGuard>
  );
}
