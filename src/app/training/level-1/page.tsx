"use client";

const courses = [
  {
    id: 1,
    title: "Lumens Company Introduction",
    duration: "10 min",
    status: "Available",
  },
  {
    id: 2,
    title: "CamConnect Pro Overview",
    duration: "18 min",
    status: "Available",
  },
  {
    id: 3,
    title: "OIP Solution Basics",
    duration: "15 min",
    status: "Available",
  },
  {
    id: 4,
    title: "Sales Positioning Fundamentals",
    duration: "12 min",
    status: "Locked",
  },
];

export default function Level1Page() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Level 1 Training
        </h1>

        <p className="mt-2 text-slate-600">
          Foundation learning path for Lumens sales certification.
        </p>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <div className="font-semibold text-slate-900">
                {course.title}
              </div>

              <div className="mt-1 text-sm text-slate-500">
                {course.duration}
              </div>
            </div>

            <div>
              {course.status === "Available" ? (
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                  Start
                </button>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                  Locked
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}