import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";


export const updateUserModules = async (
  uid: string,
  enabledModules: string[]
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

  querySnapshot.forEach((doc) => {
    users.push(doc.data());
  });

  return users;
};

export const getUserById = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return userSnap.data();
};