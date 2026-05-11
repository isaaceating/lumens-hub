"use client";
import Link from "next/link";

const trainingLevels = [
  {
    id: "level-1",
    title: "Level 1",
    subtitle: "Foundation Training",
    description: "Learn the basic product knowledge and Lumens solution positioning.",
    courses: 4,
    status: "Available",
  },
  {
    id: "level-2",
    title: "Level 2",
    subtitle: "Solution Training",
    description: "Understand solution design, use cases, and vertical applications.",
    courses: 5,
    status: "Coming Soon",
  },
  {
    id: "level-3",
    title: "Level 3",
    subtitle: "Advanced Certification",
    description: "Complete advanced learning, exam, and certification requirements.",
    courses: 6,
    status: "Coming Soon",
  },
];

export default function TrainingPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Sales Training Certification
        </h1>
        <p className="mt-2 text-slate-600">
          Complete Lumens sales training levels and prepare for certification.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {trainingLevels.map((level) => (
          <div
            key={level.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-medium text-blue-700">
                {level.title}
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {level.status}
              </span>
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              {level.subtitle}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {level.description}
            </p>

            <div className="mt-6 text-sm text-slate-600">
              {level.courses} courses
            </div>

            {level.status === "Available" ? (
              <Link
                href="/training/level-1"
                className="mt-4 block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm text-white hover:bg-blue-700"
              >
                Start Training
              </Link>
            ) : (
              <button
                disabled
                className="mt-4 w-full rounded-lg bg-slate-300 px-4 py-2 text-sm text-white"
              >
                Coming Soon
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}