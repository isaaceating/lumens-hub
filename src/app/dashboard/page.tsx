"use client";

import { useState } from "react";
import Link from "next/link";
import { modules } from "../config/modules";
import { mockUser } from "../config/mockUser";
import { signInWithGoogle, logout } from "@/lib/auth";
import { useEffect } from "react";
import { onUserChange } from "@/lib/auth";

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onUserChange((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const visibleModules = modules.filter(
    (module) =>
      module.showOnDashboard && mockUser.enabledModules.includes(module.id)
  );

  return (
    <div>
      <div className="mb-6 flex gap-3">
        {user && (
        <div className="ml-4 text-sm text-slate-700">
          <div>Hi {user.displayName} 👋</div>
          <div className="text-slate-500">{user.email}</div>
        </div>
        )}
        <button
          onClick={async () => {
            const u = await signInWithGoogle();
            setUser(u);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
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