"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpenCheck,
  FileText,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  Save,
  Settings2,
  Video,
} from "lucide-react";
import AdminGuard from "@/app/components/AdminGuard";
import {
  getTrainingCoursesByProgram,
  getTrainingLessonsByProgram,
  getTrainingLevelsByProgram,
  getTrainingProgramById,
  TrainingCourse,
  TrainingLesson,
  TrainingLevel,
  TrainingProgram,
  TrainingStatus,
  updateTrainingProgram,
} from "@/lib/training";

const statusOptions: TrainingStatus[] = ["draft", "published", "archived"];

const getStatusClass = (status: TrainingStatus) => {
  if (status === "published") return "bg-emerald-100 text-emerald-700";
  if (status === "archived") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
};

function TrainingProgramOverviewContent() {
  const params = useParams();
  const router = useRouter();
  const programId = params.programId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [levels, setLevels] = useState<TrainingLevel[]>([]);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [lessons, setLessons] = useState<TrainingLesson[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    ownerDepartment: "",
    status: "draft" as TrainingStatus,
    order: 1 as number | "",
  });

  const routePreview = `/training/${programId}`;

  const coursesByLevel = useMemo(() => {
    const map = new Map<string, TrainingCourse[]>();

    levels.forEach((level) => map.set(level.id, []));
    map.set("__unassigned__", []);

    courses.forEach((course) => {
      const key = course.levelId || "__unassigned__";
      map.set(key, [...(map.get(key) || []), course]);
    });

    return map;
  }, [levels, courses]);

  const lessonsByCourse = useMemo(() => {
    const map = new Map<string, TrainingLesson[]>();

    courses.forEach((course) => map.set(course.id, []));
    lessons.forEach((lesson) => {
      map.set(lesson.courseId, [...(map.get(lesson.courseId) || []), lesson]);
    });

    return map;
  }, [courses, lessons]);

  const fetchData = async () => {
    if (!programId) return;

    setLoading(true);

    try {
      const [programData, levelData, courseData, lessonData] = await Promise.all([
        getTrainingProgramById(programId),
        getTrainingLevelsByProgram(programId),
        getTrainingCoursesByProgram(programId),
        getTrainingLessonsByProgram(programId),
      ]);

      setProgram(programData);
      setLevels(levelData);
      setCourses(courseData);
      setLessons(lessonData);

      if (programData) {
        setForm({
          title: programData.title || "",
          description: programData.description || "",
          ownerDepartment: programData.ownerDepartment || "",
          status: programData.status || "draft",
          order: programData.order ?? 1,
        });
      }
    } catch (error) {
      console.error("Failed to load training program overview:", error);
      setProgram(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [programId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Program title is required.");
      return;
    }

    setSaving(true);

    try {
      await updateTrainingProgram(programId, {
        title: form.title.trim(),
        description: form.description.trim(),
        ownerDepartment: form.ownerDepartment.trim(),
        status: form.status,
        order: form.order === "" ? 0 : Number(form.order),
      });

      await fetchData();
    } catch (error) {
      console.error("Failed to save training program:", error);
      alert("Failed to save training program.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
        Loading training program...
      </div>
    );
  }

  if (!program) {
    return (
      <div className="space-y-4">
        <Link href="/admin/training" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
          <ArrowLeft size={16} /> Back to Training
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Training program not found.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/training" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
          <ArrowLeft size={16} /> Back to Training
        </Link>

        <div className="flex flex-wrap gap-2">
          <Link href={routePreview} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Preview
          </Link>
          <Link href={`/admin/training/${programId}`} className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
            Advanced Builder
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 to-blue-800 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <GraduationCap size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Manage Training Program</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/75">
                Review the program settings and structure before editing detailed courses, lessons, materials, and quizzes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-slate-500">Sections</div><Layers3 size={18} className="text-slate-400" /></div>
          <div className="mt-3 text-3xl font-bold text-slate-900">{levels.length}</div>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-blue-700">Courses</div><BookOpenCheck size={18} className="text-blue-500" /></div>
          <div className="mt-3 text-3xl font-bold text-blue-900">{courses.length}</div>
        </div>
        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5 shadow-sm">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-purple-700">Lessons</div><Video size={18} className="text-purple-500" /></div>
          <div className="mt-3 text-3xl font-bold text-purple-900">{lessons.length}</div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-emerald-700">Published Lessons</div><BadgeCheck size={18} className="text-emerald-500" /></div>
          <div className="mt-3 text-3xl font-bold text-emerald-900">{lessons.filter((lesson) => lesson.status === "published").length}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start gap-3">
            <FileText className="mt-0.5 text-blue-600" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Program Settings</h2>
              <p className="mt-1 text-sm text-slate-500">Update the program information users see on the training page.</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Program ID</label>
              <input value={programId} disabled className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 font-mono text-sm text-slate-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Owner Department</label>
              <input name="ownerDepartment" value={form.ownerDepartment} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Order</label>
              <input name="order" type="number" value={form.order} onChange={handleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={5} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" />
            </div>
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <Settings2 className="mt-0.5 text-blue-600" size={20} />
              <div>
                <h2 className="font-semibold text-slate-900">Publish Settings</h2>
                <p className="mt-1 text-sm text-slate-500">Control whether users can see this training program.</p>
              </div>
            </div>
            <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50">
              {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <p className="mt-2 text-xs leading-5 text-slate-500">Published programs appear as native training modules under Official Resources.</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <LayoutDashboard className="mt-0.5 text-blue-600" size={20} />
              <div>
                <h2 className="font-semibold text-slate-900">Preview</h2>
                <p className="mt-1 text-sm text-slate-500">Current program behavior summary.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(form.status)}`}>{form.status}</span>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Native Module</span>
              </div>
              <h3 className="mt-4 line-clamp-2 text-lg font-bold text-slate-900">{form.title.trim() || "Untitled program"}</h3>
              <p className="mt-1 break-all font-mono text-xs text-slate-500">{programId}</p>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{form.description.trim() || "Program description preview."}</p>
              <div className="mt-4 space-y-2 text-xs text-slate-500">
                <div>Owner: <span className="font-semibold text-slate-700">{form.ownerDepartment.trim() || "—"}</span></div>
                <div>Route: <span className="font-mono text-slate-700">{routePreview}</span></div>
                <div>Order: <span className="font-semibold text-slate-700">{Number(form.order) || 0}</span></div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Training Structure Overview</h2>
            <p className="mt-1 text-sm text-slate-500">Use Advanced Builder to add, edit, or delete sections, courses, lessons, materials, and quizzes.</p>
          </div>
          <Link href={`/admin/training/${programId}`} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Open Advanced Builder</Link>
        </div>

        <div className="space-y-4">
          {levels.map((level) => {
            const levelCourses = coursesByLevel.get(level.id) || [];
            return (
              <div key={level.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">Section {level.order || 0} · {level.status}</div>
                    <h3 className="mt-1 font-semibold text-slate-900">{level.title}</h3>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">{levelCourses.length} courses</span>
                </div>
                <div className="mt-4 space-y-3">
                  {levelCourses.map((course) => {
                    const courseLessons = lessonsByCourse.get(course.id) || [];
                    return (
                      <div key={course.id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div><span className="text-xs font-medium text-slate-500">Course {course.order || 0} · {course.status}</span><div className="font-medium text-slate-900">{course.title}</div></div>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{courseLessons.length} lessons</span>
                        </div>
                      </div>
                    );
                  })}
                  {levelCourses.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">No courses in this section yet.</div>}
                </div>
              </div>
            );
          })}
          {levels.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">No sections yet. Open Advanced Builder to add sections, courses, and lessons.</div>}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">Managing <span className="font-semibold text-slate-900">{form.title.trim() || programId}</span></div>
          <div className="flex items-center gap-3">
            <Link href="/admin/training" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">Back</Link>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-400">
              <Save size={16} /> {saving ? "Saving..." : "Save Program"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function TrainingProgramOverviewPage() {
  return (
    <AdminGuard>
      <TrainingProgramOverviewContent />
    </AdminGuard>
  );
}
