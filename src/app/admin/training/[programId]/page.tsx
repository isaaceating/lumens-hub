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
  TrainingMaterial,
  TrainingProgram,
  TrainingQuizQuestion,
  TrainingStatus,
  updateTrainingCourse,
  updateTrainingLesson,
  updateTrainingLevel,
  updateTrainingProgram,
} from "@/lib/training";

const statusOptions: TrainingStatus[] = ["draft", "published", "archived"];
const materialTypeOptions = ["slides", "pdf", "doc", "video", "folder", "link"];

const createEmptyMaterial = (order: number): TrainingMaterial => ({
  title: "",
  type: "link",
  url: "",
  order,
});

const createEmptyQuizQuestion = (order: number): TrainingQuizQuestion => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswerIndex: 0,
  explanation: "",
  order,
});

const normalizeMaterials = (materials: TrainingMaterial[]) => {
  return materials
    .map((material, index) => ({
      title: material.title.trim(),
      type: material.type || "link",
      url: material.url.trim(),
      order: material.order || index + 1,
    }))
    .filter((material) => material.title && material.url);
};

const normalizeQuizQuestions = (questions: TrainingQuizQuestion[]) => {
  return questions
    .map((question, index) => {
      const options = (question.options || [])
        .map((option) => option.trim())
        .filter(Boolean);

      const safeCorrectAnswerIndex =
        question.correctAnswerIndex >= 0 &&
        question.correctAnswerIndex < options.length
          ? question.correctAnswerIndex
          : 0;

      return {
        question: question.question.trim(),
        options,
        correctAnswerIndex: safeCorrectAnswerIndex,
        explanation: question.explanation?.trim() || "",
        order: question.order || index + 1,
      };
    })
    .filter((question) => question.question && question.options.length >= 2);
};

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

  const [updatingLevelId, setUpdatingLevelId] = useState<string | null>(null);
  const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null);
  const [updatingLessonId, setUpdatingLessonId] = useState<string | null>(null);

  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [levels, setLevels] = useState<TrainingLevel[]>([]);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [lessons, setLessons] = useState<TrainingLesson[]>([]);

  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

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
    materials: [createEmptyMaterial(1)] as TrainingMaterial[],
    allowComments: true,
    requireCompletion: true,
    hasQuiz: false,
    quizRequired: false,
    quizPassScore: 80 as number | "",
    quizQuestions: [createEmptyQuizQuestion(1)] as TrainingQuizQuestion[],
    status: "draft" as TrainingStatus,
    order: 1 as number | "",
  });

  const [editLevelForm, setEditLevelForm] = useState({
    title: "",
    description: "",
    status: "draft" as TrainingStatus,
    order: 1 as number | "",
  });

  const [editCourseForm, setEditCourseForm] = useState({
    levelId: "",
    title: "",
    description: "",
    status: "draft" as TrainingStatus,
    order: 1 as number | "",
  });

  const [editLessonForm, setEditLessonForm] = useState({
    courseId: "",
    title: "",
    description: "",
    videoUrl: "",
    videoType: "youtube",
    duration: "",
    materials: [createEmptyMaterial(1)] as TrainingMaterial[],
    allowComments: true,
    requireCompletion: true,
    hasQuiz: false,
    quizRequired: false,
    quizPassScore: 80 as number | "",
    quizQuestions: [createEmptyQuizQuestion(1)] as TrainingQuizQuestion[],
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setProgramForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleLevelChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setLevelForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleCourseChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setCourseForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleLessonChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setLessonForm((prev) => ({
      ...prev,
      [name]:
        name === "order" || name === "quizPassScore"
          ? value === ""
            ? ""
            : Number(value)
          : value,
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

  const handleEditLevelChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setEditLevelForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleEditCourseChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setEditCourseForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleEditLessonChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setEditLessonForm((prev) => ({
      ...prev,
      [name]:
        name === "order" || name === "quizPassScore"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleEditLessonCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = e.target;

    setEditLessonForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const updateLessonMaterial = (
    index: number,
    field: keyof TrainingMaterial,
    value: string | number
  ) => {
    setLessonForm((prev) => {
      const nextMaterials = [...prev.materials];

      nextMaterials[index] = {
        ...nextMaterials[index],
        [field]: field === "order" ? Number(value) : value,
      };

      return {
        ...prev,
        materials: nextMaterials,
      };
    });
  };

  const addLessonMaterial = () => {
    setLessonForm((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        createEmptyMaterial(prev.materials.length + 1),
      ],
    }));
  };

  const removeLessonMaterial = (index: number) => {
    setLessonForm((prev) => ({
      ...prev,
      materials:
        prev.materials.length === 1
          ? [createEmptyMaterial(1)]
          : prev.materials.filter((_, materialIndex) => materialIndex !== index),
    }));
  };

  const updateEditLessonMaterial = (
    index: number,
    field: keyof TrainingMaterial,
    value: string | number
  ) => {
    setEditLessonForm((prev) => {
      const nextMaterials = [...prev.materials];

      nextMaterials[index] = {
        ...nextMaterials[index],
        [field]: field === "order" ? Number(value) : value,
      };

      return {
        ...prev,
        materials: nextMaterials,
      };
    });
  };

  const addEditLessonMaterial = () => {
    setEditLessonForm((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        createEmptyMaterial(prev.materials.length + 1),
      ],
    }));
  };

  const removeEditLessonMaterial = (index: number) => {
    setEditLessonForm((prev) => ({
      ...prev,
      materials:
        prev.materials.length === 1
          ? [createEmptyMaterial(1)]
          : prev.materials.filter((_, materialIndex) => materialIndex !== index),
    }));
  };

  const updateLessonQuizQuestion = (
    index: number,
    field: keyof TrainingQuizQuestion,
    value: string | number
  ) => {
    setLessonForm((prev) => {
      const nextQuestions = [...prev.quizQuestions];

      nextQuestions[index] = {
        ...nextQuestions[index],
        [field]:
          field === "correctAnswerIndex" || field === "order"
            ? Number(value)
            : value,
      };

      return {
        ...prev,
        quizQuestions: nextQuestions,
      };
    });
  };

  const updateLessonQuizOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setLessonForm((prev) => {
      const nextQuestions = [...prev.quizQuestions];
      const nextOptions = [...(nextQuestions[questionIndex].options || [])];

      nextOptions[optionIndex] = value;

      nextQuestions[questionIndex] = {
        ...nextQuestions[questionIndex],
        options: nextOptions,
      };

      return {
        ...prev,
        quizQuestions: nextQuestions,
      };
    });
  };

  const addLessonQuizQuestion = () => {
    setLessonForm((prev) => ({
      ...prev,
      quizQuestions: [
        ...prev.quizQuestions,
        createEmptyQuizQuestion(prev.quizQuestions.length + 1),
      ],
    }));
  };

  const removeLessonQuizQuestion = (index: number) => {
    setLessonForm((prev) => ({
      ...prev,
      quizQuestions:
        prev.quizQuestions.length === 1
          ? [createEmptyQuizQuestion(1)]
          : prev.quizQuestions.filter(
              (_, questionIndex) => questionIndex !== index
            ),
    }));
  };

  const updateEditLessonQuizQuestion = (
    index: number,
    field: keyof TrainingQuizQuestion,
    value: string | number
  ) => {
    setEditLessonForm((prev) => {
      const nextQuestions = [...prev.quizQuestions];

      nextQuestions[index] = {
        ...nextQuestions[index],
        [field]:
          field === "correctAnswerIndex" || field === "order"
            ? Number(value)
            : value,
      };

      return {
        ...prev,
        quizQuestions: nextQuestions,
      };
    });
  };

  const updateEditLessonQuizOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setEditLessonForm((prev) => {
      const nextQuestions = [...prev.quizQuestions];
      const nextOptions = [...(nextQuestions[questionIndex].options || [])];

      nextOptions[optionIndex] = value;

      nextQuestions[questionIndex] = {
        ...nextQuestions[questionIndex],
        options: nextOptions,
      };

      return {
        ...prev,
        quizQuestions: nextQuestions,
      };
    });
  };

  const addEditLessonQuizQuestion = () => {
    setEditLessonForm((prev) => ({
      ...prev,
      quizQuestions: [
        ...prev.quizQuestions,
        createEmptyQuizQuestion(prev.quizQuestions.length + 1),
      ],
    }));
  };

  const removeEditLessonQuizQuestion = (index: number) => {
    setEditLessonForm((prev) => ({
      ...prev,
      quizQuestions:
        prev.quizQuestions.length === 1
          ? [createEmptyQuizQuestion(1)]
          : prev.quizQuestions.filter(
              (_, questionIndex) => questionIndex !== index
            ),
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
      alert("Section title is required.");
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
      console.error("Failed to create section:", error);
      alert("Failed to create section.");
    } finally {
      setSavingLevel(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseForm.title.trim()) {
      alert("Course title is required.");
      return;
    }

    setSavingCourse(true);

    try {
      await createTrainingCourse({
        programId,
        levelId: courseForm.levelId || "",
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        status: courseForm.status,
        order: courseForm.order === "" ? 0 : Number(courseForm.order),
      });

      setCourseForm((prev) => ({
        ...prev,
        title: "",
        description: "",
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

    const materials = normalizeMaterials(lessonForm.materials);
    const quizQuestions = lessonForm.hasQuiz
      ? normalizeQuizQuestions(lessonForm.quizQuestions)
      : [];

    if (lessonForm.hasQuiz && quizQuestions.length === 0) {
      alert("Please add at least one valid quiz question.");
      return;
    }

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
        hasQuiz: lessonForm.hasQuiz,
        quizRequired: lessonForm.hasQuiz ? lessonForm.quizRequired : false,
        quizPassScore:
          lessonForm.quizPassScore === "" ? 80 : Number(lessonForm.quizPassScore),
        quizQuestions,
        status: lessonForm.status,
        order: lessonForm.order === "" ? 0 : Number(lessonForm.order),
      });

      setLessonForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        videoUrl: "",
        duration: "",
        materials: [createEmptyMaterial(1)],
        hasQuiz: false,
        quizRequired: false,
        quizPassScore: 80,
        quizQuestions: [createEmptyQuizQuestion(1)],
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

  const startEditLevel = (level: TrainingLevel) => {
    setEditingLevelId(level.id);
    setEditingCourseId(null);
    setEditingLessonId(null);

    setEditLevelForm({
      title: level.title || "",
      description: level.description || "",
      status: level.status || "draft",
      order: level.order ?? 1,
    });
  };

  const startEditCourse = (course: TrainingCourse) => {
    setEditingCourseId(course.id);
    setEditingLevelId(null);
    setEditingLessonId(null);

    setEditCourseForm({
      levelId: course.levelId || "",
      title: course.title || "",
      description: course.description || "",
      status: course.status || "draft",
      order: course.order ?? 1,
    });
  };

  const startEditLesson = (lesson: TrainingLesson) => {
    setEditingLessonId(lesson.id);
    setEditingLevelId(null);
    setEditingCourseId(null);

    setEditLessonForm({
      courseId: lesson.courseId || "",
      title: lesson.title || "",
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || "",
      videoType: lesson.videoType || "youtube",
      duration: lesson.duration || "",
      materials:
        lesson.materials && lesson.materials.length > 0
          ? lesson.materials
          : [createEmptyMaterial(1)],
      allowComments: lesson.allowComments ?? true,
      requireCompletion: lesson.requireCompletion ?? true,
      hasQuiz: lesson.hasQuiz ?? false,
      quizRequired: lesson.quizRequired ?? false,
      quizPassScore: lesson.quizPassScore ?? 80,
      quizQuestions:
        lesson.quizQuestions && lesson.quizQuestions.length > 0
          ? lesson.quizQuestions
          : [createEmptyQuizQuestion(1)],
      status: lesson.status || "draft",
      order: lesson.order ?? 1,
    });
  };

  const cancelEdit = () => {
    setEditingLevelId(null);
    setEditingCourseId(null);
    setEditingLessonId(null);
  };

  const handleSaveLevelEdit = async (levelId: string) => {
    if (!editLevelForm.title.trim()) {
      alert("Section title is required.");
      return;
    }

    setUpdatingLevelId(levelId);

    try {
      await updateTrainingLevel(levelId, {
        title: editLevelForm.title.trim(),
        description: editLevelForm.description.trim(),
        status: editLevelForm.status,
        order: editLevelForm.order === "" ? 0 : Number(editLevelForm.order),
      });

      cancelEdit();
      await fetchData();
    } catch (error) {
      console.error("Failed to update section:", error);
      alert("Failed to update section.");
    } finally {
      setUpdatingLevelId(null);
    }
  };

  const handleSaveCourseEdit = async (courseId: string) => {
    if (!editCourseForm.title.trim()) {
      alert("Course title is required.");
      return;
    }

    setUpdatingCourseId(courseId);

    try {
      await updateTrainingCourse(courseId, {
        levelId: editCourseForm.levelId || "",
        title: editCourseForm.title.trim(),
        description: editCourseForm.description.trim(),
        status: editCourseForm.status,
        order: editCourseForm.order === "" ? 0 : Number(editCourseForm.order),
      });

      const courseLessons = lessonsByCourse.get(courseId) || [];

      await Promise.all(
        courseLessons.map((lesson) =>
          updateTrainingLesson(lesson.id, {
            levelId: editCourseForm.levelId || "",
          })
        )
      );

      cancelEdit();
      await fetchData();
    } catch (error) {
      console.error("Failed to update course:", error);
      alert("Failed to update course.");
    } finally {
      setUpdatingCourseId(null);
    }
  };

  const handleSaveLessonEdit = async (lessonId: string) => {
    if (!editLessonForm.courseId) {
      alert("Please select a course.");
      return;
    }

    if (!editLessonForm.title.trim()) {
      alert("Lesson title is required.");
      return;
    }

    const targetCourse = courses.find(
      (course) => course.id === editLessonForm.courseId
    );

    if (!targetCourse) {
      alert("Selected course was not found.");
      return;
    }

    const quizQuestions = editLessonForm.hasQuiz
      ? normalizeQuizQuestions(editLessonForm.quizQuestions)
      : [];

    if (editLessonForm.hasQuiz && quizQuestions.length === 0) {
      alert("Please add at least one valid quiz question.");
      return;
    }

    setUpdatingLessonId(lessonId);

    try {
      await updateTrainingLesson(lessonId, {
        courseId: editLessonForm.courseId,
        levelId: targetCourse.levelId || "",
        title: editLessonForm.title.trim(),
        description: editLessonForm.description.trim(),
        videoUrl: editLessonForm.videoUrl.trim(),
        videoType: editLessonForm.videoType,
        duration: editLessonForm.duration.trim(),
        materials: normalizeMaterials(editLessonForm.materials),
        allowComments: editLessonForm.allowComments,
        requireCompletion: editLessonForm.requireCompletion,
        hasQuiz: editLessonForm.hasQuiz,
        quizRequired: editLessonForm.hasQuiz ? editLessonForm.quizRequired : false,
        quizPassScore:
          editLessonForm.quizPassScore === ""
            ? 80
            : Number(editLessonForm.quizPassScore),
        quizQuestions,
        status: editLessonForm.status,
        order: editLessonForm.order === "" ? 0 : Number(editLessonForm.order),
      });

      cancelEdit();
      await fetchData();
    } catch (error) {
      console.error("Failed to update lesson:", error);
      alert("Failed to update lesson.");
    } finally {
      setUpdatingLessonId(null);
    }
  };

  const handleDeleteLevel = async (level: TrainingLevel) => {
    const levelCourses = coursesByLevel.get(level.id) || [];

    if (levelCourses.length > 0) {
      alert("Please delete courses under this section first.");
      return;
    }

    const confirmed = window.confirm(`Delete section "${level.title}"?`);

    if (!confirmed) return;

    try {
      await deleteTrainingLevel(level.id);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete section:", error);
      alert("Failed to delete section.");
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

  const renderMaterialsEditor = ({
    materials,
    onAdd,
    onRemove,
    onUpdate,
    editMode = false,
  }: {
    materials: TrainingMaterial[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (
      index: number,
      field: keyof TrainingMaterial,
      value: string | number
    ) => void;
    editMode?: boolean;
  }) => {
    return (
      <div
        className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${
          editMode ? "md:col-span-2" : ""
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-slate-900">Materials</h4>
            <p className="mt-1 text-xs text-slate-500">
              Add training PPT, PDF, recording, FAQ, folder, or external links.
            </p>
          </div>

          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-white hover:bg-slate-700"
          >
            + Add Material
          </button>
        </div>

        <div className="space-y-4">
          {materials.map((material, index) => (
            <div
              key={`material-${editMode ? "edit" : "create"}-${index}`}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h5 className="text-sm font-semibold text-slate-700">
                  Material {index + 1}
                </h5>

                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-3">
                <input
                  value={material.title}
                  onChange={(e) => onUpdate(index, "title", e.target.value)}
                  placeholder="Material title"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />

                <select
                  value={material.type}
                  onChange={(e) => onUpdate(index, "type", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {materialTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <input
                  value={material.url}
                  onChange={(e) => onUpdate(index, "url", e.target.value)}
                  placeholder="Material URL"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />

                <input
                  type="number"
                  value={material.order || index + 1}
                  onChange={(e) => onUpdate(index, "order", e.target.value)}
                  placeholder="Order"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQuizEditor = ({
    hasQuiz,
    quizRequired,
    quizPassScore,
    questions,
    onCheckboxChange,
    onPassScoreChange,
    onAddQuestion,
    onRemoveQuestion,
    onUpdateQuestion,
    onUpdateOption,
    editMode = false,
  }: {
    hasQuiz: boolean;
    quizRequired: boolean;
    quizPassScore: number | "";
    questions: TrainingQuizQuestion[];
    onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPassScoreChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;
    onAddQuestion: () => void;
    onRemoveQuestion: (index: number) => void;
    onUpdateQuestion: (
      index: number,
      field: keyof TrainingQuizQuestion,
      value: string | number
    ) => void;
    onUpdateOption: (
      questionIndex: number,
      optionIndex: number,
      value: string
    ) => void;
    editMode?: boolean;
  }) => {
    return (
      <div
        className={`rounded-xl border border-blue-100 bg-blue-50/70 p-4 ${
          editMode ? "md:col-span-2" : ""
        }`}
      >
        <div className="mb-4">
          <h4 className="font-semibold text-slate-900">Quiz Settings</h4>
          <p className="mt-1 text-xs text-slate-500">
            Add a short knowledge check for this lesson. Currently supports
            single-choice questions.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              name="hasQuiz"
              type="checkbox"
              checked={hasQuiz}
              onChange={onCheckboxChange}
            />
            Enable quiz for this lesson
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              name="quizRequired"
              type="checkbox"
              checked={quizRequired}
              onChange={onCheckboxChange}
              disabled={!hasQuiz}
            />
            Require quiz pass to complete lesson
          </label>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Passing Score
            </label>
            <input
              name="quizPassScore"
              type="number"
              min={0}
              max={100}
              value={quizPassScore}
              onChange={onPassScoreChange}
              disabled={!hasQuiz}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
            />
          </div>
        </div>

        {hasQuiz && (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h5 className="text-sm font-semibold text-slate-900">
                  Questions
                </h5>
                <p className="mt-1 text-xs text-slate-500">
                  Each question should have at least two options.
                </p>
              </div>

              <button
                type="button"
                onClick={onAddQuestion}
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
              >
                + Add Question
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((question, questionIndex) => (
                <div
                  key={`quiz-question-${editMode ? "edit" : "create"}-${questionIndex}`}
                  className="rounded-xl border border-blue-100 bg-white p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h6 className="text-sm font-semibold text-slate-700">
                      Question {questionIndex + 1}
                    </h6>

                    <button
                      type="button"
                      onClick={() => onRemoveQuestion(questionIndex)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3">
                    <textarea
                      value={question.question}
                      onChange={(e) =>
                        onUpdateQuestion(
                          questionIndex,
                          "question",
                          e.target.value
                        )
                      }
                      rows={2}
                      placeholder="Question text"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      {(question.options || ["", "", "", ""]).map(
                        (option, optionIndex) => (
                          <input
                            key={`option-${optionIndex}`}
                            value={option}
                            onChange={(e) =>
                              onUpdateOption(
                                questionIndex,
                                optionIndex,
                                e.target.value
                              )
                            }
                            placeholder={`Option ${String.fromCharCode(
                              65 + optionIndex
                            )}`}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                        )
                      )}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Correct Answer
                        </label>
                        <select
                          value={question.correctAnswerIndex}
                          onChange={(e) =>
                            onUpdateQuestion(
                              questionIndex,
                              "correctAnswerIndex",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        >
                          {(question.options || ["", "", "", ""]).map(
                            (_, optionIndex) => (
                              <option key={optionIndex} value={optionIndex}>
                                Option {String.fromCharCode(65 + optionIndex)}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Order
                        </label>
                        <input
                          type="number"
                          value={question.order || questionIndex + 1}
                          onChange={(e) =>
                            onUpdateQuestion(
                              questionIndex,
                              "order",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <textarea
                      value={question.explanation || ""}
                      onChange={(e) =>
                        onUpdateQuestion(
                          questionIndex,
                          "explanation",
                          e.target.value
                        )
                      }
                      rows={2}
                      placeholder="Explanation shown after answering, optional"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLessonEditForm = (lesson: TrainingLesson) => {
    return (
      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <h5 className="mb-4 font-semibold text-blue-900">Edit Lesson</h5>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Course
            </label>
            <select
              name="courseId"
              value={editLessonForm.courseId}
              onChange={handleEditLessonChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Moving this lesson will also update its section automatically.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Lesson Title
            </label>
            <input
              name="title"
              value={editLessonForm.title}
              onChange={handleEditLessonChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Video Type
            </label>
            <select
              name="videoType"
              value={editLessonForm.videoType}
              onChange={handleEditLessonChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="youtube">YouTube</option>
              <option value="google-drive">Google Drive</option>
              <option value="vimeo">Vimeo</option>
              <option value="external">External URL</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Duration
            </label>
            <input
              name="duration"
              value={editLessonForm.duration}
              onChange={handleEditLessonChange}
              placeholder="10 min"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Video URL
            </label>
            <input
              name="videoUrl"
              value={editLessonForm.videoUrl}
              onChange={handleEditLessonChange}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              name="status"
              value={editLessonForm.status}
              onChange={handleEditLessonChange}
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
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Order
            </label>
            <input
              name="order"
              type="number"
              value={editLessonForm.order}
              onChange={handleEditLessonChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              value={editLessonForm.description}
              onChange={handleEditLessonChange}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {renderMaterialsEditor({
            materials: editLessonForm.materials,
            onAdd: addEditLessonMaterial,
            onRemove: removeEditLessonMaterial,
            onUpdate: updateEditLessonMaterial,
            editMode: true,
          })}

          {renderQuizEditor({
            hasQuiz: editLessonForm.hasQuiz,
            quizRequired: editLessonForm.quizRequired,
            quizPassScore: editLessonForm.quizPassScore,
            questions: editLessonForm.quizQuestions,
            onCheckboxChange: handleEditLessonCheckboxChange,
            onPassScoreChange: handleEditLessonChange,
            onAddQuestion: addEditLessonQuizQuestion,
            onRemoveQuestion: removeEditLessonQuizQuestion,
            onUpdateQuestion: updateEditLessonQuizQuestion,
            onUpdateOption: updateEditLessonQuizOption,
            editMode: true,
          })}

          <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                name="allowComments"
                type="checkbox"
                checked={editLessonForm.allowComments}
                onChange={handleEditLessonCheckboxChange}
              />
              Allow comments
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                name="requireCompletion"
                type="checkbox"
                checked={editLessonForm.requireCompletion}
                onChange={handleEditLessonCheckboxChange}
              />
              Require completion
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleSaveLessonEdit(lesson.id)}
            disabled={updatingLessonId === lesson.id}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-slate-400"
          >
            {updatingLessonId === lesson.id ? "Saving..." : "Save Lesson"}
          </button>

          <button
            type="button"
            onClick={cancelEdit}
            className="rounded-lg bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    );
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
          Back to Training Management
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
          Back to Training Management
        </button>

        <h1 className="text-2xl font-bold text-slate-900">
          Edit Training Program
        </h1>
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
              Program ID: {programId} | Frontend route: /training/{programId}
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

        <form
          onSubmit={handleCreateLevel}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Add Section
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Sections are optional and can be used like levels, phases, or
              chapters.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <input
              name="title"
              value={levelForm.title}
              onChange={handleLevelChange}
              placeholder="Section title"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <select
              name="status"
              value={levelForm.status}
              onChange={handleLevelChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <input
              name="order"
              type="number"
              value={levelForm.order}
              onChange={handleLevelChange}
              placeholder="Order"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <textarea
              name="description"
              value={levelForm.description}
              onChange={handleLevelChange}
              placeholder="Description"
              rows={3}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            />
          </div>

          <button
            type="submit"
            disabled={savingLevel}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-slate-400"
          >
            {savingLevel ? "Adding..." : "Add Section"}
          </button>
        </form>

        <form
          onSubmit={handleCreateCourse}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Add Course
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <select
              name="levelId"
              value={courseForm.levelId}
              onChange={handleCourseChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">No section</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.title}
                </option>
              ))}
            </select>

            <input
              name="title"
              value={courseForm.title}
              onChange={handleCourseChange}
              placeholder="Course title"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <select
              name="status"
              value={courseForm.status}
              onChange={handleCourseChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <input
              name="order"
              type="number"
              value={courseForm.order}
              onChange={handleCourseChange}
              placeholder="Order"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <textarea
              name="description"
              value={courseForm.description}
              onChange={handleCourseChange}
              placeholder="Description"
              rows={3}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            />
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
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Add Lesson
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <select
              name="courseId"
              value={lessonForm.courseId}
              onChange={handleLessonChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>

            <input
              name="title"
              value={lessonForm.title}
              onChange={handleLessonChange}
              placeholder="Lesson title"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <select
              name="videoType"
              value={lessonForm.videoType}
              onChange={handleLessonChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="youtube">YouTube</option>
              <option value="google-drive">Google Drive</option>
              <option value="vimeo">Vimeo</option>
              <option value="external">External URL</option>
            </select>

            <input
              name="duration"
              value={lessonForm.duration}
              onChange={handleLessonChange}
              placeholder="10 min"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <input
              name="videoUrl"
              value={lessonForm.videoUrl}
              onChange={handleLessonChange}
              placeholder="Video URL"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            />

            <select
              name="status"
              value={lessonForm.status}
              onChange={handleLessonChange}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <input
              name="order"
              type="number"
              value={lessonForm.order}
              onChange={handleLessonChange}
              placeholder="Order"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <textarea
              name="description"
              value={lessonForm.description}
              onChange={handleLessonChange}
              placeholder="Description"
              rows={3}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            />

            {renderMaterialsEditor({
              materials: lessonForm.materials,
              onAdd: addLessonMaterial,
              onRemove: removeLessonMaterial,
              onUpdate: updateLessonMaterial,
              editMode: true,
            })}

            {renderQuizEditor({
              hasQuiz: lessonForm.hasQuiz,
              quizRequired: lessonForm.quizRequired,
              quizPassScore: lessonForm.quizPassScore,
              questions: lessonForm.quizQuestions,
              onCheckboxChange: handleLessonCheckboxChange,
              onPassScoreChange: handleLessonChange,
              onAddQuestion: addLessonQuizQuestion,
              onRemoveQuestion: removeLessonQuizQuestion,
              onUpdateQuestion: updateLessonQuizQuestion,
              onUpdateOption: updateLessonQuizOption,
              editMode: true,
            })}

            <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
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
          </div>

          <button
            type="submit"
            disabled={savingLesson}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-slate-400"
          >
            {savingLesson ? "Adding..." : "Add Lesson"}
          </button>
        </form>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Current Structure
          </h2>

          <div className="mt-6 space-y-5">
            {levels.map((level) => {
              const levelCourses = coursesByLevel.get(level.id) || [];

              return (
                <div
                  key={level.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                        Section {level.order || 0} · {level.status}
                      </div>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">
                        {level.title}
                      </h3>
                      {level.description && (
                        <p className="mt-1 text-sm text-slate-500">
                          {level.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEditLevel(level)}
                        className="rounded-lg bg-white px-3 py-2 text-xs text-blue-700 hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLevel(level)}
                        className="rounded-lg bg-white px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {editingLevelId === level.id && (
                    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <h5 className="mb-4 font-semibold text-blue-900">
                        Edit Section
                      </h5>

                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          name="title"
                          value={editLevelForm.title}
                          onChange={handleEditLevelChange}
                          placeholder="Section title"
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />

                        <select
                          name="status"
                          value={editLevelForm.status}
                          onChange={handleEditLevelChange}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        <input
                          name="order"
                          type="number"
                          value={editLevelForm.order}
                          onChange={handleEditLevelChange}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />

                        <textarea
                          name="description"
                          value={editLevelForm.description}
                          onChange={handleEditLevelChange}
                          rows={3}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
                        />
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleSaveLevelEdit(level.id)}
                          disabled={updatingLevelId === level.id}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-slate-400"
                        >
                          {updatingLevelId === level.id
                            ? "Saving..."
                            : "Save Section"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-lg bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 space-y-4">
                    {levelCourses.map((course) => {
                      const courseLessons = lessonsByCourse.get(course.id) || [];

                      return (
                        <div
                          key={course.id}
                          className="rounded-xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Course {course.order || 0} · {course.status}
                              </div>
                              <h4 className="mt-1 font-semibold text-slate-900">
                                {course.title}
                              </h4>
                              {course.description && (
                                <p className="mt-1 text-sm text-slate-500">
                                  {course.description}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEditCourse(course)}
                                className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-blue-700 hover:bg-blue-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCourse(course)}
                                className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {editingCourseId === course.id && (
                            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                              <h5 className="mb-4 font-semibold text-blue-900">
                                Edit Course
                              </h5>

                              <div className="grid gap-4 md:grid-cols-2">
                                <select
                                  name="levelId"
                                  value={editCourseForm.levelId}
                                  onChange={handleEditCourseChange}
                                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                >
                                  <option value="">No section</option>
                                  {levels.map((level) => (
                                    <option key={level.id} value={level.id}>
                                      {level.title}
                                    </option>
                                  ))}
                                </select>

                                <input
                                  name="title"
                                  value={editCourseForm.title}
                                  onChange={handleEditCourseChange}
                                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                />

                                <select
                                  name="status"
                                  value={editCourseForm.status}
                                  onChange={handleEditCourseChange}
                                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                >
                                  {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>

                                <input
                                  name="order"
                                  type="number"
                                  value={editCourseForm.order}
                                  onChange={handleEditCourseChange}
                                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                />

                                <textarea
                                  name="description"
                                  value={editCourseForm.description}
                                  onChange={handleEditCourseChange}
                                  rows={3}
                                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
                                />
                              </div>

                              <div className="mt-4 flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleSaveCourseEdit(course.id)}
                                  disabled={updatingCourseId === course.id}
                                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-slate-400"
                                >
                                  {updatingCourseId === course.id
                                    ? "Saving..."
                                    : "Save Course"}
                                </button>

                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="rounded-lg bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="mt-4 space-y-3">
                            {courseLessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                      Lesson {lesson.order || 0} · {lesson.status}
                                      {lesson.hasQuiz ? " · Quiz" : ""}
                                    </div>
                                    <h5 className="mt-1 font-semibold text-slate-900">
                                      {lesson.title}
                                    </h5>
                                    {lesson.description && (
                                      <p className="mt-1 text-sm text-slate-500">
                                        {lesson.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => startEditLesson(lesson)}
                                      className="rounded-lg bg-white px-3 py-2 text-xs text-blue-700 hover:bg-blue-50"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLesson(lesson)}
                                      className="rounded-lg bg-white px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>

                                {editingLessonId === lesson.id &&
                                  renderLessonEditForm(lesson)}
                              </div>
                            ))}

                            {courseLessons.length === 0 && (
                              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                                No lessons in this course.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {levelCourses.length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                        No courses in this section.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {(coursesByLevel.get("__unassigned__") || []).length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  No Section
                </h3>

                <div className="mt-4 space-y-4">
                  {(coursesByLevel.get("__unassigned__") || []).map((course) => {
                    const courseLessons = lessonsByCourse.get(course.id) || [];

                    return (
                      <div
                        key={course.id}
                        className="rounded-xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Course {course.order || 0} · {course.status}
                            </div>
                            <h4 className="mt-1 font-semibold text-slate-900">
                              {course.title}
                            </h4>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditCourse(course)}
                              className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-blue-700 hover:bg-blue-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCourse(course)}
                              className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {editingCourseId === course.id && (
                          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <h5 className="mb-4 font-semibold text-blue-900">
                              Edit Course
                            </h5>

                            <div className="grid gap-4 md:grid-cols-2">
                              <select
                                name="levelId"
                                value={editCourseForm.levelId}
                                onChange={handleEditCourseChange}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                              >
                                <option value="">No section</option>
                                {levels.map((level) => (
                                  <option key={level.id} value={level.id}>
                                    {level.title}
                                  </option>
                                ))}
                              </select>

                              <input
                                name="title"
                                value={editCourseForm.title}
                                onChange={handleEditCourseChange}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                              />

                              <select
                                name="status"
                                value={editCourseForm.status}
                                onChange={handleEditCourseChange}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                              >
                                {statusOptions.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>

                              <input
                                name="order"
                                type="number"
                                value={editCourseForm.order}
                                onChange={handleEditCourseChange}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                              />

                              <textarea
                                name="description"
                                value={editCourseForm.description}
                                onChange={handleEditCourseChange}
                                rows={3}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
                              />
                            </div>

                            <div className="mt-4 flex gap-3">
                              <button
                                type="button"
                                onClick={() => handleSaveCourseEdit(course.id)}
                                disabled={updatingCourseId === course.id}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-slate-400"
                              >
                                {updatingCourseId === course.id
                                  ? "Saving..."
                                  : "Save Course"}
                              </button>

                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-lg bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 space-y-3">
                          {courseLessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Lesson {lesson.order || 0} · {lesson.status}
                                    {lesson.hasQuiz ? " · Quiz" : ""}
                                  </div>
                                  <h5 className="mt-1 font-semibold text-slate-900">
                                    {lesson.title}
                                  </h5>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => startEditLesson(lesson)}
                                    className="rounded-lg bg-white px-3 py-2 text-xs text-blue-700 hover:bg-blue-50"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLesson(lesson)}
                                    className="rounded-lg bg-white px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              {editingLessonId === lesson.id &&
                                renderLessonEditForm(lesson)}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {levels.length === 0 && courses.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                No sections, courses, or lessons yet.
              </div>
            )}
          </div>
        </section>
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
