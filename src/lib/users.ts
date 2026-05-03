import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";

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