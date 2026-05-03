import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));

  const users: any[] = [];

  querySnapshot.forEach((doc) => {
    users.push(doc.data());
  });

  return users;
};