"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import AdminGuard from "@/app/components/AdminGuard";
import { deleteNews, getNewsById, NewsItem, NewsStatus, updateNews } from "@/lib/news";

const timestampToDateTimeLocalValue = (value?: Timestamp) => {
  if (!value) return "";

  const date = value.toDate();
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const inputToTimestamp = (value: string) => {
  return Timestamp.fromDate(new Date(value));
};

function EditNewsContent() {
  const params = useParams();
  const router = useRouter();
  const newsId = params.newsId as string;

  const [news, setNews] = useState<NewsItem | null>(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("Internal");
  const [status, setStatus] = useState<NewsStatus>("draft");
  const [publishedAt, setPublishedAt] = useState("");
  const [order, setOrder] = useState("9999");

  const [loadingNews, setLoadingNews] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      if (!newsId) return;

      setLoadingNews(true);

      try {
        const data = await getNewsById(newsId);

        if (!data) {
          setNews(null);
          return;
        }

        setNews(data);
        setTitle(data.title || "");
        setSummary(data.summary || "");
        setContent(data.content || "");
        setAudience(data.audience || "Internal");
        setStatus(data.status || "draft");
        setPublishedAt(timestampToDateTimeLocalValue(data.publishedAt));
        setOrder(String(data.order ?? 9999));
      } catch (error) {
        console.error("Failed to load news:", error);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();
  }, [newsId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    const cleanSummary = summary.trim();
    const cleanContent = content.trim();

    if (!cleanTitle) {
      alert("Title is required.");
      return;
    }

    if (!cleanSummary) {
      alert("Summary is required.");
      return;
    }

    if (!cleanContent) {
      alert("Content is required.");
      return;
    }

    setSaving(true);

    try {
      await updateNews(newsId, {
        title: cleanTitle,
        summary: cleanSummary,
        content: cleanContent,
        audience: audience.trim() || "Internal",
        status,
        publishedAt: inputToTimestamp(publishedAt),
        order: Number(order) || 9999,
      });

      router.push("/admin/news");
    } catch (error) {
      console.error("Failed to update news:", error);
      alert("Failed to update news.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this news item?"
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await deleteNews(newsId);
      router.push("/admin/news");
    } catch (error) {
      console.error("Failed to delete news:", error);
      alert("Failed to delete news.");
    } finally {
      setDeleting(false);
    }
  };

  if (loadingNews) {
    return <div className="text-slate-500">Loading news...</div>;
  }

  if (!news) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">News not found</h1>
        <p className="mt-3 text-slate-500">
          This news item does not exist.
        </p>

        <Link
          href="/admin/news"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Back to News
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/news"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            Back to News Management
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Edit News
          </h1>
          <p className="mt-2 text-slate-600">
            Update homepage announcement content and publishing status.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-red-50 px-5 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:text-slate-400"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-400"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Summary
            </label>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Audience
              </label>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NewsStatus)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Published At
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Order
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <Link
          href="/admin/news"
          className="rounded-lg bg-slate-100 px-5 py-2 text-sm text-slate-700 hover:bg-slate-200"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-400"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default function EditNewsPage() {
  return (
    <AdminGuard>
      <EditNewsContent />
    </AdminGuard>
  );
}