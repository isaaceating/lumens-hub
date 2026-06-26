"use client";

import { Pencil, Plus, Save } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import type { TrainingStatus } from "@/lib/training";

export type LessonEditorFormValues = {
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  videoType: string;
  duration: string;
  status: TrainingStatus;
  order: number | "";
};

type CourseOption = {
  id: string;
  label: string;
};

type LessonEditorFormProps = {
  editingLessonId: string | null;
  saving: boolean;
  message: string;
  form: LessonEditorFormValues;
  courseOptions: CourseOption[];
  statusOptions: TrainingStatus[];
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
};

const videoTypeOptions = [
  { value: "youtube", label: "YouTube" },
  { value: "google-drive", label: "Google Drive" },
];

export default function LessonEditorForm({
  editingLessonId,
  saving,
  message,
  form,
  courseOptions,
  statusOptions,
  onChange,
  onSubmit,
  onCancel,
}: LessonEditorFormProps) {
  const hasCustomVideoType =
    form.videoType && !videoTypeOptions.some((option) => option.value === form.videoType);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          {editingLessonId ? <Pencil size={20} /> : <Plus size={20} />}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{editingLessonId ? "Edit Lesson" : "Add Lesson"}</h2>
          <p className="mt-1 text-sm text-slate-500">Edit basic lesson information here. Materials and quiz have dedicated editor pages.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Parent Course</label>
          <select name="courseId" value={form.courseId} onChange={onChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50">
            <option value="">Select course</option>
            {courseOptions.map((course) => (
              <option key={course.id} value={course.id}>{course.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">Create courses first if this list is empty.</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Lesson Title</label>
          <input name="title" value={form.title} onChange={onChange} placeholder="Lesson 1 · Overview" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
          <select name="status" value={form.status} onChange={onChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50">
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Lesson Order</label>
          <input name="order" type="number" value={form.order} onChange={onChange} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Duration</label>
          <input name="duration" value={form.duration} onChange={onChange} placeholder="12 min" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Video Type</label>
          <select name="videoType" value={form.videoType || "youtube"} onChange={onChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50">
            {videoTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
            {hasCustomVideoType && <option value={form.videoType}>{form.videoType}</option>}
          </select>
          <p className="mt-1 text-xs text-slate-500">YouTube and Google Drive videos are embedded on the lesson page when the link format is supported.</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Video URL</label>
          <input name="videoUrl" value={form.videoUrl} onChange={onChange} placeholder="https://..." className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
          <textarea name="description" value={form.description} onChange={onChange} rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="text-sm text-slate-500">{message || "Create or update lesson basic information here."}</div>
          <div className="flex gap-2">
            {editingLessonId && <button type="button" onClick={onCancel} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">Cancel</button>}
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-400">
              <Save size={16} /> {saving ? "Saving..." : editingLessonId ? "Update Lesson" : "Create Lesson"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
