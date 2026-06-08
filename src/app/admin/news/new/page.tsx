"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/app/components/AdminGuard";
import { getAllNews, NewsItem } from "@/lib/news";
import { Timestamp } from "firebase/firestore";

const formatDate = (value?: Timestamp | null) => {
  if (!value) return "";

  try {
    return value.toDate().toLocaleString();
  } catch {
    return "";
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-700";
    case "draft":
      return "bg-slate-100 text-slate-600";
    case "archived":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

function AdminNewsContent() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoadingNews(true);

      try {
        const data = await getAllNews();
        setNewsItems(data);
      } catch (error) {
        console.error("Failed to load news:", error);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();
  }, []);

  if (loadingNews) {
    return <div className="text-slate-500">Loading news...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            News Management
          </h1>
          <p className="mt-2 text-slate-600">
            Create and manage homepage announcements.
          </p>
        </div>

        <Link
          href="/admin/news/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create News
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Audience</th>
              <th className="px-4 py-3 font-semibold">Published</th>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {newsItems.map((news) => (
              <tr key={news.id}>
                <td className="max-w-md px-4 py-3">
                  <div className="font-medium text-slate-900">
                    {news.title}
                  </div>
                  <div className="mt-1 line-clamp-1 text-xs text-slate-500">
                    {news.summary}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(
                      news.status
                    )}`}
                  >
                    {news.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {news.audience || "Internal"}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {formatDate(news.publishedAt)}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {news.order ?? 9999}
                </td>

                <td className="px-4 py-3">
                  <Link
                    href={`/admin/news/${news.id}`}
                    className="text-blue-700 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}

            {newsItems.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No news found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminNewsPage() {
  return (
    <AdminGuard>
      <AdminNewsContent />
    </AdminGuard>
  );
}