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

export type TrainingStatus = "draft" | "published" | "archived";

export type TrainingMaterial = {
  title: string;
  type: string;
  url: string;
  buttonLabel?: string;
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

export type TrainingCourse = {
  id: string;
  programId: string;
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
  courseId: string;
  title: string;
  description?: string;
  videoUrl?: string;
  videoType?: string;
  duration?: string;
  materials?: TrainingMaterial[];
  allowComments?: boolean;
  requireCompletion?: boolean;
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

export const getTrainingPrograms = async () => {
  const snapshot = await getDocs(collection(db, "trainingPrograms"));

  const programs = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as TrainingProgram[];

  return sortByOrder(programs);
};

export const getTrainingProgramById = async (programId: string) => {
  const programRef = doc(db, "trainingPrograms", programId);
  const programSnap = await getDoc(programRef);

  if (!programSnap.exists()) {
    return null;
  }

  return {
    id: programSnap.id,
    ...programSnap.data(),
  } as TrainingProgram;
};

export const createTrainingProgram = async (
  programId: string,
  program: Omit<TrainingProgram, "id" | "createdAt" | "updatedAt">
) => {
  const programRef = doc(db, "trainingPrograms", programId);

  await setDoc(programRef, {
    ...program,
    createdAt: now(),
    updatedAt: now(),
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
};

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

export const getTrainingProgramStats = async (programId: string) => {
  const courses = await getTrainingCoursesByProgram(programId);
  const lessons = await getTrainingLessonsByProgram(programId);

  return {
    courseCount: courses.length,
    lessonCount: lessons.length,
  };
};

export const duplicateTrainingProgram = async (programId: string) => {
  const program = await getTrainingProgramById(programId);

  if (!program) {
    throw new Error("Training program not found.");
  }

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

  const courseIdMap = new Map<string, string>();

  courses.forEach((course) => {
    const courseRef = doc(collection(db, "trainingCourses"));
    courseIdMap.set(course.id, courseRef.id);

    batch.set(courseRef, {
      programId: copyId,
      title: course.title,
      description: course.description || "",
      status: "draft",
      order: course.order || 0,
      createdAt,
      updatedAt: createdAt,
    });
  });

  lessons.forEach((lesson) => {
    const nextCourseId = courseIdMap.get(lesson.courseId);

    if (!nextCourseId) return;

    const lessonRef = doc(collection(db, "trainingLessons"));

    batch.set(lessonRef, {
      programId: copyId,
      courseId: nextCourseId,
      title: lesson.title,
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || "",
      videoType: lesson.videoType || "youtube",
      duration: lesson.duration || "",
      materials: lesson.materials || [],
      allowComments: lesson.allowComments ?? false,
      requireCompletion: lesson.requireCompletion ?? true,
      status: "draft",
      order: lesson.order || 0,
      createdAt,
      updatedAt: createdAt,
    });
  });

  await batch.commit();

  return copyId;
};