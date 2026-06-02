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

export const getUserBookmarks = async (userId: string) => {
  const bookmarksRef = collection(db, "users", userId, "bookmarks");
  const q = query(bookmarksRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as any[];
};

export const createUserBookmark = async (
  userId: string,
  data: {
    name: string;
    url: string;
  }
) => {
  const bookmarksRef = collection(db, "users", userId, "bookmarks");

  await addDoc(bookmarksRef, {
    name: data.name,
    url: data.url,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const deleteUserBookmark = async (
  userId: string,
  bookmarkId: string
) => {
  const bookmarkRef = doc(db, "users", userId, "bookmarks", bookmarkId);
  await deleteDoc(bookmarkRef);
};