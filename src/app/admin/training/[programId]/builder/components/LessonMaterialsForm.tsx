import { ExternalLink, FileText, Plus, Save } from "lucide-react";
import type { FormEvent } from "react";
import type { TrainingMaterial } from "@/lib/training";

const materialTypeOptions = ["slides", "pdf", "doc", "video", "folder", "link"];

type LessonMaterialsFormProps = {
  materials: TrainingMaterial[];
  message: string;
  saving: boolean;
  selectedLessonId: string;
  onSubmit: (event: FormEvent) => void;
  onAddRow: () => void;
  onClearRow: (index: number) => void;
  onMaterialChange: (index: number, field: keyof TrainingMaterial, value: string) => void;
};

export default function LessonMaterialsForm({
  materials,
  message,
  saving,
  selectedLessonId,
  onSubmit,
  onAddRow,
  onClearRow,
  onMaterialChange,
}: LessonMaterialsFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Materials</h2>
          <p className="mt-1 text-sm text-slate-500">Rows with both title and URL will be saved.</p>
        </div>
        <button
          type="button"
          onClick={onAddRow}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
        >
          <Plus size={16} /> Add Row
        </button>
      </div>

      <div className="space-y-4">
        {materials.map((material, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FileText size={16} /> Material {index + 1}
              </div>
              <button
                type="button"
                onClick={() => onClearRow(index)}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
              >
                Clear Row
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_140px_100px]">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">Title</label>
                <input
                  value={material.title}
                  onChange={(event) => onMaterialChange(index, "title", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  placeholder="Sales deck"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">Type</label>
                <select
                  value={material.type}
                  onChange={(event) => onMaterialChange(index, "type", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                >
                  {materialTypeOptions.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">Order</label>
                <input
                  type="number"
                  value={material.order || index + 1}
                  onChange={(event) => onMaterialChange(index, "order", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_180px]">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">URL</label>
                <input
                  value={material.url}
                  onChange={(event) => onMaterialChange(index, "url", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">Button Label</label>
                <input
                  value={material.buttonLabel || ""}
                  onChange={(event) => onMaterialChange(index, "buttonLabel", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  placeholder="Open"
                />
              </div>
            </div>

            {material.url && (
              <a
                href={material.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-700 hover:text-blue-800"
              >
                <ExternalLink size={14} /> Open material URL
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="text-sm text-slate-500">{message || "Save to update this lesson materials."}</div>
        <button
          type="submit"
          disabled={saving || !selectedLessonId}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-400"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save Materials"}
        </button>
      </div>
    </form>
  );
}
