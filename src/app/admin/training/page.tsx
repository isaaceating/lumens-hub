"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Copy,
  Eye,
  Filter,
  GraduationCap,
  Layers3,
  LibraryBig,
  Plus,
  Search,
  SlidersHorizontal,
  Archive,
  PauseCircle,
} from "lucide-react";
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

type StatusFilter = "all" | "draft" | "published" | "archived";
type SortKey = "title" | "status" | "courses" | "lessons" | "owner";

const normalize = (value: unknown) => String(value || "").trim();

const getStatusClass = (status: string) => {
  if (status === "published") return "bg-emerald-100 text-emerald-700";
  if (status === "archived") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
};

function AdminTrainingContent() {
  const [programs, setPrograms] = useState<ProgramWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("title");

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

  const stats = useMemo(() => {
    const published = programs.filter((program) => program.status === "published").length;
    const draft = programs.filter((program) => program.status === "draft").length;
    const archived = programs.filter((program) => program.status === "archived").length;
    const courses = programs.reduce((total, program) => total + program.courseCount, 0);
    const lessons = programs.reduce((total, program) => total + program.lessonCount, 0);

    return { published, draft, archived, courses, lessons };
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = programs.filter((program) => {
      const searchable = [
        program.id,
        program.title,
        program.description,
        program.status,
        program.ownerDepartment,
      ]
        .map((item) => normalize(item).toLowerCase())
        .join(" ");

      return (
        (!q || searchable.includes(q)) &&
        (statusFilter === "all" || program.status === statusFilter)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortKey === "courses") return b.courseCount - a.courseCount;
      if (sortKey === "lessons") return b.lessonCount - a.lessonCount;
      if (sortKey === "status") return normalize(a.status).localeCompare(normalize(b.status));
      if (sortKey === "owner") return normalize(a.ownerDepartment).localeCompare(normalize(b.ownerDepartment));
      return normalize(a.title).localeCompare(normalize(b.title));
    });
  }, [programs, query, statusFilter, sortKey]);

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setSortKey("title");
  };

  const applyStatusView = (status: StatusFilter) => {
    setQuery("");
    setStatusFilter(status);
    setSortKey("title");
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
        Loading training programs...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
            <GraduationCap size={14} /> Admin Console
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Training Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Create and manage official training programs, courses, and lessons.
            Published programs appear as native modules under Official Resources.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <SlidersHorizontal size={16} /> Reset view
          </button>

          <Link
            href="/admin/training/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={16} /> New Program
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <button type="button" onClick={() => applyStatusView("all")} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-slate-500">Programs</div><LibraryBig size={18} className="text-slate-400" /></div>
          <div className="mt-3 text-3xl font-bold text-slate-900">{programs.length}</div>
        </button>

        <button type="button" onClick={() => applyStatusView("published")} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-left shadow-sm transition hover:bg-emerald-100">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-emerald-700">Published</div><BadgeCheck size={18} className="text-emerald-500" /></div>
          <div className="mt-3 text-3xl font-bold text-emerald-900">{stats.published}</div>
        </button>

        <button type="button" onClick={() => applyStatusView("draft")} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-slate-500">Drafts</div><PauseCircle size={18} className="text-slate-400" /></div>
          <div className="mt-3 text-3xl font-bold text-slate-900">{stats.draft}</div>
        </button>

        <button type="button" onClick={() => applyStatusView("archived")} className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-left shadow-sm transition hover:bg-amber-100">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-amber-700">Archived</div><Archive size={18} className="text-amber-500" /></div>
          <div className="mt-3 text-3xl font-bold text-amber-900">{stats.archived}</div>
        </button>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-blue-700">Courses</div><Layers3 size={18} className="text-blue-500" /></div>
          <div className="mt-3 text-3xl font-bold text-blue-900">{stats.courses}</div>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5 shadow-sm">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-purple-700">Lessons</div><GraduationCap size={18} className="text-purple-500" /></div>
          <div className="mt-3 text-3xl font-bold text-purple-900">{stats.lessons}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter size={16} /> Filters
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(2,minmax(0,1fr))]">
          <label className="relative block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              placeholder="Search program title, id, owner, description..."
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="all">Status · All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="title">Sort · Title</option>
            <option value="status">Sort · Status</option>
            <option value="courses">Sort · Courses</option>
            <option value="lessons">Sort · Lessons</option>
            <option value="owner">Sort · Owner</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">Training Programs</h2>
            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredPrograms.length} of {programs.length} programs.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Program</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Owner</th>
                <th className="px-5 py-3 font-semibold">Content</th>
                <th className="px-5 py-3 font-semibold">Route</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredPrograms.map((program) => (
                <tr key={program.id} className="transition hover:bg-slate-50/80">
                  <td className="max-w-md px-5 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <GraduationCap size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900">{program.title}</div>
                        <div className="mt-1 break-all font-mono text-xs text-slate-500">{program.id}</div>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                          {program.description || "No description."}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(program.status)}`}>
                        {program.status}
                      </span>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        Native Module
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top text-slate-600">
                    {program.ownerDepartment || "—"}
                  </td>

                  <td className="px-5 py-4 align-top text-slate-600">
                    <div>{program.courseCount} courses</div>
                    <div className="mt-1 text-xs text-slate-500">{program.lessonCount} lessons</div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="font-mono text-xs text-slate-500">/training/{program.id}</div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/training/${program.id}`} className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700">
                        Manage
                      </Link>
                      <Link href={`/training/${program.id}`} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">
                        <Eye size={13} /> Preview
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(program)}
                        disabled={duplicatingId === program.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-400"
                      >
                        <Copy size={13} /> {duplicatingId === program.id ? "Duplicating..." : "Duplicate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPrograms.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    No training programs match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {programs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900">No training programs yet.</h2>
          <p className="mt-2 text-sm text-slate-500">Create your first official training program.</p>
          <Link href="/admin/training/new" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus size={16} /> Create Program
          </Link>
        </div>
      )}
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
