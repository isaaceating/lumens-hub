"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminGuard from "@/app/components/AdminGuard";
import { getCourseById, updateCourse } from "@/lib/courses";

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    levelId: "level-1",
    duration: "",
    status: "Available",
    description: "",
    overview: "",
    videoId: "",
    materials: [{ name: "", url: "" }],
    order: 1,
    unlockAfter: "",
  });

  useEffect(() => {
    const fetchCourse = async () => {
      const data = await getCourseById(courseId);

      if (data) {
        setForm({
          title: data.title || "",
          levelId: data.levelId || "level-1",
          duration: data.duration || "",
          status: data.status || "Available",
          description: data.description || "",
          overview: data.overview || "",
          videoId: data.videoId || "",
          materials: data.materials?.length ? data.materials : [{ name: "", url: "" }],
          order: data.order || 1,
          unlockAfter: data.unlockAfter || "",
        });
      }

      setLoading(false);
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "order" ? Number(value) : value,
    }));
  };

    const handleMaterialChange = (
      index: number,
      field: "name" | "url",
      value: string
    ) => {
      setForm((prev) => {
        const nextMaterials = [...prev.materials];
        nextMaterials[index] = {
          ...nextMaterials[index],
          [field]: value,
        };

        return {
          ...prev,
          materials: nextMaterials,
        };
      });
    };

    const addMaterial = () => {
      setForm((prev) => ({
        ...prev,
        materials: [...prev.materials, { name: "", url: "" }],
      }));
    };

    const removeMaterial = (index: number) => {
      setForm((prev) => ({
        ...prev,
        materials: prev.materials.filter((_, i) => i !== index),
      }));
    };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    await updateCourse(courseId, {
      ...form,
      unlockAfter: form.unlockAfter || null,
      materials: form.materials.filter(
        (material) => material.name.trim() && material.url.trim()
      ),
    });

    setSaving(false);
    router.push("/admin/courses");
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="text-slate-500">Loading...</div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div>
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin/courses")}
            className="mb-4 text-sm text-blue-700 hover:underline"
          >
            ← Back to Courses
          </button>

          <h1 className="text-2xl font-bold text-slate-900">Edit Course</h1>

          <p className="mt-2 text-slate-600">
            Update course content, video, and publishing settings.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Course ID
              </label>
              <input
                value={courseId}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
              />
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

            <div className="md:col-span-2">
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
                placeholder="10 min"
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

            <div>
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
                YouTube Video ID
              </label>
              <input
                name="videoId"
                value={form.videoId}
                onChange={handleChange}
                placeholder="dQw4w9WgXcQ"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Course Materials
                </label>

                <button
                  type="button"
                  onClick={addMaterial}
                  className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
                >
                  + Add Material
                </button>
              </div>

              <div className="space-y-3">
                {form.materials.map((material, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_2fr_auto]"
                  >
                    <input
                      value={material.name}
                      onChange={(e) =>
                        handleMaterialChange(index, "name", e.target.value)
                      }
                      placeholder="Material name"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />

                    <input
                      value={material.url}
                      onChange={(e) =>
                        handleMaterialChange(index, "url", e.target.value)
                      }
                      placeholder="https://..."
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => removeMaterial(index)}
                      className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
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
              {saving ? "Saving..." : "Save Changes"}
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
    </AdminGuard>
  );
}