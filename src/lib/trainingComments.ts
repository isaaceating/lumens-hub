import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

export type TrainingComment = {
  id: string;
  programId: string;
  lessonId: string;
  parentCommentId?: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  isPinned?: boolean;
  pinnedAt?: string;
  pinnedBy?: string;
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

export const setLessonCommentPinned = async (
  lessonId: string,
  commentId: string,
  isPinned: boolean,
  pinnedBy: string
) => {
  const commentRef = doc(
    db,
    "trainingLessons",
    lessonId,
    "comments",
    commentId
  );

  await updateDoc(commentRef, {
    isPinned,
    pinnedAt: isPinned ? now() : "",
    pinnedBy: isPinned ? pinnedBy : "",
    updatedAt: now(),
  });
};

export const deleteLessonComment = async (
  lessonId: string,
  commentId: string
) => {
  const commentsRef = collection(
    db,
    "trainingLessons",
    lessonId,
    "comments"
  );

  const repliesQuery = query(
    commentsRef,
    where("parentCommentId", "==", commentId)
  );

  const repliesSnapshot = await getDocs(repliesQuery);

  const batch = writeBatch(db);

  repliesSnapshot.docs.forEach((replyDoc) => {
    batch.delete(replyDoc.ref);
  });

  batch.delete(doc(db, "trainingLessons", lessonId, "comments", commentId));

  await batch.commit();
};