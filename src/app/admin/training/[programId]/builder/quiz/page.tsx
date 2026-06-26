"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, HelpCircle, Plus, Save } from "lucide-react";
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

const createEmptyQuestion = (order: number): TrainingQuizQuestion => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswerIndex: 0,
  explanation: "",
  order,
});

const sortByOrder = <T extends { order?: number; title?: string }>(items: T[]) =>
  [...items].sort((a, b) => {
    const orderDiff = (a.order || 0) - (b.order || 0);
    if (orderDiff !== 0) return orderDiff;
    return (a.title || "").localeCompare(b.title || "");
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

  const getSectionOrder = (levelId?: string) => {
    if (!levelId) return Number.MAX_SAFE_INTEGER;
    return sections.find((section) => section.id === levelId)?.order ?? Number.MAX_SAFE_INTEGER - 1;
  };

  const getSectionTitle = (levelId?: string) => {
    if (!levelId) return "Unassigned";
    return sections.find((section) => section.id === levelId)?.title || "Unknown section";
  };

  const getCourse = (courseId?: string) => courses.find((course) => course.id === courseId);
  const getCourseTitle = (courseId?: string) => getCourse(courseId)?.title || "Unknown course";
  const getCourseOrder = (courseId?: string) => getCourse(courseId)?.order ?? Number.MAX_SAFE_INTEGER;
  const getCourseSectionId = (courseId?: string) => getCourse(courseId)?.levelId || "";

  const sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => {
      const sectionOrderDiff = getSectionOrder(getCourseSectionId(a.courseId)) - getSectionOrder(getCourseSectionId(b.courseId));
      if (sectionOrderDiff !== 0) return sectionOrderDiff;

      const courseOrderDiff = getCourseOrder(a.courseId) - getCourseOrder(b.courseId);
      if (courseOrderDiff !== 0) return courseOrderDiff;

      const lessonOrderDiff = (a.order || 0) - (b.order || 0);
      if (lessonOrderDiff !== 0) return lessonOrderDiff;

      return (a.title || "").localeCompare(b.title || "");
    });
  }, [lessons, courses, sections]);

  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) || null;

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
            Quiz Editor
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Lesson Quiz</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-white/75">
            Select a lesson and manage quiz settings and questions. This updates quiz only and does not change materials.
          </p>
          <p className="mt-2 font-mono text-xs text-white/55">Program ID: {programId}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Select Lesson</h2>
          <p className="mt-1 text-sm text-slate-500">Choose which lesson quiz to edit.</p>

          <select
            value={selectedLessonId}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => handleLessonSelect(event.target.value)}
            className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="">Select lesson</option>
            {sortedLessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {getSectionTitle(getCourseSectionId(lesson.courseId))} / {getCourseTitle(lesson.courseId)} / {lesson.title}
              </option>
            ))}
          </select>

          {selectedLesson && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                {getSectionTitle(getCourseSectionId(selectedLesson.courseId))}
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{getCourseTitle(selectedLesson.courseId)}</div>
              <div className="mt-1 text-sm text-slate-600">{selectedLesson.title}</div>
              <div className="mt-3 text-xs text-slate-500">
                Current questions: {selectedLesson.quizQuestions?.length || 0}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Quiz Settings</h2>
              <p className="mt-1 text-sm text-slate-500">Rows with a question and at least two options will be saved.</p>
            </div>
            <button
              type="button"
              onClick={addQuestionRow}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              <Plus size={16} /> Add Question
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={hasQuiz} onChange={(event) => setHasQuiz(event.target.checked)} className="mr-2" />
              Has Quiz
            </label>
            <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={quizRequired} onChange={(event) => setQuizRequired(event.target.checked)} className="mr-2" />
              Required
            </label>
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">Pass Score</label>
              <input
                type="number"
                value={quizPassScore}
                onChange={(event) => setQuizPassScore(event.target.value === "" ? "" : Number(event.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {questions.map((item, questionIndex) => (
              <div key={questionIndex} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <HelpCircle size={16} /> Question {questionIndex + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => clearQuestionRow(questionIndex)}
                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                  >
                    Clear Row
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_100px]">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">Question</label>
                    <input
                      value={item.question}
                      onChange={(event) => updateQuestionField(questionIndex, "question", event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                      placeholder="What is the correct answer?"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">Order</label>
                    <input
                      type="number"
                      value={item.order || questionIndex + 1}
                      onChange={(event) => updateQuestionField(questionIndex, "order", event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {item.options.map((option, optionIndex) => (
                    <div key={optionIndex}>
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        Option {optionIndex + 1}
                      </label>
                      <input
                        value={option}
                        onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr]">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">Correct Answer</label>
                    <select
                      value={item.correctAnswerIndex}
                      onChange={(event) => updateQuestionField(questionIndex, "correctAnswerIndex", event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                    >
                      {item.options.map((_, optionIndex) => (
                        <option key={optionIndex} value={optionIndex}>Option {optionIndex + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">Explanation</label>
                    <input
                      value={item.explanation || ""}
                      onChange={(event) => updateQuestionField(questionIndex, "explanation", event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                      placeholder="Optional explanation"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="text-sm text-slate-500">{message || "Save to update this lesson quiz."}</div>
            <button
              type="submit"
              disabled={saving || !selectedLessonId}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-400"
            >
              <Save size={16} /> {saving ? "Saving..." : "Save Quiz"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function QuizEditorPage() {
  return (
    <AdminGuard>
      <QuizEditorContent />
    </AdminGuard>
  );
}
