import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export const updateUserModules = async (
  uid: string,
  enabledModules: string[],
) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    enabledModules,
    updatedAt: new Date().toISOString(),
  });
};

export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));

  const users: any[] = [];

  querySnapshot.forEach((docSnap) => {
    users.push({
      uid: docSnap.id,
      ...docSnap.data(),
    });
  });

  return users;
};

export const getUserById = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return {
    uid: userSnap.id,
    ...userSnap.data(),
  };
};

export const updateUserProfile = async (
  uid: string,
  data: {
    name?: string;
    googleName?: string;
    isNameManuallyEdited?: boolean;

    role?: string;
    accountType?: string;
    region?: string;
    department?: string;
    jobRole?: string;
    customJobRole?: string;

    enabledModules?: string[];
    adminModules?: string[];
    enabledDashboardSections?: string[];

    knowledgeCenterAuditEnabled?: boolean;
    auditSettings?: {
      knowledgeCenter?: boolean;
      [key: string]: boolean | undefined;
    };
  },
) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};
