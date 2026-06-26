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
  type TrainingQuizQuestion,
} from "@/lib/training";
import BuilderEditorShell from "../components/BuilderEditorShell";
import { sortByOrder } from "../components/editorHelpers";
import LessonPicker from "../components/LessonPicker";
import LessonQuizForm from "../components/LessonQuizForm";

const createEmptyQuestion = (order: number): TrainingQuizQuestion => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswerIndex: 0,
  explanation: "",
  order,
});

const normalizeQuestions = (questions: TrainingQuizQuestion[]) =>
  questions
    .map((item, index) => ({
      question: item.question.trim(),
      options: item.options.map((option) => option.trim()),
      correctAnswerIndex: Number(item.correctAnswerIndex) || 0,
      explanation: item.explanation?.trim() || "",
      order: item.order || index + 1,
    }))
    .filter((item) => item.question && item.options.filter(Boolean).length >= 2);

function QuizEditorContent() {
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
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quizRequired, setQuizRequired] = useState(false);
  const [quizPassScore, setQuizPassScore] = useState<number | "">(80);
  const [questions, setQuestions] = useState<TrainingQuizQuestion[]>([createEmptyQuestion(1)]);

  const loadLessonQuiz = (lesson: TrainingLesson | undefined) => {
    if (!lesson) {
      setSelectedLessonId("");
      setHasQuiz(false);
      setQuizRequired(false);
      setQuizPassScore(80);
      setQuestions([createEmptyQuestion(1)]);
      return;
    }

    setSelectedLessonId(lesson.id);
    setHasQuiz(Boolean(lesson.hasQuiz));
    setQuizRequired(Boolean(lesson.quizRequired));
    setQuizPassScore(lesson.quizPassScore ?? 80);
    setQuestions(lesson.quizQuestions?.length ? sortByOrder(lesson.quizQuestions) : [createEmptyQuestion(1)]);
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

      loadLessonQuiz(requestedLesson || currentLesson || firstLesson);
    } catch (error) {
      console.error("Failed to load lesson quiz:", error);
      setMessage("Failed to load lesson quiz.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [programId, requestedLessonId]);

  const handleLessonSelect = (lessonId: string) => {
    const lesson = lessons.find((item) => item.id === lessonId);
    setMessage("");
    loadLessonQuiz(lesson);
  };

  const updateQuestionField = (
    index: number,
    field: keyof TrainingQuizQuestion,
    value: string
  ) => {
    setMessage("");
    setQuestions((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: field === "correctAnswerIndex" || field === "order" ? Number(value) || 0 : value,
            }
          : item
      )
    );
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setMessage("");
    setQuestions((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === questionIndex
          ? {
              ...item,
              options: item.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? value : option
              ),
            }
          : item
      )
    );
  };

  const addQuestionRow = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion(prev.length + 1)]);
  };

  const clearQuestionRow = (index: number) => {
    setQuestions((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? createEmptyQuestion(item.order || itemIndex + 1) : item
      )
    );
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedLessonId) {
      setMessage("Please select a lesson first.");
      return;
    }

    const normalizedQuestions = normalizeQuestions(questions);
    const finalHasQuiz = hasQuiz || normalizedQuestions.length > 0;

    setSaving(true);
    setMessage("");

    try {
      await updateTrainingLesson(selectedLessonId, {
        hasQuiz: finalHasQuiz,
        quizRequired,
        quizPassScore: quizPassScore === "" ? 0 : Number(quizPassScore),
        quizQuestions: normalizedQuestions,
      });

      setMessage("Quiz saved.");
      const updatedLessons = await getTrainingLessonsByProgram(programId);
      setLessons(updatedLessons);
      const updatedLesson = updatedLessons.find((lesson) => lesson.id === selectedLessonId);
      loadLessonQuiz(updatedLesson);
    } catch (error) {
      console.error("Failed to save quiz:", error);
      setMessage("Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
        Loading lesson quiz...
      </div>
    );
  }

  return (
    <BuilderEditorShell
      programId={programId}
      eyebrow="Quiz Editor"
      title="Lesson Quiz"
      description="Select a lesson and manage quiz settings and questions. This updates quiz only and does not change materials."
      sidebar={
        <LessonPicker
          sections={sections}
          courses={courses}
          lessons={lessons}
          value={selectedLessonId}
          onChange={handleLessonSelect}
          heading="Select Lesson"
          helperText="Choose which lesson quiz to edit."
          metaLabel="Current questions"
          metaValue={(lesson) => lesson.quizQuestions?.length || 0}
        />
      }
    >
      <LessonQuizForm
        hasQuiz={hasQuiz}
        quizRequired={quizRequired}
        quizPassScore={quizPassScore}
        questions={questions}
        message={message}
        saving={saving}
        selectedLessonId={selectedLessonId}
        onSubmit={handleSave}
        onHasQuizChange={setHasQuiz}
        onQuizRequiredChange={setQuizRequired}
        onQuizPassScoreChange={setQuizPassScore}
        onAddQuestion={addQuestionRow}
        onClearQuestion={clearQuestionRow}
        onQuestionFieldChange={updateQuestionField}
        onOptionChange={updateOption}
      />
    </BuilderEditorShell>
  );
}

export default function QuizEditorPage() {
  return (
    <AdminGuard>
      <QuizEditorContent />
    </AdminGuard>
  );
}
