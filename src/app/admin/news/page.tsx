"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/app/components/AdminGuard";
import {
  getAllNews,
  getNewsCarouselSettings,
  NewsCarouselSettings,
  NewsItem,
  updateNewsCarouselSettings,
} from "@/lib/news";
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
  const [carouselSettings, setCarouselSettings] =
    useState<NewsCarouselSettings>({
      autoSlideEnabled: true,
      autoSlideSeconds: 2,
    });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingNews(true);

      try {
        const [newsData, settingsData] = await Promise.all([
          getAllNews(),
          getNewsCarouselSettings(),
        ]);

        setNewsItems(newsData);
        setCarouselSettings(settingsData);
      } catch (error) {
        console.error("Failed to load news management data:", error);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveCarouselSettings = async () => {
    setSavingSettings(true);

    try {
      await updateNewsCarouselSettings({
        autoSlideEnabled: carouselSettings.autoSlideEnabled,
        autoSlideSeconds: carouselSettings.autoSlideSeconds,
      });

      alert("News carousel settings saved.");
    } catch (error) {
      console.error("Failed to save carousel settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSavingSettings(false);
    }
  };

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

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              News Carousel Settings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Control how the homepage Newsroom carousel rotates.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveCarouselSettings}
            disabled={savingSettings}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {savingSettings ? "Saving..." : "Save Settings"}
          </button>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Enable auto slide
            </div>
            <div className="mt-2 text-xs leading-5 text-slate-500">
              Automatically move the Newsroom carousel.
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="checkbox"
                checked={carouselSettings.autoSlideEnabled}
                onChange={(e) =>
                  setCarouselSettings((prev) => ({
                    ...prev,
                    autoSlideEnabled: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">
                {carouselSettings.autoSlideEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </label>

          <label className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Slide interval
            </div>
            <div className="mt-2 text-xs leading-5 text-slate-500">
              Choose how often the carousel moves.
            </div>

            <select
              value={carouselSettings.autoSlideSeconds}
              onChange={(e) =>
                setCarouselSettings((prev) => ({
                  ...prev,
                  autoSlideSeconds: Number(e.target.value) as 2 | 3 | 4 | 5,
                }))
              }
              className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <option value={2}>2 seconds</option>
              <option value={3}>3 seconds</option>
              <option value={4}>4 seconds</option>
              <option value={5}>5 seconds</option>
            </select>
          </label>
        </div>
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