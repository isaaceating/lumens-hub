import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { deleteModule, syncTrainingProgramModule } from "./modules";

export type TrainingStatus = "draft" | "published" | "archived";
export type TrainingLessonContentMode = "video" | "slides";
export type TrainingLessonSlideType = "google-slides" | "google-drive";

export type TrainingMaterial = {
  title: string;
  type: string;
  url: string;
  buttonLabel?: string;
  order?: number;
};

export type TrainingQuizQuestion = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  order?: number;
};

export type TrainingProgram = {
  id: string;
  title: string;
  description?: string;
  ownerDepartment?: string;
  status: TrainingStatus;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type TrainingLevel = {
  id: string;
  programId: string;
  title: string;
  description?: string;
  status: TrainingStatus;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type TrainingCourse = {
  id: string;
  programId: string;
  levelId?: string;
  title: string;
  description?: string;
  status: TrainingStatus;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type TrainingLesson = {
  id: string;
  programId: string;
  levelId?: string;
  courseId: string;
  title: string;
  description?: string;
  contentMode?: TrainingLessonContentMode;
  videoUrl?: string;
  videoType?: string;
  slideUrl?: string;
  slideType?: TrainingLessonSlideType;
  duration?: string;
  materials?: TrainingMaterial[];
  allowComments?: boolean;
  requireCompletion?: boolean;
  hasQuiz?: boolean;
  quizRequired?: boolean;
  quizPassScore?: number;
  quizQuestions?: TrainingQuizQuestion[];
  status: TrainingStatus;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

const now = () => new Date().toISOString();

const sortByOrder = <T extends { order?: number; title?: string }>(
  items: T[]
) => {
  return [...items].sort((a, b) => {
    const orderDiff = (a.order || 0) - (b.order || 0);

    if (orderDiff !== 0) {
      return orderDiff;
    }

    return (a.title || "").localeCompare(b.title || "");
  });
};

// Programs

export const getTrainingPrograms = async () => {
  const snapshot = await getDocs(collection(db, "trainingPrograms"));

  const programs = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as TrainingProgram[];

  return sortByOrder(programs);
};

export const getPublishedTrainingPrograms = async () => {
  const q = query(collection(db, "trainingPrograms"), where("status", "==", "published"));
  const snapshot = await getDocs(q);

  const programs = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as TrainingProgram[];

  return sortByOrder(programs);
};

export const getTrainingProgramById = async (programId: string) => {
  const snap = await getDoc(doc(db, "trainingPrograms", programId));

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as TrainingProgram;
};

export const createTrainingProgram = async (
  programId: string,
  program: Omit<TrainingProgram, "id" | "createdAt" | "updatedAt">
) => {
  await setDoc(doc(db, "trainingPrograms", programId), {
    ...program,
    createdAt: now(),
    updatedAt: now(),
  });

  await syncTrainingProgramModule({
    id: programId,
    title: program.title,
    description: program.description || "",
    status: program.status,
    order: program.order,
  });
};

export const updateTrainingProgram = async (
  programId: string,
  data: Partial<Omit<TrainingProgram, "id" | "createdAt">>
) => {
  const programRef = doc(db, "trainingPrograms", programId);

  await updateDoc(programRef, {
    ...data,
    updatedAt: now(),
  });

  const program = await getTrainingProgramById(programId);

  if (program) {
    await syncTrainingProgramModule(program);
  }
};

export const deleteTrainingProgram = async (programId: string) => {
  const program = await getTrainingProgramById(programId);

  if (!program) {
    throw new Error("Training program not found.");
  }

  if (program.status === "published") {
    throw new Error("Published programs must be archived before deletion.");
  }

  const levels = await getTrainingLevelsByProgram(programId);
  const courses = await getTrainingCoursesByProgram(programId);
  const lessons = await getTrainingLessonsByProgram(programId);
  const batch = writeBatch(db);

  lessons.forEach((lesson) => {
    batch.delete(doc(db, "trainingLessons", lesson.id));
  });

  courses.forEach((course) => {
    batch.delete(doc(db, "trainingCourses", course.id));
  });

  levels.forEach((level) => {
    batch.delete(doc(db, "trainingLevels", level.id));
  });

  batch.delete(doc(db, "trainingPrograms", programId));

  await batch.commit();
  await deleteModule(programId);
};

// Levels

export const getTrainingLevelsByProgram = async (programId: string) => {
  const q = query(
    collection(db, "trainingLevels"),
    where("programId", "==", programId)
  );

  const snapshot = await getDocs(q);

  const levels = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as TrainingLevel[];

  return sortByOrder(levels);
};

export const getPublishedTrainingLevelsByProgram = async (programId: string) => {
  const q = query(
    collection(db, "trainingLevels"),
    where("programId", "==", programId),
    where("status", "==", "published")
  );

  const snapshot = await getDocs(q);

  const levels = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as TrainingLevel[];

  return sortByOrder(levels);
};

export const createTrainingLevel = async (
  level: Omit<TrainingLevel, "id" | "createdAt" | "updatedAt">
) => {
  await addDoc(collection(db, "trainingLevels"), {
    ...level,
    createdAt: now(),
    updatedAt: now(),
  });
};

export const updateTrainingLevel = async (
  levelId: string,
  data: Partial<Omit<TrainingLevel, "id" | "createdAt">>
) => {
  const levelRef = doc(db, "trainingLevels", levelId);

  await updateDoc(levelRef, {
    ...data,
    updatedAt: now(),
  });
};

export const deleteTrainingLevel = async (levelId: string) => {
  await deleteDoc(doc(db, "trainingLevels", levelId));
};

// Courses

export const getTrainingCoursesByProgram = async (programId: string) => {
  const q = query(
    collection(db, "trainingCourses"),
    where("programId", "==", programId)
  );

  const snapshot = await getDocs(q);

  const courses = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as TrainingCourse[];

  return sortByOrder(courses);
};

export const getPublishedTrainingCoursesByProgram = async (
  programId: string
) => {
  const q = query(
    collection(db, "trainingCourses"),
    where("programId", "==", programId),
    where("status", "==", "published")
  );

  const snapshot = await getDocs(q);

  const courses = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as TrainingCourse[];

  return sortByOrder(courses);
};

export const getTrainingCoursesByLevel = async (levelId: string) => {
  const q = query(
    collection(db, "trainingCourses"),
    where("levelId", "==", levelId)
  );

  const snapshot = await getDocs(q);

  const courses = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as TrainingCourse[];

  return sortByOrder(courses);
};

export const createTrainingCourse = async (
  course: Omit<TrainingCourse, "id" | "createdAt" | "updatedAt">
) => {
  await addDoc(collection(db, "trainingCourses"), {
    ...course,
    createdAt: now(),
    updatedAt: now(),
  });
};

export const updateTrainingCourse = async (
  courseId: string,
  data: Partial<Omit<TrainingCourse, "id" | "createdAt">>
) => {
  const courseRef = doc(db, "trainingCourses", courseId);

  await updateDoc(courseRef, {
    ...data,
    updatedAt: now(),
  });
};

export const deleteTrainingCourse = async (courseId: string) => {
  await deleteDoc(doc(db, "trainingCourses", courseId));
};

// Lessons

export const getTrainingLessonsByProgram = async (programId: string) => {
  const q = query(
    collection(db, "trainingLessons"),
    where("programId", "==", programId)
  );

  const snapshot = await getDocs(q);

  const lessons = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as TrainingLesson[];

  return sortByOrder(lessons);
};

export const getPublishedTrainingLessonsByProgram = async (
  programId: string
) => {
  const q = query(
    collection(db, "trainingLessons"),
    where("programId", "==", programId),
    where("status", "==", "published")
  );

  const snapshot = await getDocs(q);

  const lessons = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as TrainingLesson[];

  return sortByOrder(lessons);
};

export const getTrainingLessonsByCourse = async (courseId: string) => {
  const q = query(
    collection(db, "trainingLessons"),
    where("courseId", "==", courseId)
  );

  const snapshot = await getDocs(q);

  const lessons = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as TrainingLesson[];

  return sortByOrder(lessons);
};

export const createTrainingLesson = async (
  lesson: Omit<TrainingLesson, "id" | "createdAt" | "updatedAt">
) => {
  await addDoc(collection(db, "trainingLessons"), {
    ...lesson,
    contentMode: lesson.contentMode || "video",
    slideType: lesson.slideType || "google-drive",
    hasQuiz: lesson.hasQuiz ?? false,
    quizRequired: lesson.quizRequired ?? false,
    quizPassScore: lesson.quizPassScore ?? 80,
    quizQuestions: lesson.quizQuestions || [],
    createdAt: now(),
    updatedAt: now(),
  });
};

export const updateTrainingLesson = async (
  lessonId: string,
  data: Partial<Omit<TrainingLesson, "id" | "createdAt">>
) => {
  const lessonRef = doc(db, "trainingLessons", lessonId);

  await updateDoc(lessonRef, {
    ...data,
    updatedAt: now(),
  });
};

export const deleteTrainingLesson = async (lessonId: string) => {
  await deleteDoc(doc(db, "trainingLessons", lessonId));
};

// Stats

export const getTrainingProgramStats = async (programId: string) => {
  const levels = await getTrainingLevelsByProgram(programId);
  const courses = await getTrainingCoursesByProgram(programId);
  const lessons = await getTrainingLessonsByProgram(programId);

  return {
    levelCount: levels.length,
    courseCount: courses.length,
    lessonCount: lessons.length,
  };
};

// Duplicate

export const duplicateTrainingProgram = async (programId: string) => {
  const program = await getTrainingProgramById(programId);

  if (!program) {
    throw new Error("Training program not found.");
  }

  const levels = await getTrainingLevelsByProgram(programId);
  const courses = await getTrainingCoursesByProgram(programId);
  const lessons = await getTrainingLessonsByProgram(programId);

  const batch = writeBatch(db);
  const copyId = `${programId}-copy-${Date.now()}`;
  const createdAt = now();

  const programRef = doc(db, "trainingPrograms", copyId);

  batch.set(programRef, {
    title: `${program.title} Copy`,
    description: program.description || "",
    ownerDepartment: program.ownerDepartment || "",
    status: "draft",
    order: (program.order || 0) + 1,
    createdAt,
    updatedAt: createdAt,
  });

  const levelIdMap = new Map<string, string>();
  const courseIdMap = new Map<string, string>();

  levels.forEach((level) => {
    const levelRef = doc(collection(db, "trainingLevels"));
    levelIdMap.set(level.id, levelRef.id);

    batch.set(levelRef, {
      programId: copyId,
      title: level.title,
      description: level.description || "",
      status: "draft",
      order: level.order || 0,
      createdAt,
      updatedAt: createdAt,
    });
  });

  courses.forEach((course) => {
    const courseRef = doc(collection(db, "trainingCourses"));
    courseIdMap.set(course.id, courseRef.id);

    batch.set(courseRef, {
      programId: copyId,
      levelId: levelIdMap.get(course.levelId || "") || "",
      title: course.title,
      description: course.description || "",
      status: "draft",
      order: course.order || 0,
      createdAt,
      updatedAt: createdAt,
    });
  });

  lessons.forEach((lesson) => {
    const lessonRef = doc(collection(db, "trainingLessons"));

    batch.set(lessonRef, {
      programId: copyId,
      levelId: levelIdMap.get(lesson.levelId || "") || "",
      courseId: courseIdMap.get(lesson.courseId) || "",
      title: lesson.title,
      description: lesson.description || "",
      contentMode: lesson.contentMode || "video",
      videoUrl: lesson.videoUrl || "",
      videoType: lesson.videoType || "youtube",
      slideUrl: lesson.slideUrl || "",
      slideType: lesson.slideType || "google-drive",
      duration: lesson.duration || "",
      materials: lesson.materials || [],
      allowComments: lesson.allowComments ?? true,
      requireCompletion: lesson.requireCompletion ?? true,
      hasQuiz: lesson.hasQuiz ?? false,
      quizRequired: lesson.quizRequired ?? false,
      quizPassScore: lesson.quizPassScore ?? 80,
      quizQuestions: lesson.quizQuestions || [],
      status: "draft",
      order: lesson.order || 0,
      createdAt,
      updatedAt: createdAt,
    });
  });

  await batch.commit();

  await syncTrainingProgramModule({
    id: copyId,
    title: `${program.title} Copy`,
    description: program.description || "",
    status: "draft",
    order: (program.order || 0) + 1,
  });
};
