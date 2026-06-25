"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import {
  ArrowLeft,
  CalendarClock,
  Eye,
  FileText,
  Megaphone,
  Save,
  Settings2,
} from "lucide-react";
import AdminGuard from "@/app/components/AdminGuard";
import { getNewsById, NewsItem, NewsStatus, updateNews } from "@/lib/news";

const timestampToDateTimeLocalValue = (value?: Timestamp) => {
  if (!value) return "";

  const date = value.toDate();
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const inputToTimestamp = (value: string) => {
  return Timestamp.fromDate(new Date(value));
};

const getStatusBadgeClass = (status: NewsStatus) => {
  if (status === "published") return "bg-emerald-100 text-emerald-700";
  if (status === "archived") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
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

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();

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

    if (!publishedAt) {
      alert("Published At is required.");
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

  if (loadingNews) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
        Loading news...
      </div>
    );
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
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to News
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/news"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft size={16} /> Back to News
        </Link>

        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(status)}`}>
          {status}
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-900 to-blue-800 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <Megaphone size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit News</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/75">
                Update homepage announcement content and publishing settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start gap-3">
            <FileText className="mt-0.5 text-blue-600" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Announcement Content
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Update the title, summary, and full message.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Summary</label>
              <input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <Settings2 className="mt-0.5 text-blue-600" size={20} />
              <div>
                <h2 className="font-semibold text-slate-900">Publish Settings</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Control visibility, order, and audience.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as NewsStatus)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="archived">archived</option>
                </select>
                <p className="mt-1 text-xs text-slate-400">
                  Choose archived instead of permanently removing older announcements.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Audience</label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Published At</label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Homepage Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Smaller numbers appear earlier in the carousel.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3">
              <Eye className="mt-0.5 text-blue-600" size={20} />
              <div>
                <h2 className="font-semibold text-slate-900">Preview</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Approximate homepage card preview.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(status)}`}>
                  {status}
                </span>
                <span className="text-xs text-slate-500">Order {Number(order) || 9999}</span>
              </div>

              <h3 className="mt-4 line-clamp-2 text-lg font-bold text-slate-900">
                {title.trim() || "Untitled announcement"}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                {summary.trim() || "Summary preview will appear here."}
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <CalendarClock size={14} /> {publishedAt || "No publish date"}
              </div>
            </div>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">
            Editing <span className="font-semibold text-slate-900">{title.trim() || "Untitled news"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/news"
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-400"
            >
              <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
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
