"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signInWithGoogle, logout } from "@/lib/auth";
import { useUserProfile } from "@/lib/useUserProfile";
import { getAllModules } from "@/lib/modules";

const getModuleHref = (module: any) => {
  if (module.moduleKind === "embedded") {
    return `/modules/${module.id}`;
  }

  return module.href || "#";
};

export default function DashboardPage() {
  const { user, profile, loading } = useUserProfile();
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

  const visibleModules = modules.filter(
    (module) =>
      module.enabled !== false &&
      module.showOnDashboard &&
      enabledModules.includes(module.id)
  );

  const renderModuleCard = (module: any) => {
    const href = getModuleHref(module);

    const cardContent = (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-700">
          {module.name?.charAt(0)}
        </div>

        <h2 className="text-lg font-semibold text-slate-900">
          {module.name}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {module.description || `Open ${module.name} module`}
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

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        {loading ? (
          <div className="text-sm text-slate-500">Loading user...</div>
        ) : user ? (
          <div className="text-sm text-slate-700">
            <div>Hi {user.displayName} 👋</div>
            <div className="text-slate-500">{user.email}</div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Not signed in</div>
        )}

        <button
          onClick={signInWithGoogle}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Login with Google
        </button>

        <button
          onClick={logout}
          className="rounded-lg bg-slate-600 px-4 py-2 text-white hover:bg-slate-700"
        >
          Logout
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Home</h1>
        <p className="mt-2 text-slate-600">Welcome to Lumens platform.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibleModules.map((module) => renderModuleCard(module))}
      </div>
    </div>
  );
}