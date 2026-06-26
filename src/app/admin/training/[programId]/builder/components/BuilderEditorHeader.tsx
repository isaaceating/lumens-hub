import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type BuilderEditorHeaderProps = {
  programId: string;
  eyebrow: string;
  title: string;
  description: string;
};

export default function BuilderEditorHeader({
  programId,
  eyebrow,
  title,
  description,
}: BuilderEditorHeaderProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/admin/training/${programId}/builder#lessons`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft size={16} /> Back to Lessons
        </Link>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-950 to-indigo-800 p-6 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
            {eyebrow}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-white/75">{description}</p>
          <p className="mt-2 font-mono text-xs text-white/55">Program ID: {programId}</p>
        </div>
      </section>
    </>
  );
}
