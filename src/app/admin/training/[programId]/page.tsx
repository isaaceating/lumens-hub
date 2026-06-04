"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminGuard from "@/app/components/AdminGuard";
import {
  createTrainingCourse,
  createTrainingLesson,
  createTrainingLevel,
  deleteTrainingCourse,
  deleteTrainingLesson,
  deleteTrainingLevel,
  getTrainingCoursesByProgram,
  getTrainingLessonsByProgram,
  getTrainingLevelsByProgram,
  getTrainingProgramById,
  TrainingCourse,
  TrainingLesson,
  TrainingLevel,
  TrainingProgram,
  TrainingStatus,
  updateTrainingCourse,
  updateTrainingLesson,
  updateTrainingLevel,
  updateTrainingProgram,
} from "@/lib/training";

const statusOptions: TrainingStatus[] = ["draft", "published", "archived"];

function EditTrainingProgramContent() {
  const params = useParams();
  const router = useRouter();
  const programId = params.programId as string;

  const [loading, setLoading] = useState(true);
  const [programFound, setProgramFound] = useState(true);
  const [savingProgram, setSavingProgram] = useState(false);
  const [savingLevel, setSavingLevel] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);

  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [levels, setLevels] = useState<TrainingLevel[]>([]);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [lessons, setLessons] = useState<TrainingLesson[]>([]);

  const [programForm, setProgramForm] = useState({
    title: "",
    description: "",
    ownerDepartment: "",
    status: "draft" as TrainingStatus,
    order: 1 as number | "",
  });

  const [levelForm, setLevelForm] = useState({
    title: "",
    description: "",
    status: "draft" as TrainingStatus,
    order: 1 as number | "",
  });

  const [courseForm, setCourseForm] = useState({
    levelId: "",
    title: "",
    description: "",
    status: "draft" as TrainingStatus,
    order: 1 as number | "",
  });

  const [lessonForm, setLessonForm] = useState({
    courseId: "",
    title: "",
    description: "",
    videoUrl: "",
    videoType: "youtube",
    duration: "",
    materialTitle: "",
    materialUrl: "",
    materialButtonLabel: "Open Material",
    allowComments: true,
    requireCompletion: true,
    status: "draft" as TrainingStatus,
    order: 1 as number | "",
  });

  const coursesByLevel = useMemo(() => {
    const map = new Map<string, TrainingCourse[]>();

    levels.forEach((level) => {
      map.set(level.id, []);
    });

    map.set("__unassigned__", []);

    courses.forEach((course) => {
      const levelKey = course.levelId || "__unassigned__";
      const existing = map.get(levelKey) || [];
      map.set(levelKey, [...existing, course]);
    });

    return map;
  }, [levels, courses]);

  const lessonsByCourse = useMemo(() => {
    const map = new Map<string, TrainingLesson[]>();

    courses.forEach((course) => {
      map.set(course.id, []);
    });

    lessons.forEach((lesson) => {
      const existing = map.get(lesson.courseId) || [];
      map.set(lesson.courseId, [...existing, lesson]);
    });

    return map;
  }, [courses, lessons]);

  const selectedCourse = useMemo(() => {
    return courses.find((course) => course.id === lessonForm.courseId) || null;
  }, [courses, lessonForm.courseId]);

  const fetchData = async () => {
    if (!programId) return;

    setLoading(true);

    try {
      const programData = await getTrainingProgramById(programId);

      if (!programData) {
        setProgramFound(false);
        return;
      }

      const levelData = await getTrainingLevelsByProgram(programId);
      const courseData = await getTrainingCoursesByProgram(programId);
      const lessonData = await getTrainingLessonsByProgram(programId);

      setProgram(programData);
      setLevels(levelData);
      setCourses(courseData);
      setLessons(lessonData);

      setProgramForm({
        title: programData.title || "",
        description: programData.description || "",
        ownerDepartment: programData.ownerDepartment || "",
        status: programData.status || "draft",
        order: programData.order ?? 1,
      });

      setCourseForm((prev) => ({
        ...prev,
        levelId: levelData[0]?.id || "",
      }));

      setLessonForm((prev) => ({
        ...prev,
        courseId: courseData[0]?.id || "",
      }));

      setProgramFound(true);
    } catch (error) {
      console.error("Failed to load training program:", error);
      setProgramFound(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [programId]);

  const handleProgramChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setProgramForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleLevelChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setLevelForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleCourseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setCourseForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleLessonChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setLessonForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleLessonCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = e.target;

    setLessonForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!programForm.title.trim()) {
      alert("Program title is required.");
      return;
    }

    setSavingProgram(true);

    try {
      await updateTrainingProgram(programId, {
        title: programForm.title.trim(),
        description: programForm.description.trim(),
        ownerDepartment: programForm.ownerDepartment.trim(),
        status: programForm.status,
        order: programForm.order === "" ? 0 : Number(programForm.order),
      });

      await fetchData();
      alert("Program saved.");
    } catch (error) {
      console.error("Failed to save program:", error);
      alert("Failed to save program.");
    } finally {
      setSavingProgram(false);
    }
  };

  const handleCreateLevel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!levelForm.title.trim()) {
      alert("Level title is required.");
      return;
    }

    setSavingLevel(true);

    try {
      await createTrainingLevel({
        programId,
        title: levelForm.title.trim(),
        description: levelForm.description.trim(),
        status: levelForm.status,
        order: levelForm.order === "" ? 0 : Number(levelForm.order),
      });

      setLevelForm({
        title: "",
        description: "",
        status: "draft",
        order: levels.length + 2,
      });

      await fetchData();
    } catch (error) {
      console.error("Failed to create level:", error);
      alert("Failed to create level.");
    } finally {
      setSavingLevel(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseForm.levelId) {
      alert("Please create or select a level first.");
      return;
    }

    if (!courseForm.title.trim()) {
      alert("Course title is required.");
      return;
    }

    setSavingCourse(true);

    try {
      await createTrainingCourse({
        programId,
        levelId: courseForm.levelId,
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        status: courseForm.status,
        order: courseForm.order === "" ? 0 : Number(courseForm.order),
      });

      setCourseForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        status: "draft",
        order: courses.length + 2,
      }));

      await fetchData();
    } catch (error) {
      console.error("Failed to create course:", error);
      alert("Failed to create course.");
    } finally {
      setSavingCourse(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lessonForm.courseId) {
      alert("Please select a course first.");
      return;
    }

    if (!lessonForm.title.trim()) {
      alert("Lesson title is required.");
      return;
    }

    const course = courses.find((item) => item.id === lessonForm.courseId);

    if (!course) {
      alert("Selected course was not found.");
      return;
    }

    const materials =
      lessonForm.materialTitle.trim() && lessonForm.materialUrl.trim()
        ? [
            {
              title: lessonForm.materialTitle.trim(),
              type: "link",
              url: lessonForm.materialUrl.trim(),
              buttonLabel:
                lessonForm.materialButtonLabel.trim() || "Open Material",
              order: 1,
            },
          ]
        : [];

    setSavingLesson(true);

    try {
      await createTrainingLesson({
        programId,
        levelId: course.levelId || "",
        courseId: lessonForm.courseId,
        title: lessonForm.title.trim(),
        description: lessonForm.description.trim(),
        videoUrl: lessonForm.videoUrl.trim(),
        videoType: lessonForm.videoType,
        duration: lessonForm.duration.trim(),
        materials,
        allowComments: lessonForm.allowComments,
        requireCompletion: lessonForm.requireCompletion,
        status: lessonForm.status,
        order: lessonForm.order === "" ? 0 : Number(lessonForm.order),
      });

      setLessonForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        videoUrl: "",
        duration: "",
        materialTitle: "",
        materialUrl: "",
        materialButtonLabel: "Open Material",
        order: lessons.length + 2,
      }));

      await fetchData();
    } catch (error) {
      console.error("Failed to create lesson:", error);
      alert("Failed to create lesson.");
    } finally {
      setSavingLesson(false);
    }
  };

  const handleQuickEditLevel = async (level: TrainingLevel) => {
    const nextTitle = window.prompt("Level title", level.title);

    if (nextTitle === null) return;

    const nextDescription = window.prompt(
      "Level description",
      level.description || ""
    );

    if (nextDescription === null) return;

    try {
      await updateTrainingLevel(level.id, {
        title: nextTitle.trim() || level.title,
        description: nextDescription.trim(),
      });

      await fetchData();
    } catch (error) {
      console.error("Failed to update level:", error);
      alert("Failed to update level.");
    }
  };

  const handleQuickEditCourse = async (course: TrainingCourse) => {
    const nextTitle = window.prompt("Course title", course.title);

    if (nextTitle === null) return;

    const nextDescription = window.prompt(
      "Course description",
      course.description || ""
    );

    if (nextDescription === null) return;

    try {
      await updateTrainingCourse(course.id, {
        title: nextTitle.trim() || course.title,
        description: nextDescription.trim(),
      });

      await fetchData();
    } catch (error) {
      console.error("Failed to update course:", error);
      alert("Failed to update course.");
    }
  };

  const handleQuickEditLesson = async (lesson: TrainingLesson) => {
    const nextTitle = window.prompt("Lesson title", lesson.title);

    if (nextTitle === null) return;

    const nextVideoUrl = window.prompt("Video URL", lesson.videoUrl || "");

    if (nextVideoUrl === null) return;

    try {
      await updateTrainingLesson(lesson.id, {
        title: nextTitle.trim() || lesson.title,
        videoUrl: nextVideoUrl.trim(),
      });

      await fetchData();
    } catch (error) {
      console.error("Failed to update lesson:", error);
      alert("Failed to update lesson.");
    }
  };

  const handleDeleteLevel = async (level: TrainingLevel) => {
    const levelCourses = coursesByLevel.get(level.id) || [];

    if (levelCourses.length > 0) {
      alert("Please delete courses under this level first.");
      return;
    }

    const confirmed = window.confirm(`Delete level "${level.title}"?`);

    if (!confirmed) return;

    try {
      await deleteTrainingLevel(level.id);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete level:", error);
      alert("Failed to delete level.");
    }
  };

  const handleDeleteCourse = async (course: TrainingCourse) => {
    const courseLessons = lessonsByCourse.get(course.id) || [];

    if (courseLessons.length > 0) {
      alert("Please delete lessons under this course first.");
      return;
    }

    const confirmed = window.confirm(`Delete course "${course.title}"?`);

    if (!confirmed) return;

    try {
      await deleteTrainingCourse(course.id);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete course:", error);
      alert("Failed to delete course.");
    }
  };

  const handleDeleteLesson = async (lesson: TrainingLesson) => {
    const confirmed = window.confirm(`Delete lesson "${lesson.title}"?`);

    if (!confirmed) return;

    try {
      await deleteTrainingLesson(lesson.id);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      alert("Failed to delete lesson.");
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading training program...</div>;
  }

  if (!programFound || !program) {
    return (
      <div>
        <button
          type="button"
          onClick={() => router.push("/admin/training")}
          className="mb-4 text-sm text-blue-700 hover:underline"
        >
          ← Back to Training Management
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Training program not found.
        </div>
      </div>
    );
  }

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
          Edit Training Program
        </h1>
        <p className="mt-2 text-slate-600">
          Manage program settings, levels, courses, and lessons.
        </p>
      </div>

      <div className="space-y-8">
        <form
          onSubmit={handleSaveProgram}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Program Settings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Program ID: {programId} · Frontend route: /training/{programId}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                name="title"
                value={programForm.title}
                onChange={handleProgramChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Owner Department
              </label>
              <input
                name="ownerDepartment"
                value={programForm.ownerDepartment}
                onChange={handleProgramChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                name="status"
                value={programForm.status}
                onChange={handleProgramChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Order
              </label>
              <input
                name="order"
                type="number"
                value={programForm.order}
                onChange={handleProgramChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={programForm.description}
                onChange={handleProgramChange}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProgram}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-slate-400"
          >
            {savingProgram ? "Saving..." : "Save Program"}
          </button>
        </form>

        <div className="grid gap-8 xl:grid-cols-3">
          <form
            onSubmit={handleCreateLevel}
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Add Level
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Create a learning level under this program.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Level Title
              </label>
              <input
                name="title"
                value={levelForm.title}
                onChange={handleLevelChange}
                placeholder="Level 1: Basic"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={levelForm.description}
                onChange={handleLevelChange}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  name="status"
                  value={levelForm.status}
                  onChange={handleLevelChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Order
                </label>
                <input
                  name="order"
                  type="number"
                  value={levelForm.order}
                  onChange={handleLevelChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingLevel}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-slate-400"
            >
              {savingLevel ? "Adding..." : "Add Level"}
            </button>
          </form>

          <form
            onSubmit={handleCreateCourse}
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Add Course
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add a course under a selected level.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Level
              </label>
              <select
                name="levelId"
                value={courseForm.levelId}
                onChange={handleCourseChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select level</option>
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Course Title
              </label>
              <input
                name="title"
                value={courseForm.title}
                onChange={handleCourseChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={courseForm.description}
                onChange={handleCourseChange}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  name="status"
                  value={courseForm.status}
                  onChange={handleCourseChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Order
                </label>
                <input
                  name="order"
                  type="number"
                  value={courseForm.order}
                  onChange={handleCourseChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingCourse}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-slate-400"
            >
              {savingCourse ? "Adding..." : "Add Course"}
            </button>
          </form>

          <form
            onSubmit={handleCreateLesson}
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Add Lesson
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add a lesson under a selected course.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Course
              </label>
              <select
                name="courseId"
                value={lessonForm.courseId}
                onChange={handleLessonChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>

              {selectedCourse && (
                <p className="mt-1 text-xs text-slate-500">
                  Level ID: {selectedCourse.levelId || "unassigned"}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Lesson Title
              </label>
              <input
                name="title"
                value={lessonForm.title}
                onChange={handleLessonChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={lessonForm.description}
                onChange={handleLessonChange}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Video Type
                </label>
                <select
                  name="videoType"
                  value={lessonForm.videoType}
                  onChange={handleLessonChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="youtube">YouTube</option>
                  <option value="google-drive">Google Drive</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="external">External URL</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Duration
                </label>
                <input
                  name="duration"
                  value={lessonForm.duration}
                  onChange={handleLessonChange}
                  placeholder="10 min"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Video URL
              </label>
              <input
                name="videoUrl"
                value={lessonForm.videoUrl}
                onChange={handleLessonChange}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-4">
              <input
                name="materialTitle"
                value={lessonForm.materialTitle}
                onChange={handleLessonChange}
                placeholder="Material title"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />

              <input
                name="materialUrl"
                value={lessonForm.materialUrl}
                onChange={handleLessonChange}
                placeholder="Material URL"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />

              <input
                name="materialButtonLabel"
                value={lessonForm.materialButtonLabel}
                onChange={handleLessonChange}
                placeholder="Button label"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  name="allowComments"
                  type="checkbox"
                  checked={lessonForm.allowComments}
                  onChange={handleLessonCheckboxChange}
                />
                Allow comments
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  name="requireCompletion"
                  type="checkbox"
                  checked={lessonForm.requireCompletion}
                  onChange={handleLessonCheckboxChange}
                />
                Require completion
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  name="status"
                  value={lessonForm.status}
                  onChange={handleLessonChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Order
                </label>
                <input
                  name="order"
                  type="number"
                  value={lessonForm.order}
                  onChange={handleLessonChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingLesson}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-slate-400"
            >
              {savingLesson ? "Adding..." : "Add Lesson"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Program Structure
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review and manage the learning path by level, course, and lesson.
            </p>
          </div>

          <div className="space-y-6">
            {levels.map((level) => {
              const levelCourses = coursesByLevel.get(level.id) || [];

              return (
                <div
                  key={level.id}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">
                          Level {level.order || 0}: {level.title}
                        </h3>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                          {level.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {level.description || "No description."}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickEditLevel(level)}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteLevel(level)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {levelCourses.map((course) => {
                      const courseLessons = lessonsByCourse.get(course.id) || [];

                      return (
                        <div
                          key={course.id}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h4 className="font-semibold text-slate-800">
                                  Course {course.order || 0}: {course.title}
                                </h4>
                                <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-500">
                                  {course.status}
                                </span>
                              </div>

                              <p className="mt-1 text-sm text-slate-500">
                                {course.description || "No description."}
                              </p>
                            </div>

                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() => handleQuickEditCourse(course)}
                                className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteCourse(course)}
                                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 space-y-3">
                            {courseLessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex flex-col gap-3 rounded-lg bg-white p-4 md:flex-row md:items-start md:justify-between"
                              >
                                <div>
                                  <div className="flex flex-wrap items-center gap-3">
                                    <h5 className="font-medium text-slate-800">
                                      Lesson {lesson.order || 0}: {lesson.title}
                                    </h5>
                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                                      {lesson.status}
                                    </span>
                                    {lesson.duration && (
                                      <span className="text-xs text-slate-500">
                                        {lesson.duration}
                                      </span>
                                    )}
                                  </div>

                                  <p className="mt-1 text-sm text-slate-500">
                                    {lesson.description || "No description."}
                                  </p>

                                  {lesson.videoUrl && (
                                    <p className="mt-1 break-all text-xs text-blue-700">
                                      {lesson.videoUrl}
                                    </p>
                                  )}

                                  {lesson.materials && lesson.materials.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {lesson.materials.map((material, index) => (
                                        <a
                                          key={`${lesson.id}-${index}`}
                                          href={material.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-700 hover:bg-slate-200"
                                        >
                                          {material.buttonLabel || material.title}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="flex shrink-0 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickEditLesson(lesson)}
                                    className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLesson(lesson)}
                                    className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}

                            {courseLessons.length === 0 && (
                              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                                No lessons under this course yet.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {levelCourses.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                        No courses under this level yet.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {levels.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                No levels yet. Add your first level above.
              </div>
            )}

            {(coursesByLevel.get("__unassigned__") || []).length > 0 && (
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                <h3 className="font-semibold text-orange-800">
                  Unassigned Courses
                </h3>
                <p className="mt-1 text-sm text-orange-700">
                  These courses were created before the Level structure was added.
                  Recreate them under a level or update them in the next editor version.
                </p>

                <div className="mt-4 space-y-3">
                  {(coursesByLevel.get("__unassigned__") || []).map((course) => (
                    <div
                      key={course.id}
                      className="rounded-xl bg-white p-4 text-sm text-slate-700"
                    >
                      {course.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditTrainingProgramPage() {
  return (
    <AdminGuard>
      <EditTrainingProgramContent />
    </AdminGuard>
  );
}