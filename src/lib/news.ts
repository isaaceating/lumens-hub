import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
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

export type UpdateNewsInput = Partial<CreateNewsInput>;

export type NewsCarouselSettings = {
  autoSlideEnabled: boolean;
  autoSlideSeconds: 2 | 3 | 4 | 5;
  updatedAt?: Timestamp;
};

export const DEFAULT_NEWS_CAROUSEL_SETTINGS: NewsCarouselSettings = {
  autoSlideEnabled: true,
  autoSlideSeconds: 2,
};

const NEWS_CAROUSEL_SETTINGS_REF = doc(db, "siteSettings", "newsCarousel");

export const getNewsCarouselSettings = async () => {
  const settingsSnap = await getDoc(NEWS_CAROUSEL_SETTINGS_REF);

  if (!settingsSnap.exists()) {
    return DEFAULT_NEWS_CAROUSEL_SETTINGS;
  }

  const data = settingsSnap.data() as Partial<NewsCarouselSettings>;
  const allowedSeconds = [2, 3, 4, 5];

  return {
    autoSlideEnabled:
      typeof data.autoSlideEnabled === "boolean"
        ? data.autoSlideEnabled
        : DEFAULT_NEWS_CAROUSEL_SETTINGS.autoSlideEnabled,
    autoSlideSeconds: allowedSeconds.includes(data.autoSlideSeconds as number)
      ? (data.autoSlideSeconds as 2 | 3 | 4 | 5)
      : DEFAULT_NEWS_CAROUSEL_SETTINGS.autoSlideSeconds,
    updatedAt: data.updatedAt,
  };
};

export const updateNewsCarouselSettings = async (
  settings: Omit<NewsCarouselSettings, "updatedAt">
) => {
  await setDoc(
    NEWS_CAROUSEL_SETTINGS_REF,
    {
      ...settings,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
};

const sortNews = (items: NewsItem[]) => {
  return [...items].sort((a, b) => {
    const orderA = a.order ?? 9999;
    const orderB = b.order ?? 9999;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return b.publishedAt.toMillis() - a.publishedAt.toMillis();
  });
};

export const getPublishedNews = async () => {
  const q = query(collection(db, "news"), where("status", "==", "published"));

  const snapshot = await getDocs(q);

  const news = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as NewsItem[];

  return sortNews(news);
};

export const getAllNews = async () => {
  const snapshot = await getDocs(collection(db, "news"));

  const news = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as NewsItem[];

  return sortNews(news);
};

export const getNewsById = async (newsId: string) => {
  const newsRef = doc(db, "news", newsId);
  const newsSnap = await getDoc(newsRef);

  if (!newsSnap.exists()) {
    return null;
  }

  return {
    id: newsSnap.id,
    ...newsSnap.data(),
  } as NewsItem;
};

export const createNews = async (news: CreateNewsInput) => {
  const timestamp = Timestamp.now();

  await addDoc(collection(db, "news"), {
    ...news,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
};

export const updateNews = async (newsId: string, news: UpdateNewsInput) => {
  const newsRef = doc(db, "news", newsId);

  await updateDoc(newsRef, {
    ...news,
    updatedAt: Timestamp.now(),
  });
};

export const deleteNews = async (newsId: string) => {
  const newsRef = doc(db, "news", newsId);
  await deleteDoc(newsRef);
};