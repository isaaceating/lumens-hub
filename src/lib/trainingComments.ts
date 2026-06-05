import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firebase";

export type TrainingComment = {
  id: string;
  programId: string;
  lessonId: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
};

const now = () => new Date().toISOString();

export const getLessonComments = async (lessonId: string) => {
  const commentsRef = collection(
    db,
    "trainingLessons",
    lessonId,
    "comments"
  );

  const q = query(commentsRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as TrainingComment[];
};

export const createLessonComment = async (
  comment: Omit<TrainingComment, "id" | "createdAt" | "updatedAt">
) => {
  const commentsRef = collection(
    db,
    "trainingLessons",
    comment.lessonId,
    "comments"
  );

  await addDoc(commentsRef, {
    ...comment,
    createdAt: now(),
  });
};

export const deleteLessonComment = async (
  lessonId: string,
  commentId: string
) => {
  await deleteDoc(doc(db, "trainingLessons", lessonId, "comments", commentId));
};