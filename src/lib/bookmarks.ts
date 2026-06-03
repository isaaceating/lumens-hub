import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

const getSortValue = (bookmark: any) => {
  if (typeof bookmark.order === "number") return bookmark.order;

  if (bookmark.createdAt) {
    const timestamp = new Date(bookmark.createdAt).getTime();
    return Number.isNaN(timestamp) ? 999999999 : timestamp;
  }

  return 999999999;
};

export const getUserBookmarks = async (userId: string) => {
  const bookmarksRef = collection(db, "users", userId, "bookmarks");
  const snapshot = await getDocs(bookmarksRef);

  const bookmarks = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as any[];

  return bookmarks.sort((a, b) => getSortValue(a) - getSortValue(b));
};

export const createUserBookmark = async (
  userId: string,
  data: {
    name: string;
    url: string;
    order?: number;
  }
) => {
  const bookmarksRef = collection(db, "users", userId, "bookmarks");

  await addDoc(bookmarksRef, {
    name: data.name,
    url: data.url,
    order: data.order ?? Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateUserBookmark = async (
  userId: string,
  bookmarkId: string,
  data: {
    name: string;
    url: string;
  }
) => {
  const bookmarkRef = doc(db, "users", userId, "bookmarks", bookmarkId);

  await updateDoc(bookmarkRef, {
    name: data.name,
    url: data.url,
    updatedAt: new Date().toISOString(),
  });
};

export const updateUserBookmarkOrder = async (
  userId: string,
  bookmarks: any[]
) => {
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  bookmarks.forEach((bookmark, index) => {
    const bookmarkRef = doc(db, "users", userId, "bookmarks", bookmark.id);

    batch.update(bookmarkRef, {
      order: index + 1,
      updatedAt: now,
    });
  });

  await batch.commit();
};

export const deleteUserBookmark = async (
  userId: string,
  bookmarkId: string
) => {
  const bookmarkRef = doc(db, "users", userId, "bookmarks", bookmarkId);
  await deleteDoc(bookmarkRef);
};