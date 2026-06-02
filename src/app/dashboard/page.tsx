"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signInWithGoogle } from "@/lib/auth";
import { useUserProfile } from "@/lib/useUserProfile";
import { getAllModules } from "@/lib/modules";
import {
  createUserBookmark,
  deleteUserBookmark,
  getUserBookmarks,
  updateUserBookmark,
} from "@/lib/bookmarks";

const getModuleHref = (module: any) => {
  if (module.moduleKind === "embedded") {
    return `/modules/${module.id}`;
  }

  return module.href || "#";
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

  const [signingIn, setSigningIn] = useState(false);

  const enabledModules = profile?.enabledModules || [];

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

  const visibleResources = modules.filter(
    (module) =>
      module.enabled !== false &&
      module.showOnDashboard &&
      module.type === "feature" &&
      enabledModules.includes(module.id)
  );

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

  const renderResourceCard = (module: any) => {
    const href = getModuleHref(module);

    const cardContent = (
      <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-700">
          {module.name?.charAt(0)}
        </div>

        <h3 className="text-lg font-semibold text-slate-900">
          {module.name}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          {module.description || "Open this resource."}
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
        className="group relative h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      >
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-700">
            {bookmark.name?.charAt(0)}
          </div>

          <h3 className="text-lg font-semibold text-slate-900">
            {bookmark.name}
          </h3>

          <p className="mt-2 truncate text-sm text-slate-500">
            {bookmark.url}
          </p>
        </a>

        <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition group-hover:opacity-100">
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
        className="h-full min-h-[160px] rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl font-semibold text-slate-700">
          +
        </div>

        <h3 className="text-lg font-semibold text-slate-900">
          Add Bookmark
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Save a personal quick link for frequently used websites or tools.
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
          Welcome to Lumens Platform
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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Workspace</h1>
        <p className="mt-2 text-slate-600">
          Access your authorized Lumens resources, training, and workspaces.
        </p>
      </div>

      <section className="mb-12">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Official Resources
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Resources assigned to your account.
          </p>
        </div>

        {visibleResources.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleResources.map((module) => renderResourceCard(module))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No official resources are assigned to your account yet.
          </div>
        )}
      </section>

      <section id="bookmarks">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            My Bookmarks
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your personal quick links.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {bookmarks.map((bookmark) => renderBookmarkCard(bookmark))}
          {renderAddBookmarkCard()}
        </div>
      </section>
    </div>
  );
}