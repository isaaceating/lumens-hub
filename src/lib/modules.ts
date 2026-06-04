import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const now = () => new Date().toISOString();

export const getAllModules = async () => {
  const snapshot = await getDocs(collection(db, "modules"));

  const modules = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as any[];

  return modules.sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const getModuleById = async (moduleId: string) => {
  const moduleRef = doc(db, "modules", moduleId);
  const moduleSnap = await getDoc(moduleRef);

  if (!moduleSnap.exists()) {
    return null;
  }

  return {
    id: moduleSnap.id,
    ...moduleSnap.data(),
  };
};

export const createModule = async (moduleData: any) => {
  const moduleRef = doc(db, "modules", moduleData.id);

  await setDoc(moduleRef, {
    ...moduleData,
    createdAt: now(),
    updatedAt: now(),
  });
};

export const updateModule = async (moduleId: string, data: any) => {
  const moduleRef = doc(db, "modules", moduleId);

  await updateDoc(moduleRef, {
    ...data,
    updatedAt: now(),
  });
};

export const deleteModule = async (moduleId: string) => {
  const moduleRef = doc(db, "modules", moduleId);
  await deleteDoc(moduleRef);
};

export const syncTrainingProgramModule = async (program: {
  id: string;
  title: string;
  description?: string;
  status?: string;
  order?: number;
}) => {
  const moduleRef = doc(db, "modules", program.id);
  const moduleSnap = await getDoc(moduleRef);

  const isPublished = program.status === "published";
  const timestamp = now();

  const payload = {
    name: program.title,
    description: program.description || "Open this training program.",
    type: "feature",
    moduleKind: "native",
    section: "resource",
    href: `/training/${program.id}`,
    embedUrl: null,
    showOnDashboard: isPublished,
    enabled: isPublished,
    order: program.order || 0,
    locked: true,
    updatedAt: timestamp,
  };

  if (moduleSnap.exists()) {
    await setDoc(moduleRef, payload, { merge: true });
    return;
  }

  await setDoc(moduleRef, {
    ...payload,
    createdAt: timestamp,
  });
};