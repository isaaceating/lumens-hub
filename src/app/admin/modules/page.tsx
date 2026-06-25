"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Blocks,
  Box,
  Eye,
  EyeOff,
  Filter,
  Globe2,
  LayoutDashboard,
  MonitorUp,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import AdminGuard from "@/app/components/AdminGuard";
import { getAllModules } from "@/lib/modules";

type ModuleScope = "all" | "custom" | "native";
type KindFilter = "all" | "native" | "external" | "embedded";
type SectionFilter = "all" | "workspace" | "resource" | "admin";
type StatusFilter = "all" | "enabled" | "disabled" | "dashboard" | "hidden";
type SortKey = "order" | "name" | "kind" | "section";

const isNativeModule = (module: any) => {
  return module.moduleKind === "native" || module.locked === true;
};

const getSectionLabel = (module: any) => {
  if (module.type === "admin") return "Admin";
  if (module.section === "workspace") return "My Workspace";
  return "Official Resources";
};

const getKindLabel = (module: any) => {
  if (isNativeModule(module)) return "native";
  return module.moduleKind || "external";
};

const normalize = (value: unknown) => String(value || "").trim();

const getModuleUrl = (module: any) => {
  if (module.moduleKind === "embedded") return module.embedUrl || module.href || "";
  return module.href || module.embedUrl || "";
};

const getKindBadgeClass = (kind: string) => {
  if (kind === "native") return "bg-blue-100 text-blue-700";
  if (kind === "embedded") return "bg-purple-100 text-purple-700";
  return "bg-slate-100 text-slate-600";
};

function AdminModulesContent() {
  const [modules, setModules] = useState<any[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [query, setQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<ModuleScope>("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("order");

  useEffect(() => {
    const fetchModules = async () => {
      setLoadingModules(true);

      try {
        const data = await getAllModules();
        setModules(data);
      } catch (error) {
        console.error("Failed to load modules:", error);
      } finally {
        setLoadingModules(false);
      }
    };

    fetchModules();
  }, []);

  const stats = useMemo(() => {
    const custom = modules.filter((module) => !isNativeModule(module));
    const native = modules.filter((module) => isNativeModule(module));
    const embedded = modules.filter((module) => getKindLabel(module) === "embedded");
    const enabled = modules.filter((module) => module.enabled !== false);
    const dashboard = modules.filter((module) => module.showOnDashboard === true);

    return {
      total: modules.length,
      custom: custom.length,
      native: native.length,
      embedded: embedded.length,
      enabled: enabled.length,
      dashboard: dashboard.length,
    };
  }, [modules]);

  const filteredModules = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = modules.filter((module) => {
      const kind = getKindLabel(module);
      const searchable = [
        module.id,
        module.name,
        module.description,
        module.type,
        module.moduleKind,
        module.section,
        module.href,
        module.embedUrl,
      ]
        .map((item) => normalize(item).toLowerCase())
        .join(" ");

      return (
        (!q || searchable.includes(q)) &&
        (scopeFilter === "all" ||
          (scopeFilter === "custom" && !isNativeModule(module)) ||
          (scopeFilter === "native" && isNativeModule(module))) &&
        (kindFilter === "all" || kind === kindFilter) &&
        (sectionFilter === "all" ||
          (sectionFilter === "workspace" && module.section === "workspace") ||
          (sectionFilter === "resource" && module.section !== "workspace" && module.type !== "admin") ||
          (sectionFilter === "admin" && module.type === "admin")) &&
        (statusFilter === "all" ||
          (statusFilter === "enabled" && module.enabled !== false) ||
          (statusFilter === "disabled" && module.enabled === false) ||
          (statusFilter === "dashboard" && module.showOnDashboard === true) ||
          (statusFilter === "hidden" && module.showOnDashboard !== true))
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortKey === "order") {
        const orderA = a.order ?? 9999;
        const orderB = b.order ?? 9999;
        if (orderA !== orderB) return orderA - orderB;
        return normalize(a.name).localeCompare(normalize(b.name));
      }

      if (sortKey === "kind") {
        return getKindLabel(a).localeCompare(getKindLabel(b));
      }

      if (sortKey === "section") {
        return getSectionLabel(a).localeCompare(getSectionLabel(b));
      }

      return normalize(a.name).localeCompare(normalize(b.name));
    });
  }, [modules, query, scopeFilter, kindFilter, sectionFilter, statusFilter, sortKey]);

  const resetFilters = () => {
    setQuery("");
    setScopeFilter("all");
    setKindFilter("all");
    setSectionFilter("all");
    setStatusFilter("all");
    setSortKey("order");
  };

  if (loadingModules) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
        Loading modules...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
            <Blocks size={14} /> Admin Console
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Module Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage custom modules, review native modules, and control Dashboard,
            Sidebar, external link, and embedded module behavior.
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
            href="/admin/modules/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={16} /> Create Module
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-6">
        <button type="button" onClick={() => setScopeFilter("all")} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-slate-500">Total</div><Blocks size={18} className="text-slate-400" /></div>
          <div className="mt-3 text-3xl font-bold text-slate-900">{stats.total}</div>
        </button>

        <button type="button" onClick={() => setScopeFilter("custom")} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-left shadow-sm transition hover:bg-emerald-100">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-emerald-700">Custom</div><Box size={18} className="text-emerald-500" /></div>
          <div className="mt-3 text-3xl font-bold text-emerald-900">{stats.custom}</div>
        </button>

        <button type="button" onClick={() => setScopeFilter("native")} className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-left shadow-sm transition hover:bg-blue-100">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-blue-700">Native</div><ShieldCheck size={18} className="text-blue-500" /></div>
          <div className="mt-3 text-3xl font-bold text-blue-900">{stats.native}</div>
        </button>

        <button type="button" onClick={() => setKindFilter("embedded")} className="rounded-2xl border border-purple-100 bg-purple-50 p-5 text-left shadow-sm transition hover:bg-purple-100">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-purple-700">Embedded</div><MonitorUp size={18} className="text-purple-500" /></div>
          <div className="mt-3 text-3xl font-bold text-purple-900">{stats.embedded}</div>
        </button>

        <button type="button" onClick={() => setStatusFilter("enabled")} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-slate-500">Enabled</div><Eye size={18} className="text-slate-400" /></div>
          <div className="mt-3 text-3xl font-bold text-slate-900">{stats.enabled}</div>
        </button>

        <button type="button" onClick={() => setStatusFilter("dashboard")} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
          <div className="flex items-center justify-between"><div className="text-sm font-medium text-slate-500">Dashboard</div><LayoutDashboard size={18} className="text-slate-400" /></div>
          <div className="mt-3 text-3xl font-bold text-slate-900">{stats.dashboard}</div>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700"><Filter size={16} /> Filters</div>
        <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(5,minmax(0,1fr))]">
          <label className="relative block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50" placeholder="Search name, id, description, url..." />
          </label>

          <select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value as ModuleScope)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50">
            <option value="all">Scope · All</option><option value="custom">Custom</option><option value="native">Native</option>
          </select>

          <select value={kindFilter} onChange={(event) => setKindFilter(event.target.value as KindFilter)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50">
            <option value="all">Kind · All</option><option value="native">Native</option><option value="external">External</option><option value="embedded">Embedded</option>
          </select>

          <select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value as SectionFilter)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50">
            <option value="all">Section · All</option><option value="workspace">My Workspace</option><option value="resource">Official Resources</option><option value="admin">Admin</option>
          </select>

          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50">
            <option value="all">Status · All</option><option value="enabled">Enabled</option><option value="disabled">Disabled</option><option value="dashboard">Shown on Dashboard</option><option value="hidden">Hidden from Dashboard</option>
          </select>

          <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50">
            <option value="order">Sort · Order</option><option value="name">Sort · Name</option><option value="kind">Sort · Kind</option><option value="section">Sort · Section</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div><h2 className="font-semibold text-slate-900">Modules</h2><p className="mt-1 text-xs text-slate-500">Showing {filteredModules.length} of {modules.length} modules.</p></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-3 font-semibold">Module</th><th className="px-5 py-3 font-semibold">Kind</th><th className="px-5 py-3 font-semibold">Section</th><th className="px-5 py-3 font-semibold">Visibility</th><th className="px-5 py-3 font-semibold">Route / URL</th><th className="px-5 py-3 font-semibold">Order</th><th className="px-5 py-3 font-semibold">Action</th></tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredModules.map((module) => {
                const native = isNativeModule(module);
                const kind = getKindLabel(module);
                const url = getModuleUrl(module);

                return (
                  <tr key={module.id} className="transition hover:bg-slate-50/80">
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">{kind === "embedded" ? <MonitorUp size={18} /> : <Globe2 size={18} />}</div>
                        <div className="min-w-0"><div className="font-semibold text-slate-900">{module.name || module.id}</div><div className="mt-1 break-all font-mono text-xs text-slate-500">{module.id}</div>{module.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{module.description}</p>}</div>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top"><div className="flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getKindBadgeClass(kind)}`}>{kind}</span>{native && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">locked</span>}</div></td>
                    <td className="px-5 py-4 align-top text-slate-600">{getSectionLabel(module)}</td>
                    <td className="px-5 py-4 align-top"><div className="flex flex-wrap gap-2"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${module.enabled !== false ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{module.enabled !== false ? <Eye size={13} /> : <EyeOff size={13} />}{module.enabled !== false ? "Enabled" : "Disabled"}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${module.showOnDashboard ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{module.showOnDashboard ? "Dashboard" : "Hidden"}</span></div></td>
                    <td className="max-w-[280px] px-5 py-4 align-top text-slate-600"><div className="truncate" title={url || ""}>{url || "—"}</div>{module.moduleKind === "embedded" && <div className="mt-1 font-mono text-xs text-slate-400">/modules/{module.id}</div>}</td>
                    <td className="px-5 py-4 align-top"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{module.order ?? "—"}</span></td>
                    <td className="px-5 py-4 align-top"><Link href={`/admin/modules/${module.id}`} className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700">Manage</Link></td>
                  </tr>
                );
              })}

              {filteredModules.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500">No modules match the current filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminModulesPage() {
  return (
    <AdminGuard>
      <AdminModulesContent />
    </AdminGuard>
  );
}
