import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export type TrainingQuizProgress = {
  lessonId: string;
  score: number;
  passed: boolean;
  submittedAt: string;
};

export type TrainingLessonProgress = {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  quizScore?: number;
  quizPassed?: boolean;
  quizSubmittedAt?: string;
};

export type TrainingProgramProgress = {
  id: string;
  userId: string;
  programId: string;
  completedLessonIds: string[];
  lessonProgress: Record<string, TrainingLessonProgress>;
  quizProgress: Record<string, TrainingQuizProgress>;
  createdAt?: string;
  updatedAt?: string;
};

const now = () => new Date().toISOString();

const getTrainingProgressDocId = (userId: string, programId: string) => {
  return `${userId}_${programId}`;
};

const getTrainingProgressRef = (userId: string, programId: string) => {
  return doc(db, "trainingProgress", getTrainingProgressDocId(userId, programId));
};

export const getTrainingProgress = async (
  userId: string,
  programId: string
) => {
  const progressRef = getTrainingProgressRef(userId, programId);
  const progressSnap = await getDoc(progressRef);

  if (!progressSnap.exists()) {
    return null;
  }

  return {
    id: progressSnap.id,
    ...progressSnap.data(),
  } as TrainingProgramProgress;
};

export const createEmptyTrainingProgress = (
  userId: string,
  programId: string
): TrainingProgramProgress => {
  return {
    id: getTrainingProgressDocId(userId, programId),
    userId,
    programId,
    completedLessonIds: [],
    lessonProgress: {},
    quizProgress: {},
    createdAt: now(),
    updatedAt: now(),
  };
};

export const upsertTrainingProgress = async (
  userId: string,
  programId: string,
  data: Partial<Omit<TrainingProgramProgress, "id" | "userId" | "programId">>
) => {
  const progressRef = getTrainingProgressRef(userId, programId);
  const existingProgress = await getTrainingProgress(userId, programId);
  const timestamp = now();

  await setDoc(
    progressRef,
    {
      userId,
      programId,
      createdAt: existingProgress?.createdAt || timestamp,
      ...data,
      updatedAt: timestamp,
    },
    { merge: true }
  );
};

export const markTrainingLessonComplete = async ({
  userId,
  programId,
  lessonId,
}: {
  userId: string;
  programId: string;
  lessonId: string;
}) => {
  const existingProgress =
    (await getTrainingProgress(userId, programId)) ||
    createEmptyTrainingProgress(userId, programId);

  const completedLessonIds = Array.from(
    new Set([...(existingProgress.completedLessonIds || []), lessonId])
  );

  const timestamp = now();

  await upsertTrainingProgress(userId, programId, {
    completedLessonIds,
    lessonProgress: {
      ...(existingProgress.lessonProgress || {}),
      [lessonId]: {
        ...(existingProgress.lessonProgress?.[lessonId] || {}),
        lessonId,
        completed: true,
        completedAt:
          existingProgress.lessonProgress?.[lessonId]?.completedAt || timestamp,
      },
    },
    quizProgress: existingProgress.quizProgress || {},
  });

  return completedLessonIds;
};

export const unmarkTrainingLessonComplete = async ({
  userId,
  programId,
  lessonId,
}: {
  userId: string;
  programId: string;
  lessonId: string;
}) => {
  const existingProgress =
    (await getTrainingProgress(userId, programId)) ||
    createEmptyTrainingProgress(userId, programId);

  const completedLessonIds = (existingProgress.completedLessonIds || []).filter(
    (id) => id !== lessonId
  );

  await upsertTrainingProgress(userId, programId, {
    completedLessonIds,
    lessonProgress: {
      ...(existingProgress.lessonProgress || {}),
      [lessonId]: {
        ...(existingProgress.lessonProgress?.[lessonId] || {}),
        lessonId,
        completed: false,
      },
    },
    quizProgress: existingProgress.quizProgress || {},
  });

  return completedLessonIds;
};

export const saveTrainingQuizProgress = async ({
  userId,
  programId,
  lessonId,
  score,
  passed,
}: {
  userId: string;
  programId: string;
  lessonId: string;
  score: number;
  passed: boolean;
}) => {
  const existingProgress =
    (await getTrainingProgress(userId, programId)) ||
    createEmptyTrainingProgress(userId, programId);

  const submittedAt = now();

  const completedLessonIds = passed
    ? Array.from(new Set([...(existingProgress.completedLessonIds || []), lessonId]))
    : existingProgress.completedLessonIds || [];

  await upsertTrainingProgress(userId, programId, {
    completedLessonIds,
    lessonProgress: {
      ...(existingProgress.lessonProgress || {}),
      [lessonId]: {
        ...(existingProgress.lessonProgress?.[lessonId] || {}),
        lessonId,
        completed:
          passed || existingProgress.lessonProgress?.[lessonId]?.completed === true,
        completedAt: passed
          ? existingProgress.lessonProgress?.[lessonId]?.completedAt || submittedAt
          : existingProgress.lessonProgress?.[lessonId]?.completedAt,
        quizScore: score,
        quizPassed: passed,
        quizSubmittedAt: submittedAt,
      },
    },
    quizProgress: {
      ...(existingProgress.quizProgress || {}),
      [lessonId]: {
        lessonId,
        score,
        passed,
        submittedAt,
      },
    },
  });

  return {
    score,
    passed,
    submittedAt,
    completedLessonIds,
  };
};

export const resetTrainingQuizProgress = async ({
  userId,
  programId,
  lessonId,
  removeCompletion = false,
}: {
  userId: string;
  programId: string;
  lessonId: string;
  removeCompletion?: boolean;
}) => {
  const existingProgress =
    (await getTrainingProgress(userId, programId)) ||
    createEmptyTrainingProgress(userId, programId);

  const nextQuizProgress = {
    ...(existingProgress.quizProgress || {}),
  };

  delete nextQuizProgress[lessonId];

  const completedLessonIds = removeCompletion
    ? (existingProgress.completedLessonIds || []).filter((id) => id !== lessonId)
    : existingProgress.completedLessonIds || [];

  await upsertTrainingProgress(userId, programId, {
    completedLessonIds,
    lessonProgress: {
      ...(existingProgress.lessonProgress || {}),
      [lessonId]: {
        ...(existingProgress.lessonProgress?.[lessonId] || {}),
        lessonId,
        completed: removeCompletion
          ? false
          : existingProgress.lessonProgress?.[lessonId]?.completed === true,
        quizScore: undefined,
        quizPassed: undefined,
        quizSubmittedAt: undefined,
      },
    },
    quizProgress: nextQuizProgress,
  });

  return {
    completedLessonIds,
    quizProgress: nextQuizProgress,
  };
};

export const mergeLocalCompletedLessonsToFirestore = async ({
  userId,
  programId,
  localCompletedLessonIds,
}: {
  userId: string;
  programId: string;
  localCompletedLessonIds: string[];
}) => {
  const existingProgress =
    (await getTrainingProgress(userId, programId)) ||
    createEmptyTrainingProgress(userId, programId);

  const completedLessonIds = Array.from(
    new Set([
      ...(existingProgress.completedLessonIds || []),
      ...localCompletedLessonIds,
    ])
  );

  const timestamp = now();

  const lessonProgress = {
    ...(existingProgress.lessonProgress || {}),
  };

  completedLessonIds.forEach((lessonId) => {
    lessonProgress[lessonId] = {
      ...(lessonProgress[lessonId] || {}),
      lessonId,
      completed: true,
      completedAt: lessonProgress[lessonId]?.completedAt || timestamp,
    };
  });

  await upsertTrainingProgress(userId, programId, {
    completedLessonIds,
    lessonProgress,
    quizProgress: existingProgress.quizProgress || {},
  });

  return completedLessonIds;
};