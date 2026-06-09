"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import AdminGuard from "@/app/components/AdminGuard";
import { createNews, NewsStatus } from "@/lib/news";

const toDateTimeLocalValue = (date: Date) => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const inputToTimestamp = (value: string) => {
  return Timestamp.fromDate(new Date(value));
};

function NewNewsContent() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("Internal");
  const [status, setStatus] = useState<NewsStatus>("draft");
  const [publishedAt, setPublishedAt] = useState(
    toDateTimeLocalValue(new Date())
  );
  const [order, setOrder] = useState("1");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
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
      await createNews({
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
      console.error("Failed to create news:", error);
      alert("Failed to create news.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/news"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            Back to News Management
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Create News
          </h1>
          <p className="mt-2 text-slate-600">
            Create a homepage announcement.
          </p>
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
              placeholder="PDM Training content has been updated"
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
              placeholder="Short summary shown on the news card."
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
              placeholder="Full announcement content..."
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
          {saving ? "Creating..." : "Create News"}
        </button>
      </div>
    </form>
  );
}

export default function NewNewsPage() {
  return (
    <AdminGuard>
      <NewNewsContent />
    </AdminGuard>
  );
}