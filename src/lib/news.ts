import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type NewsStatus = "draft" | "published" | "archived";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  content: string;
  audience?: string;
  status: NewsStatus;
  publishedAt: Timestamp;
  order?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type CreateNewsInput = {
  title: string;
  summary: string;
  content: string;
  audience?: string;
  status: NewsStatus;
  publishedAt: Timestamp;
  order?: number;
};

export const getPublishedNews = async () => {
  const q = query(
    collection(db, "news"),
    where("status", "==", "published"),
    orderBy("publishedAt", "desc")
  );

  const snapshot = await getDocs(q);

  const news = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as NewsItem[];

  return news.sort((a, b) => {
    const orderA = a.order ?? 9999;
    const orderB = b.order ?? 9999;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return b.publishedAt.toMillis() - a.publishedAt.toMillis();
  });
};

export const createNews = async (news: CreateNewsInput) => {
  const timestamp = Timestamp.now();

  await addDoc(collection(db, "news"), {
    ...news,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
};