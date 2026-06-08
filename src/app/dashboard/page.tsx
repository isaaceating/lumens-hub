"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signInWithGoogle } from "@/lib/auth";
import { useUserProfile } from "@/lib/useUserProfile";
import { getAllModules } from "@/lib/modules";
import {
  createUserBookmark,
  deleteUserBookmark,
  getUserBookmarks,
  updateUserBookmark,
  updateUserBookmarkOrder,
} from "@/lib/bookmarks";

type DashboardSectionKey =
  | "news"
  | "activity"
  | "workspaces"
  | "resources"
  | "bookmarks";

type NewsItem = {
  id: string;
  title: string;
  date: string;
  summary: string;
  content: string;
  audience: string;
};

const mockNews: NewsItem[] = [
  {
    id: "news-1",
    title: "PDM Training content has been updated",
    date: "2026/06/05",
    summary: "New lesson resources and discussion features are now available.",
    content:
      "PDM Training now includes lesson resources, embedded video support, shared discussion, replies, and pinned comments. Please check the latest training content and leave questions in the discussion area.",
    audience: "Internal",
  },
  {
    id: "news-2",
    title: "Lesson discussion is now available",
    date: "2026/06/04",
    summary: "Users can now ask questions and reply under each lesson.",
    content:
      "The Training module now supports shared discussion for each lesson. All users with access to a lesson can view and participate in the discussion.",
    audience: "Internal",
  },
  {
    id: "news-3",
    title: "Google Drive video preview supported",
    date: "2026/06/03",
    summary: "Training lessons can now preview Google Drive MP4 videos.",
    content:
      "Admins can set lesson video type to google-drive and paste a Google Drive MP4 file link. The lesson player will automatically use Google Drive preview mode.",
    audience: "Internal",
  },
  {
    id: "news-4",
    title: "Lumens Portal dashboard redesign started",
    date: "2026/06/02",
    summary: "The homepage is being redesigned for better user experience.",
    content:
      "The new dashboard will include quick access, latest news, training activity, workspaces, official resources, and personal bookmarks.",
    audience: "Internal",
  },
];

const getModuleHref = (module: any) => {
  if (module.moduleKind === "embedded") {
    return `/modules/${module.id}`;
  }

  return module.href || "#";
};

const WorkspaceIcon = () => (
  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-700 ring-1 ring-indigo-100">
    ◈
  </div>
);

const ResourceIcon = () => (
  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-700 ring-1 ring-blue-100">
    ▦
  </div>
);

const BookmarkIcon = () => (
  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-700 ring-1 ring-slate-200">
    ★
  </div>
);

const SectionTitle = ({
  id,
  title,
  action,
  showBackToTop = false,
}: {
  id?: string;
  title: string;
  action?: React.ReactNode;
  showBackToTop?: boolean;
}) => {
  return (
    <div
      id={id}
      className="mb-5 flex scroll-mt-24 flex-wrap items-center justify-between gap-3"
    >
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {action}

        {showBackToTop && (
          <a
            href="#top"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            ↑ Top
          </a>
        )}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user, profile, loading } = useUserProfile();

  const [modules, setModules] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [bookmarkName, setBookmarkName] = useState("");
  const [bookmarkUrl, setBookmarkUrl] = useState("");
  const [savingBookmark, setSavingBookmark] = useState(false);

  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(
    null
  );
  const [editBookmarkName, setEditBookmarkName] = useState("");
  const [editBookmarkUrl, setEditBookmarkUrl] = useState("");
  const [updatingBookmarkId, setUpdatingBookmarkId] = useState<string | null>(
    null
  );

  const [deletingBookmarkId, setDeletingBookmarkId] = useState<string | null>(
    null
  );

  const [draggingBookmarkId, setDraggingBookmarkId] = useState<string | null>(
    null
  );
  const [reorderingBookmarks, setReorderingBookmarks] = useState(false);

  const [signingIn, setSigningIn] = useState(false);

  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const enabledModules = profile?.enabledModules || [];
  const enabledDashboardSections = profile?.enabledDashboardSections;

  const isSectionEnabled = (sectionKey: DashboardSectionKey) => {
    if (!Array.isArray(enabledDashboardSections)) {
      return true;
    }

    return enabledDashboardSections.includes(sectionKey);
  };

  const showNews = isSectionEnabled("news");
  const showActivity = isSectionEnabled("activity");
  const showWorkspaces = isSectionEnabled("workspaces");
  const showResources = isSectionEnabled("resources");
  const showBookmarks = isSectionEnabled("bookmarks");

  const fetchBookmarks = async () => {
    if (!user?.uid) return;

    const data = await getUserBookmarks(user.uid);
    setBookmarks(data);
  };

  useEffect(() => {
    const fetchModules = async () => {
      if (!user || !profile) return;

      const data = await getAllModules();
      setModules(data);
    };

    if (!loading && user && profile) {
      fetchModules();
    }
  }, [loading, user, profile]);

  useEffect(() => {
    if (!loading && user?.uid) {
      fetchBookmarks();
    }
  }, [loading, user?.uid]);

  useEffect(() => {
    if (loading) return;
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#bookmarks") return;

    const scrollToBookmarks = () => {
      const target = document.getElementById("bookmarks");

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    const timer = window.setTimeout(scrollToBookmarks, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loading, user, bookmarks.length]);

  const visibleFeatureModules = modules.filter(
    (module) =>
      module.enabled !== false &&
      module.showOnDashboard &&
      module.type === "feature" &&
      enabledModules.includes(module.id)
  );

  const workspaceModules = visibleFeatureModules.filter(
    (module) => module.section === "workspace"
  );

  const resourceModules = visibleFeatureModules.filter(
    (module) => module.section !== "workspace"
  );

  const visibleNewsItems = useMemo(() => {
    if (mockNews.length <= 3) {
      return mockNews;
    }

    return [
      mockNews[activeNewsIndex],
      mockNews[(activeNewsIndex + 1) % mockNews.length],
      mockNews[(activeNewsIndex + 2) % mockNews.length],
    ];
  }, [activeNewsIndex]);

  const quickAccessItems = [
    {
      key: "workspaces",
      label: "My Workspaces",
      href: "#workspaces",
      enabled: showWorkspaces,
    },
    {
      key: "resources",
      label: "Official Resources",
      href: "#resources",
      enabled: showResources,
    },
    {
      key: "bookmarks",
      label: "My Bookmarks",
      href: "#bookmarks",
      enabled: showBookmarks,
    },
  ].filter((item) => item.enabled);

  const normalizeUrl = (url: string) => {
    const trimmed = url.trim();

    if (!trimmed) return "";

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }

    return `https://${trimmed}`;
  };

  const handleLogin = async () => {
    if (signingIn) return;

    setSigningIn(true);

    try {
      await signInWithGoogle();
    } finally {
      setSigningIn(false);
    }
  };

  const resetCreateForm = () => {
    setBookmarkName("");
    setBookmarkUrl("");
    setShowBookmarkForm(false);
  };

  const resetEditForm = () => {
    setEditingBookmarkId(null);
    setEditBookmarkName("");
    setEditBookmarkUrl("");
  };

  const handleCreateBookmark = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) {
      alert("Please login before adding a bookmark.");
      return;
    }

    const name = bookmarkName.trim();
    const url = normalizeUrl(bookmarkUrl);

    if (!name) {
      alert("Bookmark name is required.");
      return;
    }

    if (!url) {
      alert("Bookmark URL is required.");
      return;
    }

    setSavingBookmark(true);

    try {
      await createUserBookmark(user.uid, {
        name,
        url,
      });

      resetCreateForm();
      await fetchBookmarks();
    } catch (error) {
      console.error("Failed to create bookmark:", error);
      alert("Failed to create bookmark. Please try again.");
    } finally {
      setSavingBookmark(false);
    }
  };

  const startEditBookmark = (bookmark: any) => {
    setShowBookmarkForm(false);
    setEditingBookmarkId(bookmark.id);
    setEditBookmarkName(bookmark.name || "");
    setEditBookmarkUrl(bookmark.url || "");
  };

  const handleUpdateBookmark = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid || !editingBookmarkId) return;

    const name = editBookmarkName.trim();
    const url = normalizeUrl(editBookmarkUrl);

    if (!name) {
      alert("Bookmark name is required.");
      return;
    }

    if (!url) {
      alert("Bookmark URL is required.");
      return;
    }

    setUpdatingBookmarkId(editingBookmarkId);

    try {
      await updateUserBookmark(user.uid, editingBookmarkId, {
        name,
        url,
      });

      resetEditForm();
      await fetchBookmarks();
    } catch (error) {
      console.error("Failed to update bookmark:", error);
      alert("Failed to update bookmark. Please try again.");
    } finally {
      setUpdatingBookmarkId(null);
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    if (!user?.uid) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this bookmark?"
    );

    if (!confirmed) return;

    setDeletingBookmarkId(bookmarkId);

    try {
      await deleteUserBookmark(user.uid, bookmarkId);

      if (editingBookmarkId === bookmarkId) {
        resetEditForm();
      }

      await fetchBookmarks();
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
      alert("Failed to delete bookmark. Please try again.");
    } finally {
      setDeletingBookmarkId(null);
    }
  };

  const handleReorderBookmarks = async (targetBookmarkId: string) => {
    if (
      !user?.uid ||
      !draggingBookmarkId ||
      draggingBookmarkId === targetBookmarkId ||
      reorderingBookmarks
    ) {
      return;
    }

    const currentIndex = bookmarks.findIndex(
      (bookmark) => bookmark.id === draggingBookmarkId
    );
    const targetIndex = bookmarks.findIndex(
      (bookmark) => bookmark.id === targetBookmarkId
    );

    if (currentIndex < 0 || targetIndex < 0) return;

    const nextBookmarks = [...bookmarks];
    const [movedBookmark] = nextBookmarks.splice(currentIndex, 1);
    nextBookmarks.splice(targetIndex, 0, movedBookmark);

    setBookmarks(nextBookmarks);
    setDraggingBookmarkId(null);
    setReorderingBookmarks(true);

    try {
      await updateUserBookmarkOrder(user.uid, nextBookmarks);
    } catch (error) {
      console.error("Failed to reorder bookmarks:", error);
      alert("Failed to reorder bookmarks. Please refresh and try again.");
      await fetchBookmarks();
    } finally {
      setReorderingBookmarks(false);
    }
  };

  const goToPreviousNews = () => {
    setActiveNewsIndex((prev) =>
      prev === 0 ? mockNews.length - 1 : prev - 1
    );
  };

  const goToNextNews = () => {
    setActiveNewsIndex((prev) => (prev + 1) % mockNews.length);
  };

  const renderModuleCard = (module: any, section: "workspace" | "resource") => {
    const href = getModuleHref(module);
    const Icon = section === "workspace" ? WorkspaceIcon : ResourceIcon;

    const cardContent = (
      <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
        <Icon />

        <h3 className="text-lg font-semibold text-slate-900">
          {module.name}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {module.description || "Open this module."}
        </p>
      </div>
    );

    if (module.moduleKind === "external") {
      return (
        <a
          key={module.id}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {cardContent}
        </a>
      );
    }

    return (
      <Link key={module.id} href={href}>
        {cardContent}
      </Link>
    );
  };

  const renderEditBookmarkCard = (bookmark: any) => {
    return (
      <form
        key={bookmark.id}
        onSubmit={handleUpdateBookmark}
        className="h-full min-h-[220px] rounded-2xl border border-blue-200 bg-white p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-slate-900">
          Edit Bookmark
        </h3>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              value={editBookmarkName}
              onChange={(e) => setEditBookmarkName(e.target.value)}
              placeholder="Lumens Website"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              URL
            </label>
            <input
              value={editBookmarkUrl}
              onChange={(e) => setEditBookmarkUrl(e.target.value)}
              placeholder="https://www.mylumens.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={updatingBookmarkId === bookmark.id}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-slate-400"
          >
            {updatingBookmarkId === bookmark.id ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={resetEditForm}
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-300"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleDeleteBookmark(bookmark.id)}
            disabled={deletingBookmarkId === bookmark.id}
            className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 hover:bg-red-100 disabled:text-slate-400"
          >
            {deletingBookmarkId === bookmark.id ? "Deleting..." : "Delete"}
          </button>
        </div>
      </form>
    );
  };

  const renderBookmarkCard = (bookmark: any) => {
    if (editingBookmarkId === bookmark.id) {
      return renderEditBookmarkCard(bookmark);
    }

    return (
      <div
        key={bookmark.id}
        draggable
        onDragStart={() => {
          resetEditForm();
          setShowBookmarkForm(false);
          setDraggingBookmarkId(bookmark.id);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleReorderBookmarks(bookmark.id)}
        onDragEnd={() => setDraggingBookmarkId(null)}
        className={`group relative h-full cursor-move rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md ${
          draggingBookmarkId === bookmark.id ? "opacity-50" : ""
        }`}
      >
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full"
          onClick={(e) => {
            if (draggingBookmarkId) {
              e.preventDefault();
            }
          }}
        >
          <BookmarkIcon />

          <h3 className="text-lg font-semibold text-slate-900">
            {bookmark.name}
          </h3>

          <p className="mt-2 truncate text-sm text-slate-500">
            {bookmark.url}
          </p>
        </a>

        <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition group-hover:opacity-100">
          <span className="rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-500 shadow-sm ring-1 ring-slate-200">
            Drag
          </span>

          <button
            type="button"
            onClick={() => startEditBookmark(bookmark)}
            className="rounded-lg bg-white px-2 py-1 text-xs text-blue-600 shadow-sm ring-1 ring-slate-200 hover:bg-blue-50"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => handleDeleteBookmark(bookmark.id)}
            disabled={deletingBookmarkId === bookmark.id}
            className="rounded-lg bg-white px-2 py-1 text-xs text-red-600 shadow-sm ring-1 ring-slate-200 hover:bg-red-50 disabled:text-slate-400"
          >
            {deletingBookmarkId === bookmark.id ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    );
  };

  const renderAddBookmarkCard = () => {
    if (showBookmarkForm) {
      return (
        <form
          onSubmit={handleCreateBookmark}
          className="h-full min-h-[220px] rounded-2xl border border-blue-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900">
            Add Bookmark
          </h3>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                value={bookmarkName}
                onChange={(e) => setBookmarkName(e.target.value)}
                placeholder="Lumens Website"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                URL
              </label>
              <input
                value={bookmarkUrl}
                onChange={(e) => setBookmarkUrl(e.target.value)}
                placeholder="https://www.mylumens.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={savingBookmark}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-slate-400"
            >
              {savingBookmark ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={resetCreateForm}
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      );
    }

    return (
      <button
        type="button"
        onClick={() => {
          resetEditForm();
          setShowBookmarkForm(true);
        }}
        className="h-full min-h-[160px] rounded-2xl border border-dashed border-slate-300 bg-transparent p-6 text-left text-slate-400 transition hover:border-blue-300 hover:bg-white/60 hover:text-blue-700"
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-transparent text-2xl font-semibold">
          +
        </div>

        <h3 className="text-lg font-semibold">Add Bookmark</h3>

        <p className="mt-2 text-sm text-slate-400">
          Save a personal quick link.
        </p>
      </button>
    );
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Loading workspace...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome to Lumens Portal
        </h1>

        <p className="mt-3 text-slate-600">
          Sign in with your authorized Google account to access Lumens resources,
          training, and workspaces.
        </p>

        <button
          type="button"
          onClick={handleLogin}
          disabled={signingIn}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {signingIn ? "Signing in..." : "Login with Google"}
        </button>
      </div>
    );
  }

  return (
    <div id="top">
      <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome to Lumens Portal
            </h1>
          </div>

          <div className="grid min-w-[260px] grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center ring-1 ring-slate-100">
              <div className="text-2xl font-bold text-slate-900">
                {workspaceModules.length}
              </div>
              <div className="mt-1 text-xs text-slate-500">Workspaces</div>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center ring-1 ring-slate-100">
              <div className="text-2xl font-bold text-slate-900">
                {resourceModules.length}
              </div>
              <div className="mt-1 text-xs text-slate-500">Resources</div>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center ring-1 ring-slate-100">
              <div className="text-2xl font-bold text-slate-900">
                {bookmarks.length}
              </div>
              <div className="mt-1 text-xs text-slate-500">Bookmarks</div>
            </div>
          </div>
        </div>
      </section>

      {quickAccessItems.length > 0 && (
        <section className="mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="grid gap-2 md:grid-cols-3">
              {quickAccessItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {showNews && (
        <section className="mb-10">
          <SectionTitle title="Latest News" />

          <div className="mx-auto flex max-w-6xl items-center gap-4">
            <button
              type="button"
              onClick={goToPreviousNews}
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-700 md:flex"
              aria-label="Previous news"
            >
              ‹
            </button>

            <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleNewsItems.map((news, index) => (
                <button
                  key={`${news.id}-${index}`}
                  type="button"
                  onClick={() => setSelectedNews(news)}
                  className="group relative min-h-[118px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="absolute inset-0 bg-blue-900/0 transition group-hover:bg-blue-900/90" />

                  <div className="relative transition group-hover:opacity-20">
                    <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                      <span>◷</span>
                      <span>{news.date}</span>
                    </div>

                    <h3 className="line-clamp-2 text-base font-bold leading-6 text-slate-900">
                      {news.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {news.summary}
                    </p>
                  </div>

                  <div className="absolute inset-0 hidden items-center justify-center text-white group-hover:flex">
                    <div className="flex items-center gap-2 text-base font-semibold">
                      <span>◎</span>
                      <span>View Details</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={goToNextNews}
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-700 md:flex"
              aria-label="Next news"
            >
              ›
            </button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            {mockNews.map((news, index) => (
              <button
                key={news.id}
                type="button"
                onClick={() => setActiveNewsIndex(index)}
                className={`h-2.5 rounded-full transition ${
                  activeNewsIndex === index
                    ? "w-8 bg-blue-700"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to news ${index + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {showActivity && (
        <section className="mb-10">
          <SectionTitle title="Training Activity" />

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Recently Viewed Lessons
              </h3>
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                Recently viewed lessons will appear here.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Recent Discussions
              </h3>
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                Recent discussions will appear here after you join lesson
                discussions.
              </div>
            </div>
          </div>
        </section>
      )}

      {showWorkspaces && (
        <section className="mb-10">
          <SectionTitle id="workspaces" title="My Workspaces" showBackToTop />

          {workspaceModules.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {workspaceModules.map((module) =>
                renderModuleCard(module, "workspace")
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No workspaces are assigned to your account yet.
            </div>
          )}
        </section>
      )}

      {showResources && (
        <section className="mb-10">
          <SectionTitle
            id="resources"
            title="Official Resources"
            showBackToTop
          />

          {resourceModules.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {resourceModules.map((module) =>
                renderModuleCard(module, "resource")
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No official resources are assigned to your account yet.
            </div>
          )}
        </section>
      )}

      {showBookmarks && (
        <section className="mb-10">
          <SectionTitle
            id="bookmarks"
            title="My Bookmarks"
            showBackToTop
            action={
              reorderingBookmarks ? (
                <div className="text-sm text-slate-500">Saving order...</div>
              ) : null
            }
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {bookmarks.map((bookmark) => renderBookmarkCard(bookmark))}
            {renderAddBookmarkCard()}
          </div>
        </section>
      )}

      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-6 bg-blue-900 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedNews.title}
              </h2>

              <button
                type="button"
                onClick={() => setSelectedNews(null)}
                className="text-3xl leading-none text-white/80 hover:text-white"
                aria-label="Close news"
              >
                ×
              </button>
            </div>

            <div className="p-8">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="grid gap-4 md:grid-cols-[160px_1fr]">
                  <div className="font-semibold text-slate-700">
                    Published
                  </div>
                  <div className="text-slate-700">{selectedNews.date}</div>

                  <div className="font-semibold text-slate-700">Audience</div>
                  <div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      {selectedNews.audience}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <h3 className="text-xl font-bold text-slate-900">
                  News Content
                </h3>
                <div className="mt-3 h-1 w-full rounded-full bg-yellow-300" />

                <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-slate-700">
                  {selectedNews.content}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 px-8 py-5">
              <button
                type="button"
                onClick={() => setSelectedNews(null)}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}