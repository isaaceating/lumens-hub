"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
import BuilderEditorShell from "../components/BuilderEditorShell";
import LessonMaterialsForm from "../components/LessonMaterialsForm";
import LessonPicker from "../components/LessonPicker";

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
    <BuilderEditorShell
      programId={programId}
      eyebrow="Materials Editor"
      title="Lesson Materials"
      description="Select a lesson and manage its learning resources. This updates materials only and does not change quiz settings."
      sidebar={
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
      }
    >
      <LessonMaterialsForm
        materials={materials}
        message={message}
        saving={saving}
        selectedLessonId={selectedLessonId}
        onSubmit={handleSave}
        onAddRow={addMaterialRow}
        onClearRow={clearMaterialRow}
        onMaterialChange={handleMaterialChange}
      />
    </BuilderEditorShell>
  );
}

export default function MaterialsEditorPage() {
  return (
    <AdminGuard>
      <MaterialsEditorContent />
    </AdminGuard>
  );
}
