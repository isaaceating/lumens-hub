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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateModule = async (moduleId: string, data: any) => {
  const moduleRef = doc(db, "modules", moduleId);

  await updateDoc(moduleRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteModule = async (moduleId: string) => {
  const moduleRef = doc(db, "modules", moduleId);
  await deleteDoc(moduleRef);
};