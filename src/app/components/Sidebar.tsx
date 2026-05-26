"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useUserProfile } from "@/lib/useUserProfile";
import { getAllModules } from "@/lib/modules";

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, loading } = useUserProfile();

  const [firestoreModules, setFirestoreModules] = useState<any[]>([]);

  const enabledModules = profile?.enabledModules || [];

  useEffect(() => {
    const fetchModules = async () => {
      const data = await getAllModules();
      setFirestoreModules(data);
    };

    if (!loading && profile) {
      fetchModules();
    }
  }, [loading, profile]);

const uniqueModules = firestoreModules;

  const visibleModules = loading
    ? []
    : uniqueModules.filter((module) => {
        if (module.enabled === false) return false;

        if (module.type === "admin") {
          return profile?.role === "admin" && enabledModules.includes(module.id);
        }

        return enabledModules.includes(module.id);
      });

  const grouped = {
    core: visibleModules.filter((m) => m.type === "core"),
    feature: visibleModules.filter((m) => m.type === "feature"),
    admin: visibleModules.filter((m) => m.type === "admin"),
  };

  const renderItem = (item: any) => {
    const isActive = pathname === item.href;

    if (item.moduleKind === "external") {
      return (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`block rounded-lg px-4 py-2 text-sm ${
            isActive
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          {item.name}
        </a>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={`block rounded-lg px-4 py-2 text-sm ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-slate-300 hover:bg-slate-800"
        }`}
      >
        {item.name}
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-slate-950 text-white">
      <div className="border-b border-slate-800 px-6 py-5">
        <h1 className="text-xl font-bold">Lumens Platform</h1>
        <p className="mt-1 text-sm text-slate-400">v0.1.0</p>
      </div>

      <nav className="p-4">
        <div className="space-y-6">
          {grouped.core.length > 0 && (
            <div>
              <div className="mb-2 text-xs text-slate-500">Core</div>
              {grouped.core.map(renderItem)}
            </div>
          )}

          {grouped.feature.length > 0 && (
            <div>
              <div className="mb-2 text-xs text-slate-500">Modules</div>
              {grouped.feature.map(renderItem)}
            </div>
          )}

          {grouped.admin.length > 0 && (
            <div>
              <div className="mb-2 text-xs text-slate-500">Admin</div>
              {grouped.admin.map(renderItem)}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}