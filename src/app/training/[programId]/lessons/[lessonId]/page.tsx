"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUserProfile } from "@/lib/useUserProfile";
import {
  getPublishedTrainingCoursesByProgram,
  getPublishedTrainingLessonsByProgram,
  getPublishedTrainingLevelsByProgram,
  getPublishedTrainingProgramById,
  TrainingCourse,
  TrainingLesson,
  TrainingLevel,
  TrainingProgram,
} from "@/lib/training";
import {
  createLessonComment,
  deleteLessonComment,
  getLessonComments,
  setLessonCommentPinned,
  TrainingComment,
} from "@/lib/trainingComments";

type LessonContent = {
  program: TrainingProgram;
  levels: TrainingLevel[];
  courses: TrainingCourse[];
  lessons: TrainingLesson[];
  lesson: TrainingLesson;
  course?: TrainingCourse;
  level?: TrainingLevel;
};

const getMaterialIcon = (type?: string) => {
  switch (type) {
    case "slides":
      return "💡";
    case "pdf":
      return "📄";
    case "doc":
      return "📝";
    case "video":
      return "🎥";
    case "folder":
      return "📁";
    default:
      return "🔗";
  }
};

const getYouTubeEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    return "";
  } catch {
    return "";
  }
};

const getVimeoEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const videoId = parsed.pathname.split("/").filter(Boolean)[0];

    if (parsed.hostname.includes("vimeo.com") && videoId) {
      return `https://player.vimeo.com/video/${videoId}`;
    }

    return "";
  } catch {
    return "";
  }
};

const getGoogleDrivePreviewUrl = (url: string) => {
  try {
    const parsed = new URL(url);

    if (!parsed.hostname.includes("drive.google.com")) {
      return "";
    }

    const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);

    if (fileMatch?.[1]) {
      return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    }

    const id = parsed.searchParams.get("id");

    if (id) {
      return `https://drive.google.com/file/d/${id}/preview`;
    }

    return "";
  } catch {
    return "";
  }
};

const formatDateTime = (value?: string) => {
  if (!value) return "";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

function VideoBlock({ lesson }: { lesson: TrainingLesson }) {
  if (!lesson.videoUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            No video added yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This lesson currently has no video link.
          </p>
        </div>
      </div>
    );
  }

  const videoType = lesson.videoType || "external";

  if (videoType === "youtube") {
    const embedUrl = getYouTubeEmbedUrl(lesson.videoUrl);

    if (embedUrl) {
      return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      );
    }
  }

  if (videoType === "vimeo") {
    const embedUrl = getVimeoEmbedUrl(lesson.videoUrl);

    if (embedUrl) {
      return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );
    }
  }

  if (videoType === "google-drive") {
    const embedUrl = getGoogleDrivePreviewUrl(lesson.videoUrl);

    if (embedUrl) {
      return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="h-full w-full"
              allow="autoplay"
              allowFullScreen
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Google Drive Video
          </div>

          <a
            href={lesson.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-sm font-medium text-blue-700 hover:underline"
          >
            Open Google Drive video
          </a>

          <p className="mt-2 text-xs text-slate-500">
            This Google Drive link could not be converted into an embedded
            preview. Please check the file link format and sharing permission.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-video items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Video
        </div>

        <a
          href={lesson.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-sm font-medium text-blue-700 hover:underline"
        >
          Open video link
        </a>

        <p className="mt-2 text-xs text-slate-500">
          This video type opens as an external link.
        </p>
      </div>
    </div>
  );
}

function CommentCard({
  comment,
  replies,
  canDelete,
  commentsEnabled,
  currentUserId,
  isAdmin,
  isReplying,
  replyMessage,
  postingReply,
  deletingCommentId,
  pinningCommentId,
  onDelete,
  onPinToggle,
  onStartReply,
  onCancelReply,
  onReplyMessageChange,
  onSubmitReply,
}: {
  comment: TrainingComment;
  replies: TrainingComment[];
  canDelete: boolean;
  commentsEnabled: boolean;
  currentUserId?: string;
  isAdmin: boolean;
  isReplying: boolean;
  replyMessage: string;
  postingReply: boolean;
  deletingCommentId: string | null;
  pinningCommentId: string | null;
  onDelete: (comment: TrainingComment) => void;
  onPinToggle: (comment: TrainingComment) => void;
  onStartReply: (commentId: string) => void;
  onCancelReply: () => void;
  onReplyMessageChange: (commentId: string, value: string) => void;
  onSubmitReply: (comment: TrainingComment) => void;
}) {
  const isPinned = comment.isPinned === true;

  return (
    <div
      className={`rounded-xl border p-4 ${
        isPinned
          ? "border-blue-200 bg-blue-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {isPinned && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                📌 Pinned
              </span>
            )}

            <div className="font-medium text-slate-900">
              {comment.userName || "Lumens user"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-500">
            {formatDateTime(comment.createdAt)}
          </span>

          {isAdmin && !comment.parentCommentId && (
            <button
              type="button"
              onClick={() => onPinToggle(comment)}
              disabled={pinningCommentId === comment.id}
              className="text-xs text-blue-700 hover:underline disabled:text-slate-400"
            >
              {pinningCommentId === comment.id
                ? "Saving..."
                : isPinned
                  ? "Unpin"
                  : "Pin"}
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(comment)}
              disabled={deletingCommentId === comment.id}
              className="text-xs text-red-600 hover:underline disabled:text-slate-400"
            >
              {deletingCommentId === comment.id ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {comment.message}
      </p>

      {commentsEnabled && currentUserId && (
        <button
          type="button"
          onClick={() => onStartReply(comment.id)}
          className="mt-3 text-xs font-medium text-blue-700 hover:underline"
        >
          Reply
        </button>
      )}

      {isReplying && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitReply(comment);
          }}
          className="mt-3 rounded-xl border border-blue-100 bg-white p-3"
        >
          <textarea
            value={replyMessage}
            onChange={(e) => onReplyMessageChange(comment.id, e.target.value)}
            rows={2}
            placeholder={`Reply to ${comment.userName || "this comment"}...`}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancelReply}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={postingReply}
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700 disabled:bg-slate-400"
            >
              {postingReply ? "Posting..." : "Post Reply"}
            </button>
          </div>
        </form>
      )}

      {replies.length > 0 && (
        <div className="mt-4 space-y-3 border-l-2 border-slate-200 pl-4">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-900">
                    {reply.userName || "Lumens user"}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {formatDateTime(reply.createdAt)}
                  </span>

                  {(isAdmin || reply.userId === currentUserId) && (
                    <button
                      type="button"
                      onClick={() => onDelete(reply)}
                      disabled={deletingCommentId === reply.id}
                      className="text-xs text-red-600 hover:underline disabled:text-slate-400"
                    >
                      {deletingCommentId === reply.id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {reply.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LessonDetailContent() {
  const params = useParams();
  const programId = params.programId as string;
  const lessonId = params.lessonId as string;
  const { user, profile, loading: userLoading } = useUserProfile();

  const [content, setContent] = useState<LessonContent | null>(null);
  const [comments, setComments] = useState<TrainingComment[]>([]);
  const [commentMessage, setCommentMessage] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(
    null
  );
  const [replyMessages, setReplyMessages] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [postingComment, setPostingComment] = useState(false);
  const [postingReplyCommentId, setPostingReplyCommentId] = useState<
    string | null
  >(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );
  const [pinningCommentId, setPinningCommentId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const isAdmin = profile?.role === "admin";

  const mainComments = useMemo(() => {
    const main = comments.filter((comment) => !comment.parentCommentId);

    return [...main].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (a.isPinned && b.isPinned) {
        return (b.pinnedAt || "").localeCompare(a.pinnedAt || "");
      }

      return (a.createdAt || "").localeCompare(b.createdAt || "");
    });
  }, [comments]);

  const replyCount = useMemo(() => {
    return comments.filter((comment) => comment.parentCommentId).length;
  }, [comments]);

  const repliesByParent = useMemo(() => {
    const map = new Map<string, TrainingComment[]>();

    comments
      .filter((comment) => comment.parentCommentId)
      .forEach((comment) => {
        const parentId = comment.parentCommentId || "";
        const existing = map.get(parentId) || [];
        map.set(parentId, [...existing, comment]);
      });

    return map;
  }, [comments]);

  const nextLesson = useMemo(() => {
    if (!content) return null;

    const currentIndex = content.lessons.findIndex(
      (item) => item.id === content.lesson.id
    );

    if (currentIndex === -1) return null;

    return content.lessons[currentIndex + 1] || null;
  }, [content]);

  const previousLesson = useMemo(() => {
    if (!content) return null;

    const currentIndex = content.lessons.findIndex(
      (item) => item.id === content.lesson.id
    );

    if (currentIndex <= 0) return null;

    return content.lessons[currentIndex - 1] || null;
  }, [content]);

  const fetchComments = async () => {
    if (!lessonId) return;

    setCommentsLoading(true);

    try {
      const data = await getLessonComments(lessonId);
      setComments(data);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    const fetchLesson = async () => {
      if (!programId || !lessonId) return;

      setLoading(true);

      try {
        const program = await getPublishedTrainingProgramById(programId);

        if (!program) {
          setNotFound(true);
          return;
        }

        const [levels, courses, lessons] = await Promise.all([
          getPublishedTrainingLevelsByProgram(programId),
          getPublishedTrainingCoursesByProgram(programId),
          getPublishedTrainingLessonsByProgram(programId),
        ]);

        const lesson = lessons.find((item) => item.id === lessonId);

        if (!lesson) {
          setNotFound(true);
          return;
        }

        const course = courses.find((item) => item.id === lesson.courseId);
        const level = levels.find((item) => item.id === lesson.levelId);

        setContent({
          program,
          levels,
          courses,
          lessons,
          lesson,
          course,
          level,
        });

        setNotFound(false);
      } catch (error) {
        console.error("Failed to load lesson:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [programId, lessonId]);

  useEffect(() => {
    fetchComments();
  }, [lessonId]);

  const getCurrentUserName = () => {
    return user?.displayName || profile?.name || user?.email || "Lumens user";
  };

  const getCurrentUserEmail = () => {
    return user?.email || profile?.email || "";
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content || !user || userLoading) {
      alert("Please sign in before posting a comment.");
      return;
    }

    if (content.lesson.allowComments === false) {
      alert("Comments are disabled for this lesson.");
      return;
    }

    const message = commentMessage.trim();

    if (!message) {
      alert("Please enter a comment.");
      return;
    }

    setPostingComment(true);

    try {
      await createLessonComment({
        programId,
        lessonId,
        userId: user.uid,
        userName: getCurrentUserName(),
        userEmail: getCurrentUserEmail(),
        message,
        isPinned: false,
      });

      setCommentMessage("");
      await fetchComments();
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert("Failed to post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  const handlePostReply = async (parentComment: TrainingComment) => {
    if (!content || !user || userLoading) {
      alert("Please sign in before posting a reply.");
      return;
    }

    if (content.lesson.allowComments === false) {
      alert("Comments are disabled for this lesson.");
      return;
    }

    const message = (replyMessages[parentComment.id] || "").trim();

    if (!message) {
      alert("Please enter a reply.");
      return;
    }

    setPostingReplyCommentId(parentComment.id);

    try {
      await createLessonComment({
        programId,
        lessonId,
        parentCommentId: parentComment.id,
        userId: user.uid,
        userName: getCurrentUserName(),
        userEmail: getCurrentUserEmail(),
        message,
        isPinned: false,
      });

      setReplyMessages((prev) => ({
        ...prev,
        [parentComment.id]: "",
      }));
      setReplyingToCommentId(null);
      await fetchComments();
    } catch (error) {
      console.error("Failed to post reply:", error);
      alert("Failed to post reply.");
    } finally {
      setPostingReplyCommentId(null);
    }
  };

  const handleTogglePinComment = async (comment: TrainingComment) => {
    if (!isAdmin || !user) {
      alert("Only admins can pin comments.");
      return;
    }

    if (comment.parentCommentId) {
      alert("Only main comments can be pinned.");
      return;
    }

    setPinningCommentId(comment.id);

    try {
      await setLessonCommentPinned(
        lessonId,
        comment.id,
        comment.isPinned !== true,
        user.uid
      );

      await fetchComments();
    } catch (error) {
      console.error("Failed to update pinned comment:", error);
      alert("Failed to update pinned comment.");
    } finally {
      setPinningCommentId(null);
    }
  };

  const handleDeleteComment = async (comment: TrainingComment) => {
    const canDelete = isAdmin || comment.userId === user?.uid;

    if (!canDelete) {
      alert("You can only delete your own comments.");
      return;
    }

    const confirmed = window.confirm(
      comment.parentCommentId
        ? "Delete this reply?"
        : "Delete this comment and its replies?"
    );

    if (!confirmed) return;

    setDeletingCommentId(comment.id);

    try {
      await deleteLessonComment(lessonId, comment.id);
      await fetchComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Failed to delete comment.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading lesson...</div>;
  }

  if (notFound || !content) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Lesson not available
        </h1>
        <p className="mt-3 text-slate-500">
          This lesson may still be in draft or archived.
        </p>

        <Link
          href={`/training/${programId}`}
          className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Back to Program
        </Link>
      </div>
    );
  }

  const { program, lesson, course, level } = content;
  const commentsEnabled = lesson.allowComments !== false;

return (
  <div className="-mt-5">
    <div className="mb-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
      <Link
        href={`/training/${programId}`}
        className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 hover:bg-blue-100"
      >
        ← {program.title}
      </Link>

      <span className="text-slate-300">/</span>

      {level && (
        <>
          <span className="max-w-[180px] truncate">{level.title}</span>
          <span className="text-slate-300">/</span>
        </>
      )}

      {course && (
        <>
          <span className="max-w-[220px] truncate">{course.title}</span>
          <span className="text-slate-300">/</span>
        </>
      )}

      <span className="font-medium text-slate-700">
        Lesson {lesson.order || 0}
      </span>

      {lesson.duration && (
        <>
          <span className="text-slate-300">/</span>
          <span>{lesson.duration}</span>
        </>
      )}
    </div>

    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <VideoBlock lesson={lesson} />
        </div>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Lesson Resources
            </h2>

            {lesson.materials && lesson.materials.length > 0 ? (
              <div className="mt-3 space-y-2">
                {lesson.materials.map((material, index) => (
                  <a
                    key={`${lesson.id}-${index}`}
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <span className="shrink-0 text-base">
                      {getMaterialIcon(material.type)}
                    </span>

                    <span className="min-w-0 truncate font-medium">
                      {material.title}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No resources added for this lesson.
              </p>
            )}
          </div>

          <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {previousLesson ? (
              <Link
                href={`/training/${programId}/lessons/${previousLesson.id}`}
                className="rounded-lg bg-slate-100 px-4 py-2 text-center text-sm text-slate-700 hover:bg-slate-200"
              >
                Previous Lesson
              </Link>
            ) : (
              <div className="rounded-lg bg-slate-50 px-4 py-2 text-center text-sm text-slate-400">
                No previous lesson
              </div>
            )}

            {nextLesson ? (
              <Link
                href={`/training/${programId}/lessons/${nextLesson.id}`}
                className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm text-white hover:bg-blue-700"
              >
                Next Lesson
              </Link>
            ) : (
              <div className="rounded-lg bg-slate-50 px-4 py-2 text-center text-sm text-slate-400">
                Last lesson
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Lesson {lesson.order || 0}
          </span>

          {lesson.duration && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {lesson.duration}
            </span>
          )}

          {level && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {level.title}
            </span>
          )}

          {course && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {course.title}
            </span>
          )}

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            {program.title}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">{lesson.title}</h1>

        {lesson.description ? (
          <p className="mt-3 max-w-4xl text-slate-600">
            {lesson.description}
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No lesson description.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Discussion
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Ask questions or share notes with everyone who can access this
              lesson.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
            {mainComments.length} comments / {replyCount} replies
          </span>
        </div>

        {commentsEnabled ? (
          <form onSubmit={handlePostComment} className="mb-5">
            <textarea
              value={commentMessage}
              onChange={(e) => setCommentMessage(e.target.value)}
              rows={3}
              placeholder="Write a comment or question..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Your comment will be visible to everyone who can access this
                lesson.
              </p>

              <button
                type="submit"
                disabled={postingComment || userLoading || !user}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-slate-400"
              >
                {postingComment ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Comments are disabled for this lesson.
          </div>
        )}

        {commentsLoading ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
            No comments yet. Be the first to start the discussion.
          </div>
        ) : (
          <div className="space-y-3">
            {mainComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                replies={repliesByParent.get(comment.id) || []}
                canDelete={isAdmin || comment.userId === user?.uid}
                commentsEnabled={commentsEnabled}
                currentUserId={user?.uid}
                isAdmin={isAdmin}
                isReplying={replyingToCommentId === comment.id}
                replyMessage={replyMessages[comment.id] || ""}
                postingReply={postingReplyCommentId === comment.id}
                deletingCommentId={deletingCommentId}
                pinningCommentId={pinningCommentId}
                onDelete={handleDeleteComment}
                onPinToggle={handleTogglePinComment}
                onStartReply={(commentId) => setReplyingToCommentId(commentId)}
                onCancelReply={() => setReplyingToCommentId(null)}
                onReplyMessageChange={(commentId, value) =>
                  setReplyMessages((prev) => ({
                    ...prev,
                    [commentId]: value,
                  }))
                }
                onSubmitReply={handlePostReply}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          {previousLesson && (
            <Link
              href={`/training/${programId}/lessons/${previousLesson.id}`}
              className="inline-block rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
            >
              Previous Lesson
            </Link>
          )}
        </div>

        <div>
          {nextLesson && (
            <Link
              href={`/training/${programId}/lessons/${nextLesson.id}`}
              className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Next Lesson
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LessonDetailPage() {
  return <LessonDetailContent />;
}