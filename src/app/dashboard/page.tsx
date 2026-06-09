"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Timestamp } from "firebase/firestore";
import {
  ArrowRight,
  BookOpen,
  LayoutGrid,
  Library,
  MessageSquareText,
  Star,
} from "lucide-react";
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
import { getPublishedNews, NewsItem } from "@/lib/news";

type DashboardSectionKey =
  | "news"
  | "activity"
  | "workspaces"
  | "resources"
  | "bookmarks";

const getModuleHref = (module: any) => {
  if (module.moduleKind === "embedded") {
    return `/modules/${module.id}`;
  }

  return module.href || "#";
};

const getNewsDate = (value?: Timestamp | string | Date | null) => {
  if (!value) return null;

  try {
    if (value instanceof Timestamp) {
      return value.toDate();
    }

    if (typeof value === "object" && "toDate" in value) {
      return (value as any).toDate();
    }

    if (typeof value === "object" && "seconds" in value) {
      return new Date((value as any).seconds * 1000);
    }

    return new Date(value);
  } catch {
    return null;
  }
};

const formatNewsDate = (value?: Timestamp | string | Date | null) => {
  const date = getNewsDate(value);

  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString();
};

const isNewNews = (value?: Timestamp | string | Date | null) => {
  const date = getNewsDate(value);

  if (!date || Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays >= 0 && diffDays <= 7;
};

const renderLinkedText = (text?: string) => {
  if (!text) return null;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900"
        >
          {part}
        </a>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
};

const WorkspaceIcon = () => (
  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
    <LayoutGrid size={21} strokeWidth={2.1} />
  </div>
);

const ResourceIcon = () => (
  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
    <Library size={21} strokeWidth={2.1} />
  </div>
);

const BookmarkIcon = () => (
  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
    <Star size={21} strokeWidth={2.1} />
  </div>
);

const SectionTitle = ({
  id,
  title,
  description,
  action,
  showBackToTop = false,
  align = "left",
}: {
  id?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  showBackToTop?: boolean;
  align?: "left" | "center";
}) => {
  if (align === "center") {
    return (
      <div id={id} className="mb-6 scroll-mt-24 text-center">
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-blue-600" />

        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}

        {(action || showBackToTop) && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
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
        )}
      </div>
    );
  }

  return (
    <div
      id={id}
      className="mb-5 flex scroll-mt-24 flex-wrap items-end justify-between gap-3"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1.5 h-6 w-1 rounded-full bg-blue-600" />

        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          )}
        </div>
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
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

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
    const fetchNews = async () => {
      if (!user) return;

      setLoadingNews(true);

      try {
        const data = await getPublishedNews();
        setNewsItems(data);
        setActiveNewsIndex(0);
      } catch (error) {
        console.error("Failed to load news:", error);
      } finally {
        setLoadingNews(false);
      }
    };

    if (!loading && user) {
      fetchNews();
    }
  }, [loading, user]);

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
    if (newsItems.length <= 3) {
      return newsItems.map((news, index) => ({
        news,
        position: index === activeNewsIndex ? "active" : "side",
      }));
    }

    const previousIndex =
      activeNewsIndex === 0 ? newsItems.length - 1 : activeNewsIndex - 1;
    const nextIndex = (activeNewsIndex + 1) % newsItems.length;

    return [
      { news: newsItems[previousIndex], position: "side" },
      { news: newsItems[activeNewsIndex], position: "active" },
      { news: newsItems[nextIndex], position: "side" },
    ].filter((item) => item.news);
  }, [activeNewsIndex, newsItems]);

  const quickAccessItems = [
    {
      key: "workspaces",
      label: "My Workspaces",
      description: "Open your assigned working areas.",
      href: "#workspaces",
      enabled: showWorkspaces,
      icon: LayoutGrid,
    },
    {
      key: "resources",
      label: "Official Resources",
      description: "Find official tools and reference materials.",
      href: "#resources",
      enabled: showResources,
      icon: Library,
    },
    {
      key: "bookmarks",
      label: "My Bookmarks",
      description: "Access your saved personal links.",
      href: "#bookmarks",
      enabled: showBookmarks,
      icon: Star,
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
    if (newsItems.length === 0) return;

    setActiveNewsIndex((prev) =>
      prev === 0 ? newsItems.length - 1 : prev - 1
    );
  };

  const goToNextNews = () => {
    if (newsItems.length === 0) return;

    setActiveNewsIndex((prev) => (prev + 1) % newsItems.length);
  };

  const renderModuleCard = (module: any, section: "workspace" | "resource") => {
    const href = getModuleHref(module);
    const Icon = section === "workspace" ? WorkspaceIcon : ResourceIcon;

    const cardContent = (
      <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
        <Icon />

        <h3 className="text-lg font-semibold text-slate-900">
          {module.name}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
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
      <section className="mb-10 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-slate-100 p-7 shadow-sm">
        <div className="relative">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-44 w-44 rounded-full bg-cyan-100/60 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="mb-3 inline-flex items-center rounded-full border border-blue-100 bg-white/70 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700 shadow-sm">
                  Lumens Portal
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                  Welcome to Lumens Portal
                </h1>

                <p className="mt-3 text-lg font-medium text-slate-600">
                  Your Success, Our Focus
                </p>
              </div>
            </div>

            {quickAccessItems.length > 0 && (
              <div className="mt-7 rounded-2xl border border-white/80 bg-white/75 p-2 shadow-sm backdrop-blur">
                <div className="grid gap-2 md:grid-cols-3">
                  {quickAccessItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <a
                        key={item.key}
                        href={item.href}
                        className="group flex items-center gap-4 rounded-xl border border-blue-100/70 bg-blue-50/55 px-4 py-4 shadow-sm transition hover:border-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-md"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/80 text-blue-700 ring-1 ring-blue-100 transition group-hover:bg-white/15 group-hover:text-white group-hover:ring-white/20">
                          <Icon size={21} strokeWidth={2.1} />
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 transition group-hover:text-white">
                            {item.label}
                          </div>
                          <div className="mt-0.5 line-clamp-1 text-sm text-slate-500 transition group-hover:text-blue-50">
                            {item.description}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {showNews && (
        <section className="mb-10">
          <SectionTitle title="Newsroom" align="center" />

          {loadingNews ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Loading news...
            </div>
          ) : newsItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No published news yet.
            </div>
          ) : (
            <>
              <div className="mx-auto flex max-w-6xl items-center gap-4">
                <button
                  type="button"
                  onClick={goToPreviousNews}
                  className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-700 md:flex"
                  aria-label="Previous news"
                >
                  ‹
                </button>

                <div className="grid flex-1 items-center gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleNewsItems.map(({ news, position }, index) => {
                    const active = position === "active";

                    return (
                      <button
                        key={`${news.id}-${index}`}
                        type="button"
                        onClick={() => setSelectedNews(news)}
                        className={`group relative h-[154px] overflow-hidden rounded-2xl border bg-white p-4 text-left transition ${
                          active
                            ? "border-blue-500 shadow-md ring-4 ring-blue-50 xl:scale-[1.03]"
                            : "border-slate-200 shadow-sm hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                        }`}
                      >
                        <div
                          className={`absolute inset-x-0 top-0 h-1 ${
                            active ? "bg-blue-600" : "bg-transparent"
                          }`}
                        />

                        <div className="absolute inset-0 bg-blue-900/0 transition group-hover:bg-blue-900/90" />

                        <div className="relative flex h-full flex-col transition group-hover:opacity-20">
                          <div className="mb-3 flex h-5 items-center gap-2 text-xs text-slate-400">
                            <span className="text-[11px]">◷</span>
                            <span>{formatNewsDate(news.publishedAt)}</span>

                            {isNewNews(news.publishedAt) && (
                              <span className="rounded-full border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-yellow-700">
                                NEW
                              </span>
                            )}
                          </div>

                          <h3 className="line-clamp-2 min-h-[48px] text-base font-bold leading-6 text-slate-900">
                            {news.title}
                          </h3>

                          <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-slate-500">
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
                    );
                  })}
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

              <div className="mt-6 flex items-center justify-center gap-2">
                {newsItems.map((news, index) => (
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
            </>
          )}
        </section>
      )}

      {showActivity && (
        <section className="mb-10">
          <SectionTitle title="Learning Hub" align="center" />

          <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
            <Link
              href="/training"
              className="group flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 transition group-hover:scale-105">
                <BookOpen size={26} strokeWidth={2.1} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Continue Learning
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Pick up your previous lesson.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 transition group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600">
                Continue
                <ArrowRight size={16} strokeWidth={2.2} />
              </div>
            </Link>

            <Link
              href="/training"
              className="group flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-200 transition group-hover:scale-105">
                <MessageSquareText size={26} strokeWidth={2.1} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Recent Discussion
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                See your latest conversation.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm ring-1 ring-cyan-100 transition group-hover:bg-cyan-600 group-hover:text-white group-hover:ring-cyan-600">
                View Discussion
                <ArrowRight size={16} strokeWidth={2.2} />
              </div>
            </Link>
          </div>
        </section>
      )}

      {showWorkspaces && (
        <section className="mb-10">
          <SectionTitle
            id="workspaces"
            title="My Workspaces"
            description="Access your assigned working areas and internal tools."
            showBackToTop
          />

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
            description="Find official tools, references, and shared materials."
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
            description="Save and organize your personal quick links."
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
                  <div className="flex flex-wrap items-center gap-2 text-slate-700">
                    <span>{formatNewsDate(selectedNews.publishedAt)}</span>

                    {isNewNews(selectedNews.publishedAt) && (
                      <span className="rounded-full border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-xs font-bold tracking-wide text-yellow-700">
                        NEW
                      </span>
                    )}
                  </div>

                  <div className="font-semibold text-slate-700">Audience</div>
                  <div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      {selectedNews.audience || "Internal"}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-700">Summary</div>
                  <div className="whitespace-pre-wrap leading-7 text-slate-700">
                    {renderLinkedText(selectedNews.summary)}
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <h3 className="text-xl font-bold text-slate-900">
                  News Content
                </h3>
                <div className="mt-3 h-1 w-full rounded-full bg-yellow-300" />

                <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-slate-700">
                  {renderLinkedText(selectedNews.content)}
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