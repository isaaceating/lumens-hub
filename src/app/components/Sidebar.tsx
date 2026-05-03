"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { modules } from "../config/modules";
import { useUserProfile } from "@/lib/useUserProfile";

export default function Sidebar() {
  const pathname = usePathname();

  const { profile, loading } = useUserProfile();

  const enabledModules = profile?.enabledModules || [];

  const visibleModules = loading
    ? []
    : modules.filter((module) => enabledModules.includes(module.id));

  const grouped = {
    core: visibleModules.filter((m) => m.type === "core"),
    feature: visibleModules.filter((m) => m.type === "feature"),
    admin: visibleModules.filter((m) => m.type === "admin"),
  };

  const renderItem = (item: any) => {
    const isActive = pathname === item.href;

    return (
      <Link
        key={item.href}
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
        <h1 className="text-xl font-bold">Lumens HUB</h1>
        <p className="mt-1 text-sm text-slate-400">v0 Platform</p>
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