import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export const getCoursesByLevel = async (levelId: string) => {
  const q = query(
    collection(db, "courses"),
    where("levelId", "==", levelId)
  );

  const snapshot = await getDocs(q);

  const courses = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as any[];

  return courses.sort((a, b) => (a.order || 0) - (b.order || 0));
};