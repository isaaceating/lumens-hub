"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  PauseCircle,
  Save,
  Settings2,
} from "lucide-react";
import AdminGuard from "@/app/components/AdminGuard";
import { createTrainingProgram, TrainingStatus } from "@/lib/training";

const PROGRAM_ID_PATTERN = /^[a-z0-9-]+$/;

const getStatusClass = (status: TrainingStatus) => {
  if (status === "published") return "bg-emerald-100 text-emerald-700";
  if (status === "archived") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
};

const getStatusIcon = (status: TrainingStatus) => {
  if (status === "published") return <BadgeCheck size={13} />;
  return <PauseCircle size={13} />;
};

function NewTrainingProgramContent() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id: "",
    title: "",
    description: "",
    ownerDepartment: "PDM",
    status: "draft" as TrainingStatus,
    order: 1 as number | "",
  });

  const programId = form.id.trim();
  const routePreview = `/training/${programId || "program-id"}`;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => {
      if (name === "id") {
        return {
          ...prev,
          id: value.toLowerCase().replace(/\s+/g, "-"),
        };
      }

      return {
        ...prev,
        [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!programId) {
      alert("Program ID is required.");
      return;
    }

    if (!PROGRAM_ID_PATTERN.test(programId)) {
      alert("Program ID can only use lowercase letters, numbers, and hyphens.");
      return;
    }

    if (!form.title.trim()) {
      alert("Program title is required.");
      return;
    }

    setSaving(true);

    try {
      await createTrainingProgram(programId, {
        title: form.title.trim(),
        description: form.description.trim(),
        ownerDepartment: form.ownerDepartment.trim(),
        status: form.status,
        order: form.order === "" ? 0 : Number(form.order),
      });

      router.push("/admin/training");
    } catch (error) {
      console.error("Failed to create training program:", error);
      alert("Failed to create training program. Please check the Program ID.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/training"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft size={16} /> Back to Training
        </Link>

        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(form.status)}`}>
          {getStatusIcon(form.status)} {form.status}
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 to-blue-800 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <GraduationCap size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create Training Program</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/75">
                Create a reusable official training program, then add sections,
                courses, lessons, materials, and quizzes after it is created.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start gap-3">
            <FileText className="mt-0.5 text-blue-600" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Program Information</h2>
              <p className="mt-1 text-sm text-slate-500">
                Set the system ID, title, owner, and description.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Program ID</label>
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="pdm-training"
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
              <p className="mt-1 text-xs text-slate-500">
                Use lowercase letters, numbers, and hyphens. Example: pdm-training. This cannot be changed later.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="PDM Training"
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Owner Department</label>
              <input
                name="ownerDepartment"
                value={form.ownerDepartment}
                onChange={handleChange}
                placeholder="PDM"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Order</label>
              <input
                name="order"
                type="number"
                value={form.order}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
              <p className="mt-1 text-xs text-slate-500">Smaller numbers appear earlier.</p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe what this training program is for."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <Settings2 className="mt-0.5 text-blue-600" size={20} />
              <div>
                <h2 className="font-semibold text-slate-900">Publish Settings</h2>
                <p className="mt-1 text-sm text-slate-500">Control whether users can see this program.</p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Published programs appear as native training modules under Official Resources.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <LayoutDashboard className="mt-0.5 text-blue-600" size={20} />
              <div>
                <h2 className="font-semibold text-slate-900">Preview</h2>
                <p className="mt-1 text-sm text-slate-500">Summary of what will be created.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(form.status)}`}>
                  {getStatusIcon(form.status)} {form.status}
                </span>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  Native Module
                </span>
              </div>

              <h3 className="mt-4 line-clamp-2 text-lg font-bold text-slate-900">
                {form.title.trim() || "Untitled training program"}
              </h3>
              <p className="mt-1 break-all font-mono text-xs text-slate-500">
                {programId || "program-id"}
              </p>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                {form.description.trim() || "Program description preview."}
              </p>

              <div className="mt-4 space-y-2 text-xs text-slate-500">
                <div>Owner: <span className="font-semibold text-slate-700">{form.ownerDepartment.trim() || "—"}</span></div>
                <div>Route: <span className="font-mono text-slate-700">{routePreview}</span></div>
                <div>Order: <span className="font-semibold text-slate-700">{Number(form.order) || 0}</span></div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">
            Creating <span className="font-semibold text-slate-900">{form.title.trim() || "Untitled training program"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/training" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-400"
            >
              <Save size={16} /> {saving ? "Saving..." : "Create Program"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function NewTrainingProgramPage() {
  return (
    <AdminGuard>
      <NewTrainingProgramContent />
    </AdminGuard>
  );
}
