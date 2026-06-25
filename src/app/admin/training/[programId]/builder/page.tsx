"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type ElementType,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  Eye,
  FileText,
  Layers3,
  ListChecks,
  Pencil,
  Plus,
  Route,
  Save,
  Settings2,
  Video,
} from "lucide-react";
import {
  createTrainingCourse,
  createTrainingLevel,
  getTrainingCoursesByProgram,
  getTrainingLevelsByProgram,
  getTrainingProgramById,
  TrainingCourse,
  TrainingLevel,
  TrainingStatus,
  updateTrainingCourse,
  updateTrainingLevel,
  updateTrainingProgram,
} from "@/lib/training";
import BuilderPage from "../page";

type BuilderTabId = "program" | "sections" | "courses" | "lessons" | "structure";

const statusOptions: TrainingStatus[] = ["draft", "published", "archived"];

const emptySectionForm = {
  title: "",
  description: "",
  status: "draft" as TrainingStatus,
  order: 1 as number | "",
};

const emptyCourseForm = {
  levelId: "",
  title: "",
  description: "",
  status: "draft" as TrainingStatus,
  order: 1 as number | "",
};

const workflowSteps: {
  id: BuilderTabId;
  title: string;
  shortTitle: string;
  description: string;
  detail: string;
  status: string;
  icon: ElementType;
}[] = [
  {
    id: "program",
    title: "1. Program",
    shortTitle: "Program",
    description: "Confirm title, owner, status, and route.",
    detail:
      "Program-level settings are now editable in the new builder. Save here first, then continue with sections and courses.",
    status: "Live",
    icon: FileText,
  },
  {
    id: "sections",
    title: "2. Sections",
    shortTitle: "Sections",
    description: "Create levels, chapters, or phases.",
    detail:
      "Sections define the top layer of the learning structure. You can add and edit section metadata here.",
    status: "Live",
    icon: Layers3,
  },
  {
    id: "courses",
    title: "3. Courses",
    shortTitle: "Courses",
    description: "Group lessons under each section.",
    detail:
      "Courses organize lesson groups and can belong to a section. You can add and edit course metadata here.",
    status: "Live",
    icon: BookOpenCheck,
  },
  {
    id: "lessons",
    title: "4. Lessons",
    shortTitle: "Lessons",
    description: "Add video, duration, materials, and quiz.",
    detail:
      "Lessons are the most complex part because they include video, materials, completion options, and quizzes. This will be migrated last.",
    status: "Planned",
    icon: Video,
  },
  {
    id: "structure",
    title: "5. Structure",
    shortTitle: "Structure",
    description: "Review and publish hierarchy.",
    detail:
      "Structure will become the visual review area for the full program hierarchy, with quick edit entry points.",
    status: "Planned",
    icon: ListChecks,
  },
];

const getStatusClass = (status: TrainingStatus) => {
  if (status === "published") return "bg-emerald-100 text-emerald-700";
  if (status === "archived") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
};

export default function AdvancedTrainingBuilderRoute() {
  const params = useParams();
  const programId = params.programId as string;
  const [activeTab, setActiveTab] = useState<BuilderTabId>("program");

  const [loadingProgram, setLoadingProgram] = useState(true);
  const [savingProgram, setSavingProgram] = useState(false);
  const [programMessage, setProgramMessage] = useState("");
  const [programForm, setProgramForm] = useState({
    title: "",
    description: "",
    ownerDepartment: "",
    status: "draft" as TrainingStatus,
    order: 1 as number | "",
  });

  const [loadingSections, setLoadingSections] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [sectionMessage, setSectionMessage] = useState("");
  const [sections, setSections] = useState<TrainingLevel[]>([]);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState(emptySectionForm);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseMessage, setCourseMessage] = useState("");
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);

  const activeStep = workflowSteps.find((step) => step.id === activeTab) || workflowSteps[0];
  const ActiveIcon = activeStep.icon;

  const getSectionTitle = (levelId?: string) => {
    if (!levelId) return "Unassigned";
    return sections.find((section) => section.id === levelId)?.title || "Unknown section";
  };

  const fetchProgram = async () => {
    if (!programId) return;

    setLoadingProgram(true);

    try {
      const program = await getTrainingProgramById(programId);

      if (program) {
        setProgramForm({
          title: program.title || "",
          description: program.description || "",
          ownerDepartment: program.ownerDepartment || "",
          status: program.status || "draft",
          order: program.order ?? 1,
        });
      }
    } catch (error) {
      console.error("Failed to load program settings:", error);
      setProgramMessage("Failed to load program settings.");
    } finally {
      setLoadingProgram(false);
    }
  };

  const fetchSections = async () => {
    if (!programId) return;

    setLoadingSections(true);

    try {
      const data = await getTrainingLevelsByProgram(programId);
      setSections(data);

      if (!editingSectionId) {
        setSectionForm((prev) => ({
          ...prev,
          order: data.length + 1,
        }));
      }
    } catch (error) {
      console.error("Failed to load sections:", error);
      setSectionMessage("Failed to load sections.");
    } finally {
      setLoadingSections(false);
    }
  };

  const fetchCourses = async () => {
    if (!programId) return;

    setLoadingCourses(true);

    try {
      const data = await getTrainingCoursesByProgram(programId);
      setCourses(data);

      if (!editingCourseId) {
        setCourseForm((prev) => ({
          ...prev,
          order: data.length + 1,
        }));
      }
    } catch (error) {
      console.error("Failed to load courses:", error);
      setCourseMessage("Failed to load courses.");
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchProgram();
    fetchSections();
    fetchCourses();
  }, [programId]);

  const handleProgramChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setProgramMessage("");

    setProgramForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSectionChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setSectionMessage("");

    setSectionForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleCourseChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setCourseMessage("");

    setCourseForm((prev) => ({
      ...prev,
      [name]: name === "order" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const resetSectionForm = () => {
    setEditingSectionId(null);
    setSectionForm({ ...emptySectionForm, order: sections.length + 1 });
    setSectionMessage("");
  };

  const resetCourseForm = () => {
    setEditingCourseId(null);
    setCourseForm({ ...emptyCourseForm, levelId: sections[0]?.id || "", order: courses.length + 1 });
    setCourseMessage("");
  };

  const startEditSection = (section: TrainingLevel) => {
    setEditingSectionId(section.id);
    setSectionForm({
      title: section.title || "",
      description: section.description || "",
      status: section.status || "draft",
      order: section.order ?? 1,
    });
    setActiveTab("sections");
    setSectionMessage("");
  };

  const startEditCourse = (course: TrainingCourse) => {
    setEditingCourseId(course.id);
    setCourseForm({
      levelId: course.levelId || "",
      title: course.title || "",
      description: course.description || "",
      status: course.status || "draft",
      order: course.order ?? 1,
    });
    setActiveTab("courses");
    setCourseMessage("");
  };

  const handleProgramSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!programForm.title.trim()) {
      setProgramMessage("Program title is required.");
      return;
    }

    setSavingProgram(true);
    setProgramMessage("");

    try {
      await updateTrainingProgram(programId, {
        title: programForm.title.trim(),
        description: programForm.description.trim(),
        ownerDepartment: programForm.ownerDepartment.trim(),
        status: programForm.status,
        order: programForm.order === "" ? 0 : Number(programForm.order),
      });

      setProgramMessage("Program settings saved.");
      await fetchProgram();
    } catch (error) {
      console.error("Failed to save program settings:", error);
      setProgramMessage("Failed to save program settings.");
    } finally {
      setSavingProgram(false);
    }
  };

  const handleSectionSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!sectionForm.title.trim()) {
      setSectionMessage("Section title is required.");
      return;
    }

    setSavingSection(true);
    setSectionMessage("");

    try {
      const payload = {
        programId,
        title: sectionForm.title.trim(),
        description: sectionForm.description.trim(),
        status: sectionForm.status,
        order: sectionForm.order === "" ? 0 : Number(sectionForm.order),
      };

      if (editingSectionId) {
        await updateTrainingLevel(editingSectionId, payload);
        setSectionMessage("Section updated.");
      } else {
        await createTrainingLevel(payload);
        setSectionMessage("Section created.");
      }

      resetSectionForm();
      await fetchSections();
    } catch (error) {
      console.error("Failed to save section:", error);
      setSectionMessage("Failed to save section.");
    } finally {
      setSavingSection(false);
    }
  };

  const handleCourseSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!courseForm.title.trim()) {
      setCourseMessage("Course title is required.");
      return;
    }

    setSavingCourse(true);
    setCourseMessage("");

    try {
      const payload = {
        programId,
        levelId: courseForm.levelId,
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        status: courseForm.status,
        order: courseForm.order === "" ? 0 : Number(courseForm.order),
      };

      if (editingCourseId) {
        await updateTrainingCourse(editingCourseId, payload);
        setCourseMessage("Course updated.");
      } else {
        await createTrainingCourse(payload);
        setCourseMessage("Course created.");
      }

      resetCourseForm();
      await fetchCourses();
    } catch (error) {
      console.error("Failed to save course:", error);
      setCourseMessage("Failed to save course.");
    } finally {
      setSavingCourse(false);
    }
  };

  const renderProgramPanel = () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100"><Settings2 size={20} /></div>
          <div><h2 className="text-lg font-semibold text-slate-900">Program Settings</h2><p className="mt-1 text-sm text-slate-500">Edit the program-level metadata that controls the frontend training module.</p></div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(programForm.status)}`}>{programForm.status}</span>
      </div>

      {loadingProgram ? <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">Loading program settings...</div> : (
        <form onSubmit={handleProgramSave} className="grid gap-5 md:grid-cols-2">
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Program ID</label><input value={programId} disabled className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 font-mono text-sm text-slate-500" /><p className="mt-1 text-xs text-slate-500">Program ID cannot be changed.</p></div>
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Title</label><input name="title" value={programForm.title} onChange={handleProgramChange} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></div>
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Owner Department</label><input name="ownerDepartment" value={programForm.ownerDepartment} onChange={handleProgramChange} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></div>
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Status</label><select name="status" value={programForm.status} onChange={handleProgramChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50">{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select><p className="mt-1 text-xs text-slate-500">Published programs appear as native training modules.</p></div>
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Order</label><input name="order" type="number" value={programForm.order} onChange={handleProgramChange} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></div>
          <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-slate-700">Description</label><textarea name="description" value={programForm.description} onChange={handleProgramChange} rows={5} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></div>
          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><div className="text-sm text-slate-500">{programMessage || "Save here to update the program and synced native module."}</div><button type="submit" disabled={savingProgram} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-400"><Save size={16} /> {savingProgram ? "Saving..." : "Save Program"}</button></div>
        </form>
      )}
    </section>
  );

  const renderSectionsPanel = () => (
    <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">{editingSectionId ? <Pencil size={20} /> : <Plus size={20} />}</div><div><h2 className="text-lg font-semibold text-slate-900">{editingSectionId ? "Edit Section" : "Add Section"}</h2><p className="mt-1 text-sm text-slate-500">Sections are the top-level chapters or phases inside this training program.</p></div></div>
        <form onSubmit={handleSectionSave} className="space-y-4">
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Section Title</label><input name="title" value={sectionForm.title} onChange={handleSectionChange} placeholder="Level 1 · Foundation" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></div>
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Status</label><select name="status" value={sectionForm.status} onChange={handleSectionChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50">{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Order</label><input name="order" type="number" value={sectionForm.order} onChange={handleSectionChange} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></div>
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Description</label><textarea name="description" value={sectionForm.description} onChange={handleSectionChange} rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><div className="text-sm text-slate-500">{sectionMessage || "Create or update section metadata here."}</div><div className="flex gap-2">{editingSectionId && <button type="button" onClick={resetSectionForm} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">Cancel</button>}<button type="submit" disabled={savingSection} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-400"><Save size={16} /> {savingSection ? "Saving..." : editingSectionId ? "Update Section" : "Create Section"}</button></div></div>
        </form>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">Section List</h2><p className="mt-1 text-sm text-slate-500">Showing {sections.length} sections in this program.</p></div><button type="button" onClick={fetchSections} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">Refresh</button></div>
        {loadingSections ? <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">Loading sections...</div> : sections.length > 0 ? <div className="space-y-3">{sections.map((section) => <div key={section.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">Order {section.order || 0}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(section.status)}`}>{section.status}</span></div><h3 className="mt-3 font-semibold text-slate-900">{section.title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{section.description || "No description."}</p><p className="mt-2 font-mono text-xs text-slate-400">{section.id}</p></div><button type="button" onClick={() => startEditSection(section)} className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"><Pencil size={15} /> Edit</button></div></div>)}</div> : <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No sections yet. Create the first section from the form on the left.</div>}
      </div>
    </section>
  );

  const renderCoursesPanel = () => (
    <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">{editingCourseId ? <Pencil size={20} /> : <Plus size={20} />}</div><div><h2 className="text-lg font-semibold text-slate-900">{editingCourseId ? "Edit Course" : "Add Course"}</h2><p className="mt-1 text-sm text-slate-500">Courses group lessons under a section.</p></div></div>
        <form onSubmit={handleCourseSave} className="space-y-4">
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Parent Section</label><select name="levelId" value={courseForm.levelId} onChange={handleCourseChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"><option value="">Unassigned</option>{sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}</select><p className="mt-1 text-xs text-slate-500">Create sections first if this list is empty.</p></div>
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Course Title</label><input name="title" value={courseForm.title} onChange={handleCourseChange} placeholder="Course 1 · Product Basics" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></div>
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Status</label><select name="status" value={courseForm.status} onChange={handleCourseChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50">{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Order</label><input name="order" type="number" value={courseForm.order} onChange={handleCourseChange} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></div>
          <div><label className="mb-2 block text-sm font-medium text-slate-700">Description</label><textarea name="description" value={courseForm.description} onChange={handleCourseChange} rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50" /></div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><div className="text-sm text-slate-500">{courseMessage || "Create or update course metadata here."}</div><div className="flex gap-2">{editingCourseId && <button type="button" onClick={resetCourseForm} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">Cancel</button>}<button type="submit" disabled={savingCourse} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-400"><Save size={16} /> {savingCourse ? "Saving..." : editingCourseId ? "Update Course" : "Create Course"}</button></div></div>
        </form>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">Course List</h2><p className="mt-1 text-sm text-slate-500">Showing {courses.length} courses in this program.</p></div><button type="button" onClick={fetchCourses} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">Refresh</button></div>
        {loadingCourses ? <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">Loading courses...</div> : courses.length > 0 ? <div className="space-y-3">{courses.map((course) => <div key={course.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">Order {course.order || 0}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(course.status)}`}>{course.status}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{getSectionTitle(course.levelId)}</span></div><h3 className="mt-3 font-semibold text-slate-900">{course.title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{course.description || "No description."}</p><p className="mt-2 font-mono text-xs text-slate-400">{course.id}</p></div><button type="button" onClick={() => startEditCourse(course)} className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"><Pencil size={15} /> Edit</button></div></div>)}</div> : <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No courses yet. Create the first course from the form on the left.</div>}
      </div>
    </section>
  );

  const renderActiveTabPanel = () => {
    if (activeTab === "program") return renderProgramPanel();
    if (activeTab === "sections") return renderSectionsPanel();
    if (activeTab === "courses") return renderCoursesPanel();

    return <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-500 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">{activeStep.shortTitle}</h2><p className="mt-2 max-w-2xl text-sm leading-6">{activeStep.detail}</p><p className="mt-4 text-sm">Use the legacy advanced editor below until this tab is migrated.</p></section>;
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="bg-gradient-to-r from-slate-950 to-indigo-800 p-6 text-white"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15">Advanced Builder</div><h1 className="mt-3 text-2xl font-bold tracking-tight">Advanced Training Builder</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-white/75">Build and edit the full training hierarchy: sections, courses, lessons, materials, and quizzes.</p><p className="mt-2 font-mono text-xs text-white/55">Program ID: {programId}</p></div><div className="flex flex-wrap gap-2"><Link href={`/admin/training/${programId}/overview`} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"><ArrowLeft size={16} /> Manage</Link><Link href={`/training/${programId}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"><Eye size={16} /> Preview</Link></div></div></div></div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100"><Route size={14} /> Builder Workflow</div><h2 className="mt-3 text-lg font-semibold text-slate-900">Build from top to bottom</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Program, Sections, and Courses are now live in the new builder. Remaining tabs still use the legacy editor below.</p></div><div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100"><CheckCircle2 size={15} /> Program + Sections + Courses migrated</div></div><div className="mt-5 grid gap-3 md:grid-cols-5">{workflowSteps.map((step) => { const Icon = step.icon; const isActive = activeTab === step.id; return <button type="button" key={step.id} onClick={() => setActiveTab(step.id)} className={`rounded-2xl border p-4 text-left transition ${isActive ? "border-blue-200 bg-blue-50 shadow-sm ring-2 ring-blue-100" : "border-slate-200 bg-slate-50 hover:border-blue-100 hover:bg-blue-50/50"}`}><div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ${isActive ? "text-blue-700 ring-blue-100" : "text-slate-500 ring-slate-100"}`}><Icon size={17} /></div><div className="text-sm font-semibold text-slate-900">{step.title}</div><p className="mt-1 text-xs leading-5 text-slate-500">{step.description}</p></button>; })}</div></section>

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm ring-1 ring-blue-100"><ActiveIcon size={20} /></div><div><div className="text-xs font-semibold uppercase tracking-wide text-blue-700">Active tab · {activeStep.status}</div><h2 className="mt-1 text-lg font-semibold text-slate-900">{activeStep.shortTitle}</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{activeStep.detail}</p></div></div><div className="rounded-xl bg-white px-3 py-2 font-mono text-xs text-slate-500 ring-1 ring-blue-100">/builder#{activeTab}</div></div></section>

      {renderActiveTabPanel()}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><div className="text-sm font-semibold text-slate-700">Legacy advanced editor area</div><p className="mt-1 text-xs text-slate-500">Full create and edit controls remain here until lessons and structure tabs are migrated.</p></div></div><BuilderPage /></div>
    </div>
  );
}
