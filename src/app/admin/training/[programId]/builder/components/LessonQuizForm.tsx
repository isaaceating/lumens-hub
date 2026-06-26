import { HelpCircle, Plus, Save } from "lucide-react";
import type { FormEvent } from "react";
import type { TrainingQuizQuestion } from "@/lib/training";

type LessonQuizFormProps = {
  hasQuiz: boolean;
  quizRequired: boolean;
  quizPassScore: number | "";
  questions: TrainingQuizQuestion[];
  message: string;
  saving: boolean;
  selectedLessonId: string;
  onSubmit: (event: FormEvent) => void;
  onHasQuizChange: (value: boolean) => void;
  onQuizRequiredChange: (value: boolean) => void;
  onQuizPassScoreChange: (value: number | "") => void;
  onAddQuestion: () => void;
  onClearQuestion: (index: number) => void;
  onQuestionFieldChange: (index: number, field: keyof TrainingQuizQuestion, value: string) => void;
  onOptionChange: (questionIndex: number, optionIndex: number, value: string) => void;
};

export default function LessonQuizForm({
  hasQuiz,
  quizRequired,
  quizPassScore,
  questions,
  message,
  saving,
  selectedLessonId,
  onSubmit,
  onHasQuizChange,
  onQuizRequiredChange,
  onQuizPassScoreChange,
  onAddQuestion,
  onClearQuestion,
  onQuestionFieldChange,
  onOptionChange,
}: LessonQuizFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Quiz Settings</h2>
          <p className="mt-1 text-sm text-slate-500">Rows with a question and at least two options will be saved.</p>
        </div>
        <button
          type="button"
          onClick={onAddQuestion}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
        >
          <Plus size={16} /> Add Question
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={hasQuiz} onChange={(event) => onHasQuizChange(event.target.checked)} className="mr-2" />
          Has Quiz
        </label>
        <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={quizRequired} onChange={(event) => onQuizRequiredChange(event.target.checked)} className="mr-2" />
          Required
        </label>
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-600">Pass Score</label>
          <input
            type="number"
            value={quizPassScore}
            onChange={(event) => onQuizPassScoreChange(event.target.value === "" ? "" : Number(event.target.value))}
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
                onClick={() => onClearQuestion(questionIndex)}
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
                  onChange={(event) => onQuestionFieldChange(questionIndex, "question", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  placeholder="What is the correct answer?"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">Order</label>
                <input
                  type="number"
                  value={item.order || questionIndex + 1}
                  onChange={(event) => onQuestionFieldChange(questionIndex, "order", event.target.value)}
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
                    onChange={(event) => onOptionChange(questionIndex, optionIndex, event.target.value)}
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
                  onChange={(event) => onQuestionFieldChange(questionIndex, "correctAnswerIndex", event.target.value)}
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
                  onChange={(event) => onQuestionFieldChange(questionIndex, "explanation", event.target.value)}
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
  );
}
