"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  BadgeCheck,
  CalendarClock,
  Filter,
  Megaphone,
  Newspaper,
  PauseCircle,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import AdminGuard from "@/app/components/AdminGuard";
import {
  getAllNews,
  getNewsCarouselSettings,
  NewsCarouselSettings,
  NewsItem,
  NewsStatus,
  updateNewsCarouselSettings,
} from "@/lib/news";
import { Timestamp } from "firebase/firestore";

type SortKey = "order" | "publishedAt" | "title" | "status";

type StatusFilter = NewsStatus | "all";

const formatDate = (value?: Timestamp | null) => {
  if (!value) return "—";

  try {
    return value.toDate().toLocaleString();
  } catch {
    return "—";
  }
};

const toMillis = (value?: Timestamp | null) => {
  if (!value) return 0;

  try {
    return value.toMillis();
  } catch {
    return 0;
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "published":
      return "bg-emerald-100 text-emerald-700";
    case "draft":
      return "bg-slate-100 text-slate-600";
    case "archived":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const normalize = (value: unknown) => String(value || "").trim();

const uniqueAudiences = (items: NewsItem[]) => {
  return Array.from(
    new Set(items.map((item) => normalize(item.audience || "Internal"))),
  ).sort((a, b) => a.localeCompare(b));
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
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("order");

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

  const stats = useMemo(() => {
    const published = newsItems.filter((item) => item.status === "published");
    const drafts = newsItems.filter((item) => item.status === "draft");
    const archived = newsItems.filter((item) => item.status === "archived");

    return {
      total: newsItems.length,
      published: published.length,
      drafts: drafts.length,
      archived: archived.length,
    };
  }, [newsItems]);

  const audienceOptions = useMemo(() => uniqueAudiences(newsItems), [newsItems]);

  const filteredNews = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = newsItems.filter((news) => {
      const searchable = [
        news.title,
        news.summary,
        news.content,
        news.audience,
        news.status,
      ]
        .map((item) => normalize(item).toLowerCase())
        .join(" ");

      return (
        (!q || searchable.includes(q)) &&
        (statusFilter === "all" || news.status === statusFilter) &&
        (audienceFilter === "all" ||
          normalize(news.audience || "Internal") === audienceFilter)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortKey === "publishedAt") {
        return toMillis(b.publishedAt) - toMillis(a.publishedAt);
      }

      if (sortKey === "order") {
        const orderA = a.order ?? 9999;
        const orderB = b.order ?? 9999;

        if (orderA !== orderB) return orderA - orderB;
        return toMillis(b.publishedAt) - toMillis(a.publishedAt);
      }

      return normalize(a[sortKey]).localeCompare(normalize(b[sortKey]));
    });
  }, [newsItems, query, statusFilter, audienceFilter, sortKey]);

  const handleSaveCarouselSettings = async () => {
    setSavingSettings(true);
    setSettingsSaved(false);

    try {
      await updateNewsCarouselSettings({
        autoSlideEnabled: carouselSettings.autoSlideEnabled,
        autoSlideSeconds: carouselSettings.autoSlideSeconds,
      });

      setSettingsSaved(true);

      setTimeout(() => {
        setSettingsSaved(false);
      }, 2500);
    } catch (error) {
      console.error("Failed to save carousel settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSavingSettings(false);
    }
  };

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setAudienceFilter("all");
    setSortKey("order");
  };

  if (loadingNews) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
        Loading news...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
            <Newspaper size={14} /> Admin Console
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            News Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Create and manage homepage announcements, publishing status, audience,
            and carousel behavior.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <SlidersHorizontal size={16} /> Reset view
          </button>

          <Link
            href="/admin/news/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={16} /> Create News
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-500">Total News</div>
            <Newspaper size={18} className="text-slate-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-900">
            {stats.total}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("published")}
          className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-left shadow-sm transition hover:bg-emerald-100"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-emerald-700">Published</div>
            <BadgeCheck size={18} className="text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-bold text-emerald-900">
            {stats.published}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("draft")}
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-500">Drafts</div>
            <PauseCircle size={18} className="text-slate-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-900">
            {stats.drafts}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("archived")}
          className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-left shadow-sm transition hover:bg-amber-100"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-amber-700">Archived</div>
            <Archive size={18} className="text-amber-500" />
          </div>
          <div className="mt-3 text-3xl font-bold text-amber-900">
            {stats.archived}
          </div>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Settings2 className="mt-0.5 text-blue-600" size={20} />
            <div>
              <h2 className="font-semibold text-slate-900">
                News Carousel Settings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Control how the homepage Newsroom carousel rotates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {settingsSaved && (
              <span className="text-sm font-medium text-green-600">
                Saved.
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveCarouselSettings}
              disabled={savingSettings}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {savingSettings ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label
            className={`rounded-xl border p-4 transition ${
              carouselSettings.autoSlideEnabled
                ? "border-blue-200 bg-blue-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
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
              <span className="text-sm font-medium text-slate-700">
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
              className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            >
              <option value={2}>2 seconds</option>
              <option value={3}>3 seconds</option>
              <option value={4}>4 seconds</option>
              <option value={5}>5 seconds</option>
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter size={16} /> Filters
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))]">
          <label className="relative block">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              placeholder="Search title, summary, content, audience..."
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="all">Status · All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={audienceFilter}
            onChange={(event) => setAudienceFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="all">Audience · All</option>
            {audienceOptions.map((audience) => (
              <option key={audience} value={audience}>
                {audience}
              </option>
            ))}
          </select>

          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="order">Sort · Homepage order</option>
            <option value="publishedAt">Sort · Latest published</option>
            <option value="title">Sort · Title</option>
            <option value="status">Sort · Status</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">News Items</h2>
            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredNews.length} of {newsItems.length} announcements.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Announcement</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Audience</th>
                <th className="px-5 py-3 font-semibold">Published</th>
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredNews.map((news) => (
                <tr key={news.id} className="transition hover:bg-slate-50/80">
                  <td className="max-w-md px-5 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <Megaphone size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900">
                          {news.title}
                        </div>
                        <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {news.summary}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(
                        news.status,
                      )}`}
                    >
                      {news.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 align-top text-slate-600">
                    {news.audience || "Internal"}
                  </td>

                  <td className="px-5 py-4 align-top text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarClock size={15} className="text-slate-400" />
                      {formatDate(news.publishedAt)}
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {news.order ?? 9999}
                    </span>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <Link
                      href={`/admin/news/${news.id}`}
                      className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredNews.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No news match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
