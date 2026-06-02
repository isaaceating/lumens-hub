"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUserProfile } from "@/lib/useUserProfile";
import { getAllModules } from "@/lib/modules";

const getModuleHref = (module: any) => {
  if (module.moduleKind === "embedded") {
    return `/modules/${module.id}`;
  }

  return module.href || "#";
};

export default function DashboardPage() {
  const { profile, loading } = useUserProfile();
  const [modules, setModules] = useState<any[]>([]);

  const enabledModules = profile?.enabledModules || [];

  useEffect(() => {
    const fetchModules = async () => {
      const data = await getAllModules();
      setModules(data);
    };

    if (!loading && profile) {
      fetchModules();
    }
  }, [loading, profile]);

  const visibleResources = modules.filter(
    (module) =>
      module.enabled !== false &&
      module.showOnDashboard &&
      module.type === "feature" &&
      enabledModules.includes(module.id)
  );

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

  const renderAddBookmarkCard = () => {
    return (
      <button
        type="button"
        onClick={() =>
          alert("Bookmark feature will be added in the next version.")
        }
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
          {renderAddBookmarkCard()}
        </div>
      </section>
    </div>
  );
}