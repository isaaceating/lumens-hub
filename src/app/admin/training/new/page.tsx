"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "@/app/components/AdminGuard";
import { createTrainingProgram, TrainingStatus } from "@/lib/training";

function NewTrainingProgramContent() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id: "",
    title: "",
    description: "",
    type: "product-training",
    ownerDepartment: "PDM",
    status: "draft" as TrainingStatus,
    coverImageUrl: "",
    order: 1 as number | "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const programId = form.id.trim();

    if (!programId) {
      alert("Program ID is required.");
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
        type: form.type,
        ownerDepartment: form.ownerDepartment.trim(),
        status: form.status,
        coverImageUrl: form.coverImageUrl.trim(),
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
    <div>
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.push("/admin/training")}
          className="mb-4 text-sm text-blue-700 hover:underline"
        >
          ← Back to Training Management
        </button>

        <h1 className="text-2xl font-bold text-slate-900">
          Create Training Program
        </h1>
        <p className="mt-2 text-slate-600">
          Create a reusable training program, such as PDM Training, Technical
          Certification, or Sales Certification.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Program ID
            </label>
            <input
              name="id"
              value={form.id}
              onChange={handleChange}
              placeholder="pdm-training"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              Use lowercase letters and hyphens. Example: pdm-training.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="PDM Training"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="product-training">Product Training</option>
              <option value="technical-certification">Technical Certification</option>
              <option value="sales-certification">Sales Certification</option>
              <option value="partner-training">Partner Training</option>
              <option value="onboarding">Onboarding</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Owner Department
            </label>
            <input
              name="ownerDepartment"
              value={form.ownerDepartment}
              onChange={handleChange}
              placeholder="PDM"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Order
            </label>
            <input
              name="order"
              type="number"
              value={form.order}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Cover Image URL
            </label>
            <input
              name="coverImageUrl"
              value={form.coverImageUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-slate-400"
          >
            {saving ? "Saving..." : "Create Program"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/training")}
            className="rounded-lg bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewTrainingProgramPage() {
  return (
    <AdminGuard>
      <NewTrainingProgramContent />
    </AdminGuard>
  );
}