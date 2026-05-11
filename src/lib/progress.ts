import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const getCourseProgress = async (uid: string, courseId: string) => {
  const progressRef = doc(db, "users", uid, "progress", courseId);
  const progressSnap = await getDoc(progressRef);

  if (!progressSnap.exists()) {
    return null;
  }

  return progressSnap.data();
};

export const markCourseComplete = async (uid: string, courseId: string) => {
  const progressRef = doc(db, "users", uid, "progress", courseId);

  await setDoc(
    progressRef,
    {
      courseId,
      completed: true,
      completedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};