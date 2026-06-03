"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminGuard from "@/app/components/AdminGuard";
import { createCourse } from "@/lib/courses";

function NewCourseContent() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id: "",
    levelId: "level-1",
    title: "",
    duration: "",
    status: "Available",
    description: "",
    overview: "",
    order: 1 as number | "",
    unlockAfter: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedId = form.id.trim();

    if (!trimmedId) {
      alert("Course ID is required.");
      return;
    }

    if (!form.title.trim()) {
      alert("Course title is required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        id: trimmedId,
        title: form.title.trim(),
        duration: form.duration.trim(),
        description: form.description.trim(),
        overview: form.overview.trim(),
        order: form.order === "" ? 0 : Number(form.order),
        unlockAfter: form.unlockAfter.trim() || null,
      };

      await createCourse(payload);

      router.push("/admin/courses");
    } catch (error) {
      console.error("Failed to create course:", error);
      alert("Failed to create course. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.push("/admin/courses")}
          className="mb-4 text-sm text-blue-700 hover:underline"
        >
          ← Back to Courses
        </button>

        <h1 className="text-2xl font-bold text-slate-900">Create Course</h1>
        <p className="mt-2 text-slate-600">
          Add a new course to Lumens Portal training.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Course ID
            </label>
            <input
              name="id"
              value={form.id}
              onChange={handleChange}
              placeholder="course-2"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              Use lowercase letters and hyphens. This cannot be changed later.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Level ID
            </label>
            <select
              name="levelId"
              value={form.levelId}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="level-1">level-1</option>
              <option value="level-2">level-2</option>
              <option value="level-3">level-3</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Duration
            </label>
            <input
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="15 min"
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
              <option value="Available">Available</option>
              <option value="Locked">Locked</option>
              <option value="Coming Soon">Coming Soon</option>
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
              Unlock After
            </label>
            <input
              name="unlockAfter"
              value={form.unlockAfter}
              onChange={handleChange}
              placeholder="course-1"
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
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Overview
            </label>
            <textarea
              name="overview"
              value={form.overview}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-slate-400"
          >
            {saving ? "Saving..." : "Create Course"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/courses")}
            className="rounded-lg bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewCoursePage() {
  return (
    <AdminGuard>
      <NewCourseContent />
    </AdminGuard>
  );
}