"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Plus, Save } from "lucide-react";
import AdminGuard from "@/app/components/AdminGuard";
import {
  getTrainingCoursesByProgram,
  getTrainingLessonsByProgram,
  getTrainingLevelsByProgram,
  updateTrainingLesson,
  type TrainingCourse,
  type TrainingLesson,
  type TrainingLevel,
  type TrainingMaterial,
} from "@/lib/training";
import LessonPicker from "../components/LessonPicker";

const materialTypeOptions = ["slides", "pdf", "doc", "video", "folder", "link"];

const createEmptyMaterial = (order: number): TrainingMaterial => ({
  title: "",
  type: "link",
  url: "",
  buttonLabel: "",
  order,
});

const sortByOrder = <T extends { order?: number; title?: string }>(items: T[]) =>
  [...items].sort((a, b) => {
    const orderDiff = (a.order || 0) - (b.order || 0);
    if (orderDiff !== 0) return orderDiff;
    return (a.title || "").localeCompare(b.title || "");
  });

const normalizeMaterials = (materials: TrainingMaterial[]) =>
  materials
    .map((material, index) => ({
      title: material.title.trim(),
      type: material.type || "link",
      url: material.url.trim(),
      buttonLabel: material.buttonLabel?.trim() || "",
      order: material.order || index + 1,
    }))
    .filter((material) => material.title && material.url);

function MaterialsEditorContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const programId = params.programId as string;
  const requestedLessonId = searchParams.get("lessonId") || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [sections, setSections] = useState<TrainingLevel[]>([]);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [lessons, setLessons] = useState<TrainingLesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [materials, setMaterials] = useState<TrainingMaterial[]>([createEmptyMaterial(1)]);

  const loadLessonMaterials = (lesson: TrainingLesson | undefined) => {
    if (!lesson) {
      setMaterials([createEmptyMaterial(1)]);
      return;
    }

    setSelectedLessonId(lesson.id);
    setMaterials(lesson.materials?.length ? sortByOrder(lesson.materials) : [createEmptyMaterial(1)]);
  };

  const fetchData = async () => {
    if (!programId) return;

    setLoading(true);
    setMessage("");

    try {
      const [sectionData, courseData, lessonData] = await Promise.all([
        getTrainingLevelsByProgram(programId),
        getTrainingCoursesByProgram(programId),
        getTrainingLessonsByProgram(programId),
      ]);

      setSections(sectionData);
      setCourses(courseData);
      setLessons(lessonData);

      const requestedLesson = requestedLessonId
        ? lessonData.find((lesson) => lesson.id === requestedLessonId)
        : undefined;
      const currentLesson = selectedLessonId
        ? lessonData.find((lesson) => lesson.id === selectedLessonId)
        : undefined;
      const firstLesson = lessonData[0];

      loadLessonMaterials(requestedLesson || currentLesson || firstLesson);
    } catch (error) {
      console.error("Failed to load lesson materials:", error);
      setMessage("Failed to load lesson materials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [programId, requestedLessonId]);

  const handleLessonSelect = (lessonId: string) => {
    const lesson = lessons.find((item) => item.id === lessonId);
    setSelectedLessonId(lessonId);
    setMessage("");
    setMaterials(lesson?.materials?.length ? sortByOrder(lesson.materials) : [createEmptyMaterial(1)]);
  };

  const handleMaterialChange = (
    index: number,
    field: keyof TrainingMaterial,
    value: string
  ) => {
    setMessage("");
    setMaterials((prev) =>
      prev.map((material, materialIndex) =>
        materialIndex === index
          ? {
              ...material,
              [field]: field === "order" ? Number(value) || 0 : value,
            }
          : material
      )
    );
  };

  const addMaterialRow = () => {
    setMaterials((prev) => [...prev, createEmptyMaterial(prev.length + 1)]);
  };

  const clearMaterialRow = (index: number) => {
    setMaterials((prev) =>
      prev.map((material, materialIndex) =>
        materialIndex === index
          ? createEmptyMaterial(material.order || materialIndex + 1)
          : material
      )
    );
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedLessonId) {
      setMessage("Please select a lesson first.");
      return;
    }

    const normalizedMaterials = normalizeMaterials(materials);

    setSaving(true);
    setMessage("");

    try {
      await updateTrainingLesson(selectedLessonId, {
        materials: normalizedMaterials,
      });

      setMessage("Materials saved.");
      const updatedLessons = await getTrainingLessonsByProgram(programId);
      setLessons(updatedLessons);
      const updatedLesson = updatedLessons.find((lesson) => lesson.id === selectedLessonId);
      setMaterials(updatedLesson?.materials?.length ? sortByOrder(updatedLesson.materials) : [createEmptyMaterial(1)]);
    } catch (error) {
      console.error("Failed to save materials:", error);
      setMessage("Failed to save materials.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
        Loading lesson materials...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/admin/training/${programId}/builder`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft size={16} /> Back to Builder
        </Link>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-950 to-indigo-800 p-6 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
            Materials Editor
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Lesson Materials</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-white/75">
            Select a lesson and manage its learning resources. This updates materials only and does not change quiz settings.
          </p>
          <p className="mt-2 font-mono text-xs text-white/55">Program ID: {programId}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <LessonPicker
          sections={sections}
          courses={courses}
          lessons={lessons}
          value={selectedLessonId}
          onChange={handleLessonSelect}
          heading="Select Lesson"
          helperText="Choose which lesson materials to edit."
          metaLabel="Current materials"
          metaValue={(lesson) => lesson.materials?.length || 0}
        />

        <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Materials</h2>
              <p className="mt-1 text-sm text-slate-500">Rows with both title and URL will be saved.</p>
            </div>
            <button
              type="button"
              onClick={addMaterialRow}
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
                    onClick={() => clearMaterialRow(index)}
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
                      onChange={(event) => handleMaterialChange(index, "title", event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                      placeholder="Sales deck"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">Type</label>
                    <select
                      value={material.type}
                      onChange={(event) => handleMaterialChange(index, "type", event.target.value)}
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
                      onChange={(event) => handleMaterialChange(index, "order", event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_180px]">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">URL</label>
                    <input
                      value={material.url}
                      onChange={(event) => handleMaterialChange(index, "url", event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">Button Label</label>
                    <input
                      value={material.buttonLabel || ""}
                      onChange={(event) => handleMaterialChange(index, "buttonLabel", event.target.value)}
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
      </section>
    </div>
  );
}

export default function MaterialsEditorPage() {
  return (
    <AdminGuard>
      <MaterialsEditorContent />
    </AdminGuard>
  );
}
