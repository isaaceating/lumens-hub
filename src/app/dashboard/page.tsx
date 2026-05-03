"use client";

import Link from "next/link";
import { modules } from "../config/modules";
import { signInWithGoogle, logout } from "@/lib/auth";
import { useUserProfile } from "@/lib/useUserProfile";

export default function DashboardPage() {
  const { user, profile, loading } = useUserProfile();

  const enabledModules = profile?.enabledModules || [];

  const visibleModules = modules.filter(
    (module) =>
      module.showOnDashboard && enabledModules.includes(module.id)
  );

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
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Welcome to Lumens HUB. Select a module to get started.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibleModules.map((module) => (
          <Link
            key={module.id}
            href={module.href}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-700">
              {module.name.charAt(0)}
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              {module.name}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Open {module.name} module
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}